<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlergenosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $alergenos = [
            'Gluten', 'Lactosa', 'Frutos secos', 'Mariscos', 'Huevo',
            'Soja', 'Pescado', 'Mostaza', 'Apio', 'Sésamo',
            'Altramuces', 'Moluscos', 'Sulfitos', 'Cacahuetes'
        ];

        $alergenosIds = [];
        foreach ($alergenos as $nombre) {
            $alergenosIds[] = DB::table('alergenos')->insertGetId([
                'nombre' => $nombre,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        $ingredientes = DB::table('ingredientes')->pluck('id')->toArray();

        $data = [];
        foreach ($ingredientes as $ingredienteId) {
            if (!empty($alergenosIds)) {
                $cantidadAlergenos = rand(1, min(3, count($alergenosIds)));
                $asignados = (array) array_rand(array_flip($alergenosIds), $cantidadAlergenos);

                foreach ($asignados as $alergenoId) {
                    $data[] = [
                        'ingrediente_id' => $ingredienteId,
                        'alergeno_id' => $alergenoId,
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                }
            }
        }

        if (!empty($data)) {
            DB::table('ingrediente_alergeno')->insert($data);
        }
    }
}
