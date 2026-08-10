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
        Schema::table('evenements', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)->nullable()->after('lieu');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->decimal('frais', 8, 2)->default(0)->after('longitude');
            $table->integer('places_max')->nullable()->after('frais');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'frais', 'places_max']);
        });
    }
};