<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candidature extends Model
{
    protected $fillable = [
        'user_id', 'annonces_adoption_id',
        'motivation', 'questionnaire_reponses', 'statut',
    ];

    protected $casts = [
        'questionnaire_reponses' => 'array',
    ];

    public function adoptant() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function annonce() {
        return $this->belongsTo(AnnonceAdoption::class, 'annonces_adoption_id');
    }
}