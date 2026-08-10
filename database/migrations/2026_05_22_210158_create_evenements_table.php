<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('evenements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('titre');
            $table->text('description');
            $table->dateTime('date');
            $table->string('lieu');
            $table->integer('max_participants')->default(50);
            $table->json('especes_invitees')->nullable();
            $table->timestamps();
        });
    }

public function down(): void {
        Schema::dropIfExists('evenements');
    }
};