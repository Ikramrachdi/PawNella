<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Signalement extends Model
{
    protected $fillable = [
        'auteur_id', 'admin_id', 'cible_id',
        'cible_type', 'type', 'description', 'statut',
    ];

    public function auteur() {
        return $this->belongsTo(User::class, 'auteur_id');
    }

    public function admin() {
        return $this->belongsTo(User::class, 'admin_id');
    }
}