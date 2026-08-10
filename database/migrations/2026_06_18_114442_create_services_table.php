<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['promenade', 'garde', 'pension', 'visite', 'toilettage', 'taxi', 'soins', 'dressage']);
            $table->string('titre');
            $table->text('description')->nullable();
            $table->decimal('tarif', 10, 2);
            $table->string('unite')->default('30min');
            $table->json('photos')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('services');
    }
};