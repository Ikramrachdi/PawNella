<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Animal extends Model
{
protected $fillable = [
        'user_id', 'nom', 'espece', 'race',
        'sexe', 'date_naissance', 'photo',
        'preuve_propriete', 'type_preuve', 'statut_preuve',
        'caractere', 'statut',
        'a_probleme_sante', 'probleme_sante', 'traitement',
        'consignes_sante', 'veterinaire', 'contact_urgence_sante',
        'sante_certifiee_le',
    ];

    protected $casts = [
        'date_naissance' => 'date',
    ];

    public function proprietaire() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function sante() {
        return $this->hasOne(Sante::class);
    }

    public function posts() {
        return $this->hasMany(Post::class);
    }

    public function annonces() {
        return $this->hasMany(AnnonceAdoption::class);
    }
}