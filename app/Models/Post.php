<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'user_id', 'animal_id', 'type',
        'contenu', 'media_url', 'visibilite', 'likes',
    ];

    public function auteur() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function animal() {
        return $this->belongsTo(Animal::class);
    }

    public function commentaires() {
        return $this->hasMany(Commentaire::class);
    }
}