<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            $table->string('taille')->nullable()->after('caractere');   // petit / moyen / grand
            $table->decimal('poids', 5, 2)->nullable()->after('taille'); // en kg
        });
    }

    public function down(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            $table->dropColumn(['taille', 'poids']);
        });
    }
};