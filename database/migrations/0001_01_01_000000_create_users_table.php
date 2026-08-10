<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('telephone')->nullable();
            $table->string('ville')->nullable();
            $table->string('photo')->nullable();
            $table->enum('role', ['proprietaire', 'adoptant', 'prestataire', 'admin'])->default('proprietaire');
            // Champs Proprietaire
            $table->string('adresse')->nullable();
            $table->string('contact_urgence')->nullable();
            $table->text('biographie')->nullable();
            // Champs Adoptant
            $table->string('experience')->nullable();
            $table->string('type_logement')->nullable();
            $table->boolean('animaux_existants')->default(false);
            // Champs Prestataire
            $table->text('description')->nullable();
            $table->json('services_offerts')->nullable();
            $table->decimal('tarif', 10, 2)->nullable();
            $table->decimal('note_moyenne', 3, 2)->default(0);
            $table->boolean('est_verifie')->default(false);
            $table->enum('statut_validation', ['en_attente', 'valide', 'rejete'])->default('en_attente');
            // Champs Admin
            $table->string('niveau')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('users');
    }
};