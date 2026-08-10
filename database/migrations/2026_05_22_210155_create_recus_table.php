<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('recus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained()->onDelete('cascade');
            $table->decimal('montant', 10, 2);
            $table->string('type_service');
            $table->dateTime('date_emission');
            $table->enum('statut', ['genere', 'envoye', 'confirme'])->default('genere');
            $table->boolean('confirme_par_owner')->default(false);
            $table->string('pdf_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('recus');
    }
};