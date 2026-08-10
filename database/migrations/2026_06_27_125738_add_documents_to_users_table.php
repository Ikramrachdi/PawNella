<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('cin_recto')->nullable()->after('pays');
            $table->string('cin_verso')->nullable()->after('cin_recto');
            $table->string('selfie')->nullable()->after('cin_verso');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['cin_recto', 'cin_verso', 'selfie']);
        });
    }
};