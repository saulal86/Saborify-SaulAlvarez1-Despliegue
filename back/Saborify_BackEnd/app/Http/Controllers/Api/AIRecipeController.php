<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Receta;
use App\Models\Ingrediente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class AIRecipeController extends Controller
{
    /**
     * Modelo de Gemini a usar. Cámbialo si tu cuenta tiene otro disponible
     * (puedes verlo en la ruta debugGemini -> modelos_disponibles).
     */
    private const GEMINI_MODEL = 'gemini-2.5-flash';

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
     * Llama a Gemini y devuelve el JSON ya decodificado (array) o null si falla.
     * Centraliza la llamada, el logging de errores y el parseo.
     */
    private function llamarGeminiJson(string $prompt, float $temperature, int $maxOutputTokens, string $contexto = '')
    {
        $apiKey = config('services.gemini.api_key');
        if (empty($apiKey)) {
            Log::warning("[{$contexto}] Gemini API Key no configurada");
            return null;
        }

        $model = self::GEMINI_MODEL;

        $response = Http::timeout(60)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'x-goog-api-key' => $apiKey,
            ])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ],
                'generationConfig' => [
                    'temperature' => $temperature,
                    'maxOutputTokens' => $maxOutputTokens,
                    // Fuerza que la salida sea JSON válido
                    'responseMimeType' => 'application/json',
                    // Desactiva el "pensamiento" de 2.5-flash: consume tokens de salida
                    'thinkingConfig' => ['thinkingBudget' => 0],
                ]
            ]);

        if (!$response->successful()) {
            Log::error("[{$contexto}] Error Gemini API: " . $response->status() . ' - ' . $response->body());
            return null;
        }

        $responseData = $response->json();
        $candidate = $responseData['candidates'][0] ?? null;

        if (!$candidate) {
            Log::error("[{$contexto}] Sin candidates en la respuesta: " . json_encode($responseData));
            return null;
        }

        $finishReason = $candidate['finishReason'] ?? 'desconocido';
        Log::info("[{$contexto}] finishReason: {$finishReason}");

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

        $content = $this->limpiarJsonString($content);
        Log::info("[{$contexto}] Contenido recibido: " . substr($content, 0, 300) . '...');

        $parsed = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::warning("[{$contexto}] Primer intento de JSON falló, reintentando con JSON_INVALID_UTF8_IGNORE");
            $parsed = json_decode($content, true, 512, JSON_INVALID_UTF8_IGNORE);
        }

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error("[{$contexto}] Error parsing JSON: " . json_last_error_msg());
            Log::error("[{$contexto}] Contenido problemático: " . $content);
            return null;
        }

        return $parsed;
    }

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
                'gemini_configured' => !empty(config('services.gemini.api_key'))
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
            if (empty(config('services.gemini.api_key'))) {
                Log::info('Gemini no configurado, usando sugerencias básicas');
                return $this->sugerirIngredientesBasicos($ingredients);
            }

            $ingredientesTexto = implode(', ', $ingredients);
            $prompt = "You are an expert chef. Based on these ingredients: {$ingredientesTexto}, suggest 6 additional ingredients that pair well for Spanish and Mediterranean recipes. Write the ingredient names in Spanish.
Respond ONLY with a JSON array of 6 strings. Example: [\"cebolla\",\"ajo\",\"tomate\",\"aceite de oliva\",\"pimiento\",\"perejil\"]";

            $parsedResponse = $this->llamarGeminiJson($prompt, 0.7, 256, 'sugerirIngrediente');

            if ($parsedResponse === null) {
                return $this->sugerirIngredientesBasicos($ingredients);
            }

            Log::info('Response parseada: ' . json_encode($parsedResponse));

            if (is_array($parsedResponse)) {
                // Array directo de strings
                if (isset($parsedResponse[0]) && is_string($parsedResponse[0])) {
                    return response()->json(['suggestions' => $parsedResponse]);
                }

                // Array dentro de alguna clave (por ejemplo {"suggestions": [...]})
                foreach ($parsedResponse as $key => $value) {
                    if (is_array($value) && isset($value[0]) && is_string($value[0])) {
                        Log::info("Devolviendo sugerencias desde clave '{$key}'");
                        return response()->json(['suggestions' => $value]);
                    }
                }
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
     */
    public function debugGemini()
    {
        try {
            $apiKey = config('services.gemini.api_key');
            $model = self::GEMINI_MODEL;

            $testResult = null;
            $testError = null;

            if (!empty($apiKey)) {
                try {
                    $response = Http::timeout(30)
                        ->withHeaders([
                            'Content-Type' => 'application/json',
                            'x-goog-api-key' => $apiKey,
                        ])
                        ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", [
                            'contents' => [
                                ['parts' => [['text' => 'Responde solo con: OK']]]
                            ],
                            'generationConfig' => [
                                'maxOutputTokens' => 20,
                                'thinkingConfig' => ['thinkingBudget' => 0],
                            ]
                        ]);

                    Log::info('Status de respuesta: ' . $response->status());

                    if ($response->successful()) {
                        $responseData = $response->json();

                        if (isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
                            $testResult = $responseData['candidates'][0]['content']['parts'][0]['text'];
                        } else {
                            $testError = 'Estructura de respuesta inesperada: ' . json_encode($responseData);
                        }
                    } else {
                        $testError = 'HTTP ' . $response->status() . ': ' . $response->body();
                    }
                } catch (\Exception $e) {
                    $testError = $e->getMessage();
                    Log::error('Excepción en test: ' . $e->getMessage());
                }
            }

            $modelosDisponibles = [];
            $modelosError = null;

            if (!empty($apiKey)) {
                try {
                    $modelResponse = Http::timeout(30)
                        ->withHeaders(['x-goog-api-key' => $apiKey])
                        ->get('https://generativelanguage.googleapis.com/v1beta/models');

                    if ($modelResponse->successful()) {
                        $modelData = $modelResponse->json();
                        if (isset($modelData['models'])) {
                            $modelosDisponibles = array_map(function ($m) {
                                return $m['name'] ?? 'N/A';
                            }, $modelData['models']);
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
                'modelo_utilizado' => $model,
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
        $ingredientesTexto = implode(', ', $ingredients);
        Log::info('=== INICIO generarRecetasConIA ===');
        Log::info('Ingredientes recibidos: ' . $ingredientesTexto);

        $prompt = "You are an expert chef specialized in Spanish and Mediterranean cuisine.

With these available ingredients: {$ingredientesTexto}

Generate 3 detailed recipes. Write recipe names, ingredient names and steps in Spanish. Use the vast majority of the provided ingredients in each recipe, not just one or two.

Return a JSON object with this structure:
{
  \"recipes\": [
    {
      \"id\": \"ai_001\",
      \"usuario_id\": 0,
      \"nombre\": \"Recipe name\",
      \"tipoCocina\": \"Spanish\",
      \"tipoComida\": \"Lunch\",
      \"tiempoCocinado\": \"30\",
      \"dificultad\": \"Easy\",
      \"porciones\": 4,
      \"caloriasPorPorcion\": 350,
      \"ingredientes\": [{\"nombreIngrediente\": \"name\"}],
      \"pasos\": [{\"nombrePaso\": \"step text\"}],
      \"valoracion\": 4.5
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
- ingredientes: array of objects {\"nombreIngrediente\": string}
- pasos: array of objects {\"nombrePaso\": string}, minimum 5 steps, do not add cleaning or ingredient preparation as separate steps, and do not prefix with 'Step 1:' etc.
- valoracion: decimal number between 3.0 and 5.0
- id: use ai_001, ai_002, ai_003";

        try {
            $parsedResponse = $this->llamarGeminiJson($prompt, 0.8, 8192, 'generarRecetasConIA');

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
            if (!config('services.gemini.api_key')) {
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
