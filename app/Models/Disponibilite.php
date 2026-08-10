<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Disponibilite extends Model
{
    protected $fillable = [
        'user_id', 'date_debut',
        'date_fin', 'est_disponible',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'est_disponible' => 'boolean',
    ];

    public function prestataire() {
        return $this->belongsTo(User::class, 'user_id');
    }
}