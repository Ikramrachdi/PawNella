<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('animal_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['photo', 'video', 'texte'])->default('texte');
            $table->text('contenu');
            $table->string('media_url')->nullable();
            $table->enum('visibilite', ['public', 'prive', 'amis'])->default('public');
            $table->integer('likes')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('posts');
    }
};