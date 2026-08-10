<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'expediteur_id', 'destinataire_id',
        'contenu', 'media_url', 'est_lu',
    ];

    protected $casts = [
        'est_lu' => 'boolean',
    ];

    public function expediteur() {
        return $this->belongsTo(User::class, 'expediteur_id');
    }

    public function destinataire() {
        return $this->belongsTo(User::class, 'destinataire_id');
    }
}