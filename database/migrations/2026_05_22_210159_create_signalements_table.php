<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('signalements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auteur_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->morphs('cible');
            $table->enum('type', ['post', 'commentaire', 'utilisateur', 'annonce']);
            $table->text('description');
            $table->enum('statut', ['en_attente', 'traite', 'rejete'])->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('signalements');
    }
};