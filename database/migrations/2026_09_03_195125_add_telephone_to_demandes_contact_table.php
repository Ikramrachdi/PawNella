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
        Schema::table('demandes_contact', function (Blueprint $table) {
            $table->string('telephone')->nullable()->after('email');
        });
    }

             public function down(): void
    {
        Schema::table('demandes_contact', function (Blueprint $table) {
            $table->dropColumn('telephone');
        });
    }
};