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
        Schema::create('ingrediente_receta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receta_id');
            $table->foreign('receta_id')->references("id")->on("recetas");
            $table->foreignId('ingrediente_id');
            $table->foreign('ingrediente_id')->references("id")->on("ingredientes");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recetas_ingredientes');
    }
};
