<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Receta;
use App\Models\Ingrediente;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class AIRecipeController extends Controller
{
    /**
     * Modelos de Gemini por defecto (en orden de preferencia).
     * Se pueden cambiar sin tocar código con GEMINI_MODELS en el .env
     * (lista separada por comas). Mira debugGemini -> modelos_disponibles.
     *
     * NOTA: gemini-2.5-flash y gemini-2.5-flash-lite están apagados (404).
     */
    private const GEMINI_MODELOS_DEFECTO = 'gemini-3.8-flash,gemini-3.5-flash-lite';

    /** Modelos por defecto de los proveedores compatibles con OpenAI (respaldo). */
    private const MODELOS_OPENAI_DEFECTO = [
        'groq' => 'llama-3.3-70b-versatile',
        'openrouter' => 'openai/gpt-oss-120b:free',
    ];

    private const URLS_OPENAI = [
        'groq' => 'https://api.groq.com/openai/v1/chat/completions',
        'openrouter' => 'https://openrouter.ai/api/v1/chat/completions',
    ];

    /** Estados HTTP transitorios que merecen un reintento rápido. */
    private const ESTADOS_REINTENTABLES = [429, 500, 502, 503, 504];

    private const INGREDIENTES_DEFECTO = [
        'cebolla',
        'ajo',
        'tomate',
        'aceite de oliva',
        'sal',
        'pimienta',
        'perejil',
        'huevos',
        'patatas',
        'arroz'
    ];

    /** Proveedor/modelo que respondió en la última llamada (para logs y debug). */
    private ?string $proveedorUsado = null;

    // ------------------------------------------------------------------
    //  Capa de IA (Gemini + respaldos compatibles con OpenAI)
    // ------------------------------------------------------------------

    /**
     * Lista ordenada de proveedores/modelos disponibles según la configuración.
     * Solo se incluyen los que tienen API key.
     */
    private function candidatos(): array
    {
        $candidatos = [];

        $geminiKey = config('services.gemini.api_key');
        if (!empty($geminiKey)) {
            $modelos = config('services.gemini.models') ?: self::GEMINI_MODELOS_DEFECTO;
            if (is_string($modelos)) {
                $modelos = array_filter(array_map('trim', explode(',', $modelos)));
            }
            foreach ($modelos as $modelo) {
                $candidatos[] = [
                    'tipo' => 'gemini',
                    'nombre' => "gemini/{$modelo}",
                    'modelo' => $modelo,
                    'key' => $geminiKey,
                ];
            }
        }

        foreach (self::URLS_OPENAI as $proveedor => $url) {
            $key = config("services.{$proveedor}.api_key");
            $modelo = config("services.{$proveedor}.model") ?: self::MODELOS_OPENAI_DEFECTO[$proveedor];

            if (!empty($key) && !empty($modelo)) {
                $candidatos[] = [
                    'tipo' => 'openai',
                    'nombre' => "{$proveedor}/{$modelo}",
                    'modelo' => $modelo,
                    'key' => $key,
                    'url' => $url,
                ];
            }
        }

        return $candidatos;
    }

    private function hayProveedoresIA(): bool
    {
        return count($this->candidatos()) > 0;
    }

    /**
     * Limpia el string JSON de caracteres de control y otros problemas
     */
    private function limpiarJsonString($content)
    {
        // Eliminar caracteres de control excepto \n, \r, \t
        $content = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $content);

        // Eliminar BOM (Byte Order Mark) si existe
        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content);

        // Limpiar posibles bloques de código markdown
        $content = preg_replace('/```json\s*/i', '', $content);
        $content = preg_replace('/```\s*$/i', '', $content);

        return trim($content);
    }

    /**
     * Decodifica el texto devuelto por el modelo. Devuelve array o null.
     */
    private function decodificarJson(string $texto, string $contexto)
    {
        $content = $this->limpiarJsonString($texto);
        Log::info("[{$contexto}] Contenido recibido: " . substr($content, 0, 300) . '...');

        $parsed = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $parsed = json_decode($content, true, 512, JSON_INVALID_UTF8_IGNORE);
        }

        // Último intento: quedarse con lo que hay entre el primer y el último delimitador JSON
        if (json_last_error() !== JSON_ERROR_NONE) {
            $ini = min(array_filter([strpos($content, '{'), strpos($content, '[')], fn ($v) => $v !== false) ?: [false]);
            $fin = max(strrpos($content, '}'), strrpos($content, ']'));
            if ($ini !== false && $fin !== false && $fin > $ini) {
                $parsed = json_decode(substr($content, $ini, $fin - $ini + 1), true);
            }
        }

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($parsed)) {
            Log::error("[{$contexto}] Error parsing JSON: " . json_last_error_msg());
            Log::error("[{$contexto}] Contenido problemático: " . $content);
            return null;
        }

        return $parsed;
    }

    /**
     * POST JSON con un único reintento rápido ante 429/5xx.
     * Devuelve la Response (aunque sea de error) o null si hubo timeout/fallo de conexión.
     */
    private function postJson(string $url, array $headers, array $payload, int $timeout, string $nombre, string $contexto)
    {
        $response = null;

        for ($intento = 1; $intento <= 2; $intento++) {
            try {
                $response = Http::timeout($timeout)
                    ->connectTimeout(10)
                    ->withHeaders($headers)
                    ->asJson()
                    ->post($url, $payload);
            } catch (ConnectionException $e) {
                Log::warning("[{$contexto}] {$nombre} sin respuesta (timeout/conexión): " . $e->getMessage());
                return null;
            }

            if ($response->successful()) {
                return $response;
            }

            if ($intento === 1 && in_array($response->status(), self::ESTADOS_REINTENTABLES, true)) {
                Log::warning("[{$contexto}] {$nombre} devolvió " . $response->status() . ', reintentando una vez');
                usleep(800000);
                continue;
            }

            return $response;
        }

        return $response;
    }

    /**
     * Llama a un modelo de Gemini (generateContent). Devuelve el texto o null.
     */
    private function pedirGemini(array $c, string $prompt, float $temperature, int $maxOutputTokens, string $contexto): ?string
    {
        $modelo = $c['modelo'];
        $esGemini3 = str_starts_with($modelo, 'gemini-3');

        $generationConfig = [
            'maxOutputTokens' => $maxOutputTokens,
            // Fuerza que la salida sea JSON válido
            'responseMimeType' => 'application/json',
        ];

        if ($esGemini3) {
            // Gemini 3.x: sin temperature (recomendado dejar el valor por defecto)
            // y el "pensamiento" se controla con thinkingLevel (low|medium|high).
            $nivel = config('services.gemini.thinking_level', 'low');
            if (!empty($nivel)) {
                $generationConfig['thinkingConfig'] = ['thinkingLevel' => $nivel];
            }
        } else {
            $generationConfig['temperature'] = $temperature;
            if (str_starts_with($modelo, 'gemini-2.5')) {
                $generationConfig['thinkingConfig'] = ['thinkingBudget' => 0];
            }
        }

        $payload = [
            'contents' => [['parts' => [['text' => $prompt]]]],
            'generationConfig' => $generationConfig,
        ];

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$modelo}:generateContent";
        $headers = ['x-goog-api-key' => $c['key']];

        $response = $this->postJson($url, $headers, $payload, 45, $c['nombre'], $contexto);

        // Si el modelo rechaza la config de "thinking", reintenta sin ella
        if ($response && $response->status() === 400 && isset($payload['generationConfig']['thinkingConfig'])) {
            Log::warning("[{$contexto}] {$c['nombre']} rechazó thinkingConfig, reintentando sin ella: " . substr($response->body(), 0, 300));
            unset($payload['generationConfig']['thinkingConfig']);
            $response = $this->postJson($url, $headers, $payload, 45, $c['nombre'], $contexto);
        }

        if (!$response) {
            return null;
        }

        if (!$response->successful()) {
            Log::error("[{$contexto}] Error {$c['nombre']}: " . $response->status() . ' - ' . $response->body());
            return null;
        }

        $responseData = $response->json();
        $candidate = $responseData['candidates'][0] ?? null;

        if (!$candidate) {
            Log::error("[{$contexto}] Sin candidates en la respuesta: " . json_encode($responseData));
            return null;
        }

        $finishReason = $candidate['finishReason'] ?? 'desconocido';
        Log::info("[{$contexto}] {$c['nombre']} finishReason: {$finishReason}");

        // Concatenar el texto de todas las parts (ignorando las de "thought")
        $content = '';
        foreach (($candidate['content']['parts'] ?? []) as $part) {
            if (!empty($part['thought'])) {
                continue;
            }
            $content .= $part['text'] ?? '';
        }

        if ($content === '') {
            Log::error("[{$contexto}] Respuesta sin texto: " . json_encode($responseData));
            return null;
        }

        return $content;
    }

    /**
     * Llama a un proveedor compatible con OpenAI (Groq, OpenRouter...). Devuelve el texto o null.
     */
    private function pedirOpenAi(array $c, string $prompt, float $temperature, int $maxOutputTokens, string $contexto): ?string
    {
        $payload = [
            'model' => $c['modelo'],
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful assistant that answers ONLY with valid JSON.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => $temperature,
            'max_tokens' => min($maxOutputTokens, 8192),
            'response_format' => ['type' => 'json_object'],
        ];

        $headers = ['Authorization' => 'Bearer ' . $c['key']];

        $response = $this->postJson($c['url'], $headers, $payload, 30, $c['nombre'], $contexto);

        // Algunos modelos no soportan response_format: reintenta sin él
        if ($response && $response->status() === 400 && isset($payload['response_format'])) {
            Log::warning("[{$contexto}] {$c['nombre']} rechazó response_format, reintentando sin él");
            unset($payload['response_format']);
            $response = $this->postJson($c['url'], $headers, $payload, 30, $c['nombre'], $contexto);
        }

        if (!$response) {
            return null;
        }

        if (!$response->successful()) {
            Log::error("[{$contexto}] Error {$c['nombre']}: " . $response->status() . ' - ' . $response->body());
            return null;
        }

        $content = $response->json('choices.0.message.content');
        Log::info("[{$contexto}] {$c['nombre']} finish_reason: " . ($response->json('choices.0.finish_reason') ?? 'desconocido'));

        if (!is_string($content) || $content === '') {
            Log::error("[{$contexto}] Respuesta sin texto: " . substr($response->body(), 0, 500));
            return null;
        }

        return $content;
    }

    /**
     * Punto único de entrada a la IA. Prueba cada proveedor/modelo por orden hasta
     * obtener un JSON válido (y que pase el validador, si se indica).
     * Devuelve el JSON ya decodificado (array) o null si todos fallan.
     */
    private function llamarIAJson(string $prompt, float $temperature, int $maxOutputTokens, string $contexto = '', ?callable $validador = null)
    {
        $candidatos = $this->candidatos();

        if (empty($candidatos)) {
            Log::warning("[{$contexto}] No hay ningún proveedor de IA configurado");
            return null;
        }

        @set_time_limit(180);
        $this->proveedorUsado = null;

        foreach ($candidatos as $c) {
            $inicio = microtime(true);

            $texto = $c['tipo'] === 'gemini'
                ? $this->pedirGemini($c, $prompt, $temperature, $maxOutputTokens, $contexto)
                : $this->pedirOpenAi($c, $prompt, $temperature, $maxOutputTokens, $contexto);

            if ($texto === null) {
                Log::warning("[{$contexto}] {$c['nombre']} sin resultado, probando siguiente");
                continue;
            }

            $parsed = $this->decodificarJson($texto, $contexto);
            if ($parsed === null) {
                Log::warning("[{$contexto}] {$c['nombre']} devolvió JSON inválido, probando siguiente");
                continue;
            }

            if ($validador !== null && !$validador($parsed)) {
                Log::warning("[{$contexto}] {$c['nombre']} devolvió una estructura inesperada, probando siguiente");
                continue;
            }

            $this->proveedorUsado = $c['nombre'];
            Log::info(sprintf('[%s] Respuesta obtenida con %s en %.1fs', $contexto, $c['nombre'], microtime(true) - $inicio));

            return $parsed;
        }

        Log::error("[{$contexto}] Todos los proveedores de IA fallaron");
        return null;
    }

    // ------------------------------------------------------------------
    //  Utilidades
    // ------------------------------------------------------------------

    /**
     * Convierte "onions, finely chopped" -> "onions" y "salt and pepper to taste" -> "salt and pepper".
     * Solo afecta al texto que se envía a la IA, no a lo que recibe el front.
     */
    private function limpiarIngrediente(string $nombre): string
    {
        $limpio = mb_strtolower(trim($nombre));
        $limpio = preg_split('/\s*,\s*/u', $limpio)[0] ?? $limpio;
        $limpio = preg_replace('/\s+(to taste|al gusto)\s*$/u', '', $limpio);
        $limpio = trim($limpio);

        return $limpio !== '' ? $limpio : trim($nombre);
    }

    private function ingredientesParaPrompt(array $ingredients): string
    {
        $limpios = array_values(array_unique(array_map(fn ($i) => $this->limpiarIngrediente((string) $i), $ingredients)));

        return implode(', ', $limpios);
    }

    /**
     * Extrae una lista de strings de la respuesta (array directo o dentro de cualquier clave).
     */
    private function extraerSugerencias($parsed): ?array
    {
        if (!is_array($parsed)) {
            return null;
        }

        $lista = null;

        if (isset($parsed[0]) && is_string($parsed[0])) {
            $lista = $parsed;
        } else {
            foreach ($parsed as $key => $value) {
                if (is_array($value) && isset($value[0]) && is_string($value[0])) {
                    Log::info("Sugerencias encontradas en la clave '{$key}'");
                    $lista = $value;
                    break;
                }
            }
        }

        if ($lista === null) {
            return null;
        }

        $lista = array_values(array_unique(array_filter(
            array_map(fn ($v) => is_string($v) ? trim($v) : '', $lista),
            fn ($v) => $v !== ''
        )));

        return count($lista) > 0 ? array_slice($lista, 0, 6) : null;
    }

    // ------------------------------------------------------------------
    //  Endpoints
    // ------------------------------------------------------------------

    public function ingredientesPopulares()
    {
        try {
            $totalIngredientes = Ingrediente::count();
            Log::info('Total ingredientes en BD: ' . $totalIngredientes);

            if ($totalIngredientes === 0) {
                return response()->json(self::INGREDIENTES_DEFECTO);
            }

            $ingredientes = Ingrediente::select('nombre')
                ->withCount('recetas')
                ->orderBy('recetas_count', 'desc')
                ->limit(20)
                ->pluck('nombre')
                ->toArray();

            if (empty($ingredientes)) {
                $ingredientes = Ingrediente::select('nombre')
                    ->limit(20)
                    ->pluck('nombre')
                    ->toArray();
            }

            Log::info('Ingredientes populares encontrados: ' . count($ingredientes));

            return response()->json($ingredientes);
        } catch (\Exception $e) {
            Log::error('Error obteniendo ingredientes populares: ' . $e->getMessage());

            return response()->json(self::INGREDIENTES_DEFECTO);
        }
    }

    private function sugerirIngredientesBasicos($ingredients)
    {
        $ingredientesBasicos = [
            'cebolla',
            'ajo',
            'tomate',
            'aceite de oliva',
            'sal',
            'pimienta',
            'perejil',
            'pimiento',
            'zanahoria',
            'apio',
            'laurel',
            'orégano',
            'limón',
            'vinagre',
            'caldo de pollo',
            'caldo de verduras'
        ];

        $existentes = array_map('strtolower', $ingredients);

        $sugerencias = array_filter($ingredientesBasicos, function ($ingrediente) use ($existentes) {
            return !in_array(strtolower($ingrediente), $existentes);
        });

        $sugerenciasFinales = array_slice(array_values($sugerencias), 0, 6);

        Log::info('Sugerencias básicas: ', $sugerenciasFinales);

        return response()->json(['suggestions' => $sugerenciasFinales]);
    }

    /**
     * Ruta de depuración. PROTÉGELA (auth/admin) o elimínala en producción.
     */
    public function debug()
    {
        try {
            return response()->json([
                'recetas_total' => Receta::count(),
                'ingredientes_total' => Ingrediente::count(),
                'sample_recetas' => Receta::with('ingredientes')->limit(3)->get(),
                'sample_ingredientes' => Ingrediente::limit(10)->get(),
                'gemini_configured' => !empty(config('services.gemini.api_key')),
                'proveedores_ia' => array_column($this->candidatos(), 'nombre'),
            ]);
        } catch (\Exception $e) {
            Log::error('Error en debug: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function sugerirIngrediente(Request $request)
    {
        $request->validate([
            'ingredients' => 'required|array|min:1',
            'ingredients.*' => 'string'
        ]);

        $ingredients = $request->ingredients;
        Log::info('=== INICIO sugerirIngrediente ===');
        Log::info('Ingredientes recibidos: ' . json_encode($ingredients));

        try {
            if (!$this->hayProveedoresIA()) {
                Log::info('Ningún proveedor de IA configurado, usando sugerencias básicas');
                return $this->sugerirIngredientesBasicos($ingredients);
            }

            $ingredientesTexto = $this->ingredientesParaPrompt($ingredients);
            $prompt = "You are an expert chef. Based on these ingredients: {$ingredientesTexto}, suggest 6 additional ingredients that pair well for Spanish and Mediterranean recipes. Write the ingredient names in Spanish.
Respond ONLY with a JSON object with a single key \"suggestions\" containing an array of 6 strings. Example: {\"suggestions\":[\"cebolla\",\"ajo\",\"tomate\",\"aceite de oliva\",\"pimiento\",\"perejil\"]}";

            $parsedResponse = $this->llamarIAJson(
                $prompt,
                0.7,
                1024,
                'sugerirIngrediente',
                fn ($p) => $this->extraerSugerencias($p) !== null
            );

            if ($parsedResponse === null) {
                return $this->sugerirIngredientesBasicos($ingredients);
            }

            Log::info('Response parseada: ' . json_encode($parsedResponse));

            $sugerencias = $this->extraerSugerencias($parsedResponse);
            if ($sugerencias !== null) {
                return response()->json(['suggestions' => $sugerencias]);
            }

            Log::warning('No se pudo extraer array de strings, usando sugerencias básicas');
            return $this->sugerirIngredientesBasicos($ingredients);
        } catch (\Exception $e) {
            Log::error('=== ERROR EN sugerirIngrediente ===');
            Log::error('Mensaje: ' . $e->getMessage());
            Log::error('Archivo: ' . $e->getFile() . ':' . $e->getLine());
            return $this->sugerirIngredientesBasicos($ingredients);
        }
    }

    /**
     * Ruta de depuración. PROTÉGELA (auth/admin) o elimínala en producción.
     * Mantiene las claves originales y añade información de proveedores.
     */
    public function debugGemini()
    {
        try {
            $apiKey = config('services.gemini.api_key');

            $testResult = null;
            $testError = null;

            if ($this->hayProveedoresIA()) {
                try {
                    $parsed = $this->llamarIAJson(
                        'Return exactly this JSON and nothing else: {"ok": true}',
                        0.0,
                        512,
                        'debugGemini',
                        fn ($p) => isset($p['ok'])
                    );

                    if ($parsed !== null) {
                        $testResult = json_encode($parsed);
                    } else {
                        $testError = 'Ningún proveedor respondió (revisa storage/logs/laravel.log)';
                    }
                } catch (\Exception $e) {
                    $testError = $e->getMessage();
                    Log::error('Excepción en test: ' . $e->getMessage());
                }
            } else {
                $testError = 'No hay ninguna API key de IA configurada';
            }

            $modelosDisponibles = [];
            $modelosError = null;

            if (!empty($apiKey)) {
                try {
                    $modelResponse = Http::timeout(30)
                        ->withHeaders(['x-goog-api-key' => $apiKey])
                        ->get('https://generativelanguage.googleapis.com/v1beta/models', ['pageSize' => 100]);

                    if ($modelResponse->successful()) {
                        foreach (($modelResponse->json('models') ?? []) as $m) {
                            if (in_array('generateContent', $m['supportedGenerationMethods'] ?? [], true)) {
                                $modelosDisponibles[] = $m['name'] ?? 'N/A';
                            }
                        }
                    } else {
                        $modelosError = 'HTTP ' . $modelResponse->status() . ': ' . $modelResponse->body();
                    }
                } catch (\Exception $e) {
                    $modelosError = $e->getMessage();
                }
            }

            return response()->json([
                'gemini_api_key_configured' => !empty($apiKey),
                'gemini_test_successful' => $testResult !== null,
                'gemini_test_error' => $testError,
                'gemini_test_response' => $testResult,
                'modelo_utilizado' => $this->proveedorUsado,
                'proveedores_configurados' => array_column($this->candidatos(), 'nombre'),
                'modelos_disponibles' => $modelosDisponibles,
                'modelos_error' => $modelosError,
                'recetas_total' => Receta::count(),
                'ingredientes_total' => Ingrediente::count(),
                'sample_ingredientes' => Ingrediente::limit(5)->pluck('nombre')->toArray(),
                'sample_recetas' => Receta::with('ingredientes')->limit(3)->get()->map(function ($receta) {
                    return [
                        'id' => $receta->id,
                        'nombre' => $receta->nombre,
                        'ingredientes_count' => $receta->ingredientes->count(),
                        'ingredientes' => $receta->ingredientes->pluck('nombre')->toArray()
                    ];
                })
            ]);
        } catch (\Exception $e) {
            Log::error('Error en debugGemini: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function generarRecetasConIA($ingredients)
    {
        $ingredientesTexto = $this->ingredientesParaPrompt($ingredients);
        Log::info('=== INICIO generarRecetasConIA ===');
        Log::info('Ingredientes recibidos: ' . implode(', ', $ingredients));
        Log::info('Ingredientes enviados a la IA: ' . $ingredientesTexto);

        $prompt = <<<PROMPT
You are an expert chef specialized in Spanish and Mediterranean cuisine.

With these available ingredients: {$ingredientesTexto}

Generate 3 detailed recipes. Write recipe names, ingredient names and steps in Spanish. Use the vast majority of the provided ingredients in each recipe, not just one or two.

Return ONLY a valid JSON object with this structure:
{
  "recipes": [
    {
      "id": "ai_001",
      "usuario_id": 0,
      "nombre": "Recipe name",
      "tipoCocina": "Spanish",
      "tipoComida": "Lunch",
      "tiempoCocinado": "30",
      "dificultad": "Easy",
      "porciones": 4,
      "caloriasPorPorcion": 350,
      "ingredientes": [{"nombreIngrediente": "name"}],
      "pasos": [{"nombrePaso": "step text"}],
      "valoracion": 4.5
    }
  ]
}

Rules:
- tipoCocina: one of Spanish, Mediterranean, Homestyle
- tipoComida: one of Breakfast, Lunch, Dinner, Appetizer, Dessert
- tiempoCocinado: number only (minutes), as a string, no units
- dificultad: one of Easy, Intermediate, Hard
- porciones: integer between 1 and 8
- caloriasPorPorcion: realistic integer between 200 and 800
- ingredientes: array of objects {"nombreIngrediente": string}
- pasos: array of objects {"nombrePaso": string}, minimum 5 steps, do not add cleaning or ingredient preparation as separate steps, and do not prefix with 'Step 1:' etc.
- valoracion: decimal number between 3.0 and 5.0
- id: use ai_001, ai_002, ai_003
PROMPT;

        try {
            $parsedResponse = $this->llamarIAJson(
                $prompt,
                0.8,
                12000,
                'generarRecetasConIA',
                fn ($p) => isset($p['recipes']) && is_array($p['recipes']) && count($p['recipes']) > 0
            );

            if ($parsedResponse === null) {
                return [];
            }

            if (!isset($parsedResponse['recipes']) || !is_array($parsedResponse['recipes'])) {
                Log::error('Estructura de respuesta inválida: ' . json_encode($parsedResponse));
                return [];
            }

            $recetasGeneradas = [];
            foreach ($parsedResponse['recipes'] as $index => $receta) {
                if (!isset($receta['nombre']) || !isset($receta['ingredientes']) || !isset($receta['pasos'])) {
                    Log::warning("Receta {$index} incompleta, saltando");
                    continue;
                }

                $recetaFormateada = [
                    'id' => $receta['id'] ?? 'ai_' . uniqid(),
                    'usuario_id' => (int)($receta['usuario_id'] ?? 0),
                    'nombre' => trim($receta['nombre']),
                    'tipoCocina' => $receta['tipoCocina'] ?? 'Homestyle',
                    'tipoComida' => $receta['tipoComida'] ?? 'Lunch',
                    'tiempoCocinado' => (string)($receta['tiempoCocinado'] ?? '30'),
                    'dificultad' => $receta['dificultad'] ?? 'Intermediate',
                    'porciones' => (int)($receta['porciones'] ?? 4),
                    'caloriasPorPorcion' => (int)($receta['caloriasPorPorcion'] ?? 350),
                    'ingredientes' => $receta['ingredientes'] ?? [],
                    'pasos' => $receta['pasos'] ?? [],
                    'valoracion' => (float)($receta['valoracion'] ?? 4.0),
                    'IA' => true
                ];

                if (empty($recetaFormateada['ingredientes']) || empty($recetaFormateada['pasos'])) {
                    Log::warning("Receta {$index} sin ingredientes o pasos, saltando");
                    continue;
                }

                $recetasGeneradas[] = $recetaFormateada;
                Log::info('Receta procesada: ' . $recetaFormateada['nombre']);
            }

            Log::info('Total recetas generadas: ' . count($recetasGeneradas));
            return $recetasGeneradas;
        } catch (\Exception $e) {
            Log::error('Error en generarRecetasConIA: ' . $e->getMessage());
            return [];
        }
    }

    public function buscarRecetasPorIngredientes(Request $request)
    {
        try {
            $request->validate([
                'ingredients' => 'required|array|min:1',
                'ingredients.*' => 'string'
            ]);

            $ingredients = array_map('strtolower', $request->ingredients);
            Log::info('Buscando recetas con ingredientes: ', $ingredients);

            $recetas = $this->generarRecetasConIA($ingredients);
            Log::info('Recetas generadas por IA: ' . count($recetas));

            $response = [
                'recetas' => $recetas,
                'message' => count($recetas) > 0
                    ? 'Recetas creadas por IA basadas en tus ingredientes'
                    : 'No se pudieron generar recetas, inténtalo de nuevo',
                'total' => count($recetas),
                'recetas_bd' => 0,
                'recetas_ia' => count($recetas)
            ];

            return response()->json($response);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación: ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Datos de entrada inválidos',
                'errors' => $e->errors(),
                'recetas' => []
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error en búsqueda de recetas por IA: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'message' => 'Error al procesar la búsqueda de recetas',
                'error' => $e->getMessage(),
                'recetas' => []
            ], 500);
        }
    }

    public function generarRecetasIA(Request $request)
    {
        $request->validate([
            'ingredients' => 'required|array|min:1',
            'ingredients.*' => 'string'
        ]);

        $ingredients = array_map('strtolower', $request->ingredients);
        Log::info('Generando recetas SOLO con IA para ingredientes: ', $ingredients);

        try {
            if (!$this->hayProveedoresIA()) {
                return response()->json([
                    'message' => 'Servicio de IA no configurado',
                    'recetas' => []
                ], 503);
            }

            $recetas = $this->generarRecetasConIA($ingredients);

            return response()->json([
                'recetas' => $recetas,
                'message' => 'Recetas creadas completamente por IA',
                'total' => count($recetas),
                'tipo' => 'solo_ia'
            ]);
        } catch (\Exception $e) {
            Log::error('Error generando recetas con IA: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error al generar recetas con IA',
                'error' => $e->getMessage(),
                'recetas' => []
            ], 500);
        }
    }
}
