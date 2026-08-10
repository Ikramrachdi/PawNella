<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sante extends Model
{
    protected $fillable = [
        'animal_id', 'allergies', 'medicaments',
        'vaccins', 'veterinaire', 'dernier_controle',
    ];

    protected $casts = [
        'allergies' => 'array',
        'medicaments' => 'array',
        'vaccins' => 'array',
        'dernier_controle' => 'date',
    ];

    public function animal() {
        return $this->belongsTo(Animal::class);
    }
}