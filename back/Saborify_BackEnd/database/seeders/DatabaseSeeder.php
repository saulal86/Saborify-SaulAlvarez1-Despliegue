<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(UsuariosSeeder::class);
        $this->call(IngredientesSeeder::class);
        $this->call(RecetasSeeder::class);
        $this->call(AlergenosSeeder::class);
        $this->call(ValoracionesSeeder::class);

    }
}
