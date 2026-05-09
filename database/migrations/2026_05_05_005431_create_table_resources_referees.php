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
        Schema::create('resources_referees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->constrained('resources')->cascadeOnDelete();
            $table->string('code', 64)->unique();
            $table->string('referee_name', 255);
            $table->integer('white_pontos')->default(0);
            $table->integer('white_vantagens')->default(0);
            $table->integer('white_punicao')->default(0);
            $table->integer('color_pontos')->default(0);
            $table->integer('color_vantagens')->default(0);
            $table->integer('color_punicao')->default(0);
            $table->enum('victory', ['white', 'color'])->nullable();
            $table->string('observacao', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resources_referees');
    }
};
