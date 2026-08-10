<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        // Changer le type en string d'abord
        DB::statement("ALTER TABLE users MODIFY role VARCHAR(50) DEFAULT 'client'");
        
        // Mettre à jour les anciens rôles
        DB::table('users')->where('role', 'proprietaire')->update(['role' => 'client']);
        DB::table('users')->where('role', 'adoptant')->update(['role' => 'client']);
        DB::table('users')->where('role', 'invite')->update(['role' => 'client']);
        
        // Remettre en ENUM avec les nouveaux rôles
        DB::statement("ALTER TABLE users MODIFY role ENUM('client', 'prestataire', 'admin') DEFAULT 'client'");
    }

    public function down(): void {
        DB::statement("ALTER TABLE users MODIFY role VARCHAR(50) DEFAULT 'client'");
    }
};