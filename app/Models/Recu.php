<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recu extends Model
{
    protected $fillable = [
        'reservation_id', 'montant', 'type_service',
        'date_emission', 'statut', 'confirme_par_owner',
        'pdf_url',
    ];

    protected $casts = [
        'date_emission' => 'datetime',
        'confirme_par_owner' => 'boolean',
    ];

    public function reservation() {
        return $this->belongsTo(Reservation::class);
    }
}