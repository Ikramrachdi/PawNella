<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('animals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nom');
            $table->string('espece');
            $table->string('race')->nullable();
            $table->enum('sexe', ['male', 'femelle']);
            $table->date('date_naissance')->nullable();
            $table->string('photo')->nullable();
            $table->string('caractere')->nullable();
            $table->enum('statut', ['disponible', 'adopte', 'en_cours'])->default('disponible');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('animals');
    }
};