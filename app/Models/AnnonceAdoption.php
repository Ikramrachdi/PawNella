<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnnonceAdoption extends Model
{
    protected $table = 'annonces_adoptions';

    protected $fillable = [
        'user_id', 'animal_id', 'description',
        'ville', 'photos', 'statut',
    ];

    protected $casts = [
        'photos' => 'array',
    ];

    public function proprietaire() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function animal() {
        return $this->belongsTo(Animal::class);
    }

    public function candidatures() {
        return $this->hasMany(Candidature::class, 'annonces_adoption_id');
    }
}