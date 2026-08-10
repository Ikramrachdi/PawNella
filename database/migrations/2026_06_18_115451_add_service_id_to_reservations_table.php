<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignId('service_id')->nullable()->after('animal_id')->constrained('services')->onDelete('set null');
            $table->string('ville')->nullable()->after('type_service');
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->unsignedBigInteger('animal_id')->nullable()->change();
        });
    }

    public function down(): void {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->dropColumn(['service_id', 'ville']);
        });
    }
};