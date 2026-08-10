<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('adresse_depart')->nullable()->after('ville');
            $table->string('adresse_arrivee')->nullable()->after('adresse_depart');
            $table->string('client_nom')->nullable()->after('adresse_arrivee');
            $table->string('client_prenom')->nullable()->after('client_nom');
            $table->string('client_telephone')->nullable()->after('client_prenom');
            $table->string('client_adresse')->nullable()->after('client_telephone');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['adresse_depart', 'adresse_arrivee', 'client_nom', 'client_prenom', 'client_telephone', 'client_adresse']);
        });
    }
};