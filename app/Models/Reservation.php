<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Reservation extends Model
{
    protected $fillable = [
        'proprietaire_id', 'prestataire_id', 'animal_id', 'service_id',
        'type_service', 'ville', 'date_debut', 'date_fin',
        'montant', 'statut', 'notes',
        'adresse_depart', 'adresse_arrivee',
        'statut',
        'statut_trajet',
        'client_nom', 'client_prenom', 'client_telephone', 'client_adresse',
        'responsabilite_acceptee_le', 'sante_lue_le',
    ];
    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'responsabilite_acceptee_le' => 'datetime',
        'sante_lue_le' => 'datetime',
    ];
    public function proprietaire() {
        return $this->belongsTo(User::class, 'proprietaire_id');
    }
    public function prestataire() {
        return $this->belongsTo(User::class, 'prestataire_id');
    }
    public function animal() {
        return $this->belongsTo(Animal::class);
    }
    public function service() {
        return $this->belongsTo(Service::class);
    }
    public function recu() {
        return $this->hasOne(Recu::class);
    }
    public function evaluation() {
        return $this->hasOne(Evaluation::class);
    }
}