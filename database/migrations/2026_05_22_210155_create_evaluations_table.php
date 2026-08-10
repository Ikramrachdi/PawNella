<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained()->onDelete('cascade');
            $table->foreignId('auteur_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('cible_id')->constrained('users')->onDelete('cascade');
            $table->integer('note')->between(1, 5);
            $table->text('commentaire')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('evaluations');
    }
};