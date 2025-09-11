<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class RecetasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $response = Http::get('https://dummyjson.com/recipes?sortBy=rating&order=desc');

        if ($response->successful()) {
            $recipes = $response->json()['recipes'];

            foreach ($recipes as $recipe) {
                $recetaId = DB::table('recetas')->insertGetId([
                    'nombre' => $recipe['name'],
                    'tipoCocina' => $recipe['cuisine'],
                    'tiempoCocinado' => $recipe['cookTimeMinutes'],
                    'dificultad' => $recipe['difficulty'],
                    'imagen_url' => $recipe['image'] ?? null,
                    'porciones' => $recipe['servings'],
                    'caloriasPorPorcion' => $recipe['caloriesPerServing'],
                    'usuario_id' => 1
                ]);

                if (!empty($recipe['mealType'])) {
                    foreach ($recipe['mealType'] as $tipo) {
                        $tipoComida = DB::table('tipo_comida')->where('nombre', $tipo)->first();

                        if (!$tipoComida) {
                            $tipoComidaId = DB::table('tipo_comida')->insertGetId([
                                'nombre' => $tipo
                            ]);
                        } else {
                            $tipoComidaId = $tipoComida->id;
                        }

                        DB::table('tipo_comida_receta')->insert([
                            'receta_id' => $recetaId,
                            'tipo_comida_id' => $tipoComidaId
                        ]);
                    }
                }

                foreach ($recipe['instructions'] as $index => $paso) {
                    DB::table('receta_pasos')->insert([
                        'receta_id' => $recetaId,
                        'paso' => $paso
                    ]);
                }

                foreach ($recipe['ingredients'] as $ingredientName) {
                    $ingrediente = DB::table('ingredientes')->where('nombre', $ingredientName)->first();

                    if ($ingrediente) {
                        DB::table('ingrediente_receta')->insert([
                            'receta_id' => $recetaId,
                            'ingrediente_id' => $ingrediente->id
                        ]);
                    }
                }

            }
        }
    }
}
