<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'user_id', 'type', 'titre', 'description', 'tarif', 'unite', 'photos', 'photo_principale', 'actif', 'especes_acceptees'];

    protected $casts = [
        'photos' => 'array',
        'actif' => 'boolean',
        'especes_acceptees' => 'array',
       
    ];
  


    public function prestataire()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'service_id');
    }
}