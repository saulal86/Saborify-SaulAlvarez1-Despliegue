<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UsuariosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        User::create([
            'name' => 'Regular User',
            'email' => 'user@gmail.com',
            'userName' => 'user',
            'password' => Hash::make('user'),
            'role' => 'user',
        ]);

        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'userName' => 'admin',
            'password' => Hash::make('admin'),
            'role' => 'admin',
        ]);
    }
}
