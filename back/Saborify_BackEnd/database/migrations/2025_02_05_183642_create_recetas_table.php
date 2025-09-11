<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recetas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('tipoCocina');
            $table->string('porciones');
            $table->integer('caloriasPorPorcion');
            $table->integer('tiempoCocinado');
            $table->string('dificultad');
            $table->string('imagen_url')->nullable();
            $table->foreignId('usuario_id')->nullable();
            $table->foreign('usuario_id')->references("id")->on("users");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recetas');
    }
};
