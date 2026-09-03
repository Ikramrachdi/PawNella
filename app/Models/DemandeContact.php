<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemandeContact extends Model
{
    protected $table = 'demandes_contact';

    protected $fillable = [
        'user_id', 'nom', 'email', 'type', 'objet', 'message', 'statut',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}