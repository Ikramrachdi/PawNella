<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            // L'animal a-t-il un problème de santé déclaré ?
            $table->boolean('a_probleme_sante')->default(false)->after('caractere');
            // Détails (remplis seulement si a_probleme_sante = true)
            $table->text('probleme_sante')->nullable()->after('a_probleme_sante');       // description
            $table->text('traitement')->nullable()->after('probleme_sante');             // médicaments / traitement
            $table->text('consignes_sante')->nullable()->after('traitement');            // consignes particulières
            $table->string('veterinaire')->nullable()->after('consignes_sante');         // nom / cabinet vétérinaire
            $table->string('contact_urgence_sante')->nullable()->after('veterinaire');   // téléphone d'urgence
            // Le client a certifié l'exactitude de ces informations
            $table->timestamp('sante_certifiee_le')->nullable()->after('contact_urgence_sante');
        });
    }

    public function down(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            $table->dropColumn([
                'a_probleme_sante', 'probleme_sante', 'traitement',
                'consignes_sante', 'veterinaire', 'contact_urgence_sante',
                'sante_certifiee_le',
            ]);
        });
    }
};