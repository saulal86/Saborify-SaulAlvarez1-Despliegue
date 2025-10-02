<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Receta;
use App\Models\Ingrediente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class AIRecipeController extends Controller
{

    public function ingredientesPopulares()
    {
        try {
            $totalIngredientes = Ingrediente::count();
            Log::info('Total ingredientes en BD: ' . $totalIngredientes);

            if ($totalIngredientes === 0) {
                return response()->json([
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
                ]);
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

            return response()->json([
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
            ]);
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

        $sugerencias = array_filter($ingredientesBasicos, function ($ingrediente) use ($ingredients) {
            return !in_array(strtolower($ingrediente), array_map('strtolower', $ingredients));
        });

        $sugerenciasFinales = array_slice(array_values($sugerencias), 0, 6);

        Log::info('Sugerencias básicas: ', $sugerenciasFinales);

        return response()->json(['suggestions' => $sugerenciasFinales]);
    }

    public function debug()
    {
        try {
            $recetasCount = Receta::count();
            $ingredientesCount = Ingrediente::count();

            $sampleRecetas = Receta::with('ingredientes')->limit(3)->get();
            $sampleIngredientes = Ingrediente::limit(10)->get();

            return response()->json([
                'recetas_total' => $recetasCount,
                'ingredientes_total' => $ingredientesCount,
                'sample_recetas' => $sampleRecetas,
                'sample_ingredientes' => $sampleIngredientes,
                'gemini_configured' => !empty(config('services.gemini.api_key'))
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
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
            $apiKey = config('services.gemini.api_key');
            Log::info('Gemini configurado: ' . (!empty($apiKey) ? 'SÍ' : 'NO'));

            if (!$apiKey) {
                Log::info('Gemini no configurado, usando sugerencias básicas');
                return $this->sugerirIngredientesBasicos($ingredients);
            }

            $ingredientesTexto = implode(', ', $ingredients);
            $prompt = "Based on these ingredients: {$ingredientesTexto}, suggest 6 additional ingredients that pair well for Spanish and Mediterranean recipes.
                      Respond ONLY with a JSON array of strings. Example: [\"onion\",\"garlic\",\"tomato\",\"olive oil\",\"bell pepper\",\"parsley\"]
                      Do not add any additional text, only the JSON array.";

            Log::info('Prompt para sugerencias: ' . $prompt);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => "You are an expert chef. Respond ONLY with a valid JSON array of strings, without additional text.\n\n" . $prompt
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 50,
                ]
            ]);

            if (!$response->successful()) {
                Log::error('Error en la llamada a Gemini API para sugerencias: ' . $response->status());
                return $this->sugerirIngredientesBasicos($ingredients);
            }

            $responseData = $response->json();

            if (!isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
                Log::error('Estructura de respuesta inesperada de Gemini para sugerencias');
                return $this->sugerirIngredientesBasicos($ingredients);
            }

            $content = trim($responseData['candidates'][0]['content']['parts'][0]['text']);
            Log::info('Respuesta RAW de Gemini para sugerencias: ' . $content);

            $content = preg_replace('/```json\s*/', '', $content);
            $content = preg_replace('/```\s*$/', '', $content);
            Log::info('Contenido limpio: ' . $content);

            $parsedResponse = json_decode($content, true);
            Log::info('JSON decode - Error: ' . json_last_error() . ' (' . json_last_error_msg() . ')');

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Error parsing JSON for ingredient suggestions: ' . json_last_error_msg());
                Log::error('Contenido problemático: ' . $content);
                return $this->sugerirIngredientesBasicos($ingredients);
            }

            Log::info('Response parseada: ' . json_encode($parsedResponse));

            if (is_array($parsedResponse)) {
                if (isset($parsedResponse[0]) && is_string($parsedResponse[0])) {
                    Log::info('Devolviendo array directo de sugerencias: ' . json_encode($parsedResponse));
                    return response()->json(['suggestions' => $parsedResponse]);
                }
                foreach ($parsedResponse as $key => $value) {
                    if (is_array($value) && isset($value[0]) && is_string($value[0])) {
                        Log::info("Devolviendo sugerencias desde clave '{$key}': " . json_encode($value));
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
            Log::error('Stack trace: ' . $e->getTraceAsString());
            Log::error('=== FIN ERROR ===');
            return $this->sugerirIngredientesBasicos($ingredients);
        }
    }

    public function debugGemini()
    {
        try {
            $apiKey = config('services.gemini.api_key');

            $testResult = null;
            $testError = null;

            if (!empty($apiKey)) {
                try {
                    $response = Http::withHeaders([
                        'Content-Type' => 'application/json',
                    ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={$apiKey}", [
                        'contents' => [
                            [
                                'parts' => [
                                    [
                                        'text' => 'Responde solo con: OK'
                                    ]
                                ]
                            ]
                        ],
                        'generationConfig' => [
                            'maxOutputTokens' => 10,
                        ]
                    ]);

                    Log::info('Status de respuesta: ' . $response->status());
                    Log::info('Body completo: ' . $response->body());

                    if ($response->successful()) {
                        $responseData = $response->json();
                        Log::info('Response data: ' . json_encode($responseData));

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
                    $modelResponse = Http::withHeaders([
                        'Content-Type' => 'application/json',
                    ])->get("https://generativelanguage.googleapis.com/v1beta/models?key={$apiKey}");

                    if ($modelResponse->successful()) {
                        $modelData = $modelResponse->json();
                        if (isset($modelData['models'])) {
                            $modelosDisponibles = array_map(function ($model) {
                                return $model['name'] ?? 'N/A';
                            }, array_slice($modelData['models'], 0, 10));
                        }
                    }
                } catch (\Exception $e) {
                    $modelosError = $e->getMessage();
                }
            }

            return response()->json([
                'gemini_api_key_configured' => !empty($apiKey),
                'gemini_api_key_preview' => $apiKey ? substr($apiKey, 0, 10) . '...' : null,
                'gemini_test_successful' => $testResult !== null,
                'gemini_test_error' => $testError,
                'gemini_test_response' => $testResult,
                'modelo_utilizado' => 'gemini-1.5-flash',
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
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    private function generarRecetasConIA($ingredients)
    {
        $ingredientesTexto = implode(', ', $ingredients);
        Log::info('=== INICIO generarRecetasConIA ===');
        Log::info('Ingredientes recibidos: ' . $ingredientesTexto);

        $apiKey = config('services.gemini.api_key');
        if (empty($apiKey)) {
            Log::warning('Gemini API Key no configurada');
            return [];
        }

        $prompt = "You are an expert chef specialized in Spanish and Mediterranean cuisine.

With these available ingredients: {$ingredientesTexto}

Generate 3-4 detailed recipes. Each recipe must include ALL required fields.

IMPORTANT: Respond ONLY with valid JSON in this EXACT format (without additional text):

{
  \"recipes\": [
    {
      \"id\": \"ai_001\",
      \"usuario_id\": 0,
      \"nombre\": \"Specific and attractive recipe name\",
      \"tipoCocina\": \"Spanish\" | \"Mediterranean\" | \"Homestyle\",
      \"tipoComida\": \"Breakfast\" | \"Lunch\" | \"Dinner\" | \"Appetizer\" | \"Dessert\",
      \"tiempoCocinado\": \"30\",
      \"dificultad\": \"Easy\" | \"Intermediate\" | \"Hard\",
      \"porciones\": 4,
      \"caloriasPorPorcion\": 350,
      \"ingredientes\": [
        {\"nombreIngrediente\": \"Exact ingredient name\"},
        {\"nombreIngrediente\": \"Another ingredient\"}
      ],
      \"pasos\": [
        {\"nombrePaso\": \"Prepare ingredients by washing and chopping...\"},
        {\"nombrePaso\": \"In a pan, heat oil over medium heat...\"},
        {\"nombrePaso\": \"Add ingredients and cook for...\"}
      ],
      \"valoracion\": 4.5
    }
  ]
}

MANDATORY RULES:
- tipoCocina: Only use \"Spanish\", \"Mediterranean\" or \"Homestyle\"
- tipoComida: Only use \"Breakfast\", \"Lunch\", \"Dinner\", \"Appetizer\" or \"Dessert\"
- tiempoCocinado: Only put the number, don't add time units
- dificultad: Only \"Easy\", \"Intermediate\" or \"Hard\"
- porciones: Integer between 1 and 8
- caloriasPorPorcion: Realistic integer (200-800)
- ingredientes: Array with objects {\"nombreIngrediente\": string}
- pasos: Array with objects {\"nombrePaso\": string} - minimum 5 steps, don't add cleaning or ingredient preparation steps separately, only add step content without \"Step 1:\", etc.
- valoracion: Decimal number between 3.0 and 5.0
- id: Use format \"ai_001\", \"ai_002\", etc.

Focus on authentic and realistic recipes that actually use the provided ingredients. And above all, remember to use the vast majority of the ingredients, not just one or two.";

        try {
            Log::info('Iniciando llamada a Gemini...');

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => $prompt
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.8,
                    'maxOutputTokens' => 1200,
                ]
            ]);

            if (!$response->successful()) {
                Log::error('Error en Gemini API: ' . $response->status());
                return [];
            }

            $responseData = $response->json();

            if (!isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
                Log::error('Estructura de respuesta inesperada');
                return [];
            }

            $content = trim($responseData['candidates'][0]['content']['parts'][0]['text']);

            $content = preg_replace('/```json\s*/', '', $content);
            $content = preg_replace('/```\s*$/', '', $content);
            $content = trim($content);

            Log::info('Contenido recibido: ' . substr($content, 0, 200) . '...');

            $parsedResponse = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Error parsing JSON: ' . json_last_error_msg());
                Log::error('Contenido problemático: ' . $content);
                return [];
            }

            if (!isset($parsedResponse['recipes']) || !is_array($parsedResponse['recipes'])) {
                Log::error('Estructura de respuesta inválida');
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
                    'tiempoCocinado' => $receta['tiempoCocinado'] ?? '30',
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
                Log::info("Receta procesada: " . $recetaFormateada['nombre']);
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
        $request->validate([
            'ingredients' => 'required|array|min:1',
            'ingredients.*' => 'string'
        ]);

        $ingredients = array_map('strtolower', $request->ingredients);

        Log::info('Buscando recetas con ingredientes: ', $ingredients);

        try {

            $recetas = $this->generarRecetasConIA($ingredients);
            Log::info('Recetas generadas por IA: ' . count($recetas));

            return response()->json([
                'recetas' => $recetas,
                'message' => 'Recetas creadas por IA basadas en tus ingredientes',
                'total' => count($recetas),
                'recetas_bd' => 0,
                'recetas_ia' => count($recetas)
            ]);
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
