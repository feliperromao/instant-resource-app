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
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('requerente', 255);

            # categoria
            $table->string('categoria', 255);
            $table->float('peso', 10);
            $table->string('faixa', 100); // branca, cinza, amarela, laranja, verde, azul, roxa, preta
            
            $table->string('luta', 255); // final, quartas de final, etc
            $table->string('area', 255)->nullable(); // area 1, area 2, area 3, etc
            $table->string('arbitro', 255)->nullable();

            $table->string('vencedor', 255)->nullable();
            $table->string('observação', 255)->nullable();

            $table->string('status', 50)->default('pendente'); // pendente, deferido, indeferido
            #
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
