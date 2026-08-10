<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Le client a accepté les conditions de responsabilité en cas d'incident
            $table->timestamp('responsabilite_acceptee_le')->nullable()->after('notes');
            // Le prestataire a confirmé avoir pris connaissance de l'état de santé de l'animal
            $table->timestamp('sante_lue_le')->nullable()->after('responsabilite_acceptee_le');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['responsabilite_acceptee_le', 'sante_lue_le']);
        });
    }
};