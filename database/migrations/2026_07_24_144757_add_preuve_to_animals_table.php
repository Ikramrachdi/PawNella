<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            // Document justificatif de propriété (carnet, certificat vétérinaire, passeport)
            $table->string('preuve_propriete')->nullable()->after('photo');
            $table->string('type_preuve')->nullable()->after('preuve_propriete');
            // en_attente | valide | refuse
            $table->string('statut_preuve')->default('en_attente')->after('type_preuve');
        });
    }

    public function down(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            $table->dropColumn(['preuve_propriete', 'type_preuve', 'statut_preuve']);
        });
    }
};