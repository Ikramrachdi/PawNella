<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('santes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')->constrained()->onDelete('cascade');
            $table->json('allergies')->nullable();
            $table->json('medicaments')->nullable();
            $table->json('vaccins')->nullable();
            $table->string('veterinaire')->nullable();
            $table->date('dernier_controle')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('santes');
    }
};