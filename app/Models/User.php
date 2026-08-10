<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

   protected $fillable = [
    'nom', 'prenom', 'email', 'password',
    'telephone', 'ville', 'pays', 'cin_recto', 'cin_verso', 'selfie', 'photo', 'role',
    'adresse', 'contact_urgence', 'biographie',
    'experience', 'type_logement', 'animaux_existants',
    'description', 'services_offerts', 'tarif',
    'note_moyenne', 'est_verifie', 'statut_validation',
'needs_review', 'review_reason',
    'niveau',
];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'services_offerts' => 'array',
        'animaux_existants' => 'boolean',
        'est_verifie' => 'boolean',
    ];

    public function animals() {
        return $this->hasMany(Animal::class);
    }

    public function posts() {
        return $this->hasMany(Post::class);
    }

    public function annonces() {
        return $this->hasMany(AnnonceAdoption::class);
    }

    public function candidatures() {
        return $this->hasMany(Candidature::class);
    }

    public function messagesEnvoyes() {
        return $this->hasMany(Message::class, 'expediteur_id');
    }

    public function messagesRecus() {
        return $this->hasMany(Message::class, 'destinataire_id');
    }

    public function reservationsProprietaire() {
        return $this->hasMany(Reservation::class, 'proprietaire_id');
    }

    public function reservationsPrestataire() {
        return $this->hasMany(Reservation::class, 'prestataire_id');
    }

    public function evenements() {
        return $this->hasMany(Evenement::class);
    }

    public function notifications() {
        return $this->hasMany(Notification::class, 'destinataire_id');
    }
}