<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evenement extends Model
{
    protected $fillable = [
        'user_id', 'titre', 'description',
        'date', 'lieu', 'max_participants',
        'especes_invitees',
        'latitude', 'longitude', 'frais', 'places_max'
    ];

    protected $casts = [
        'date' => 'datetime',
        'especes_invitees' => 'array',
    ];

    public function organisateur() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

   public function participations() {
    return $this->hasMany(Participation::class);
}
}