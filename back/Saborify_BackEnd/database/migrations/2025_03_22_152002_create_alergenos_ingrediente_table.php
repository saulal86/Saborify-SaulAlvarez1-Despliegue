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
        Schema::create('ingrediente_alergeno', function (Blueprint $table) {
            $table->foreignId('ingrediente_id')->constrained('ingredientes')->onDelete('cascade');
            $table->foreignId('alergeno_id')->constrained('alergenos')->onDelete('cascade');
            $table->timestamps();

            $table->primary(['ingrediente_id', 'alergeno_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alergenos_ingrediente');
    }
};
