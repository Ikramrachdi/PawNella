<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('prestataire_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->onDelete('set null');
            $table->tinyInteger('note');
            $table->text('commentaire')->nullable();
            $table->timestamps();

            $table->unique(['client_id', 'reservation_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avis');
    }
};