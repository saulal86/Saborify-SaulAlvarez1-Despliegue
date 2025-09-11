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
        Schema::create('receta_pasos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receta_id');
            $table->foreign('receta_id')->references("id")->on("recetas");
            $table->string("paso");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recetas_pasos');
    }
};
