<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'destinataire_id', 'type',
        'message', 'est_lue',
    ];

    protected $casts = [
        'est_lue' => 'boolean',
    ];

    public function destinataire() {
        return $this->belongsTo(User::class, 'destinataire_id');
    }
}