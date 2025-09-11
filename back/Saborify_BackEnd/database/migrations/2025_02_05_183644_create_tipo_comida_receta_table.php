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
        Schema::create('tipo_comida_receta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receta_id');
            $table->foreign('receta_id')->references("id")->on("recetas");
            $table->foreignId('tipo_comida_id');
            $table->foreign('tipo_comida_id')->references("id")->on("tipo_comida");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tipo_comida_receta');
    }
};
