<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ValoracionesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $recetas = DB::table('recetas')->pluck('id');
        $comentarios = [
            '¡Deliciosa! Definitivamente la haré de nuevo.',
            'Muy buena receta, fácil de seguir.',
            'El sabor es increíble, pero mejoraría la textura.',
            'Me sorprendió lo bien que quedó.',
            'Podría ser más sencilla de preparar, pero el resultado vale la pena.',
            'No era lo que esperaba, pero estuvo decente.',
            'Muy sabroso, lo recomiendo totalmente.',
            'Le agregué algunos ingredientes extra y quedó aún mejor.',
        ];

        $valoraciones = [];

        foreach ($recetas as $receta_id) {
            for ($i = 0; $i < 5; $i++) {
                $valoraciones[] = [
                    'receta_id' => $receta_id,
                    'usuario_id' => 1,
                    'puntuacion' => rand(1, 5),
                    'comentario' => $comentarios[array_rand($comentarios)],
                ];
            }
        }

        DB::table('reseñas')->insert($valoraciones);
    }
}
