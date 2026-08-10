<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commentaire extends Model
{
    protected $fillable = [
        'post_id', 'user_id', 'parent_id',
        'contenu', 'likes',
    ];

    public function auteur() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function post() {
        return $this->belongsTo(Post::class);
    }

    public function parent() {
        return $this->belongsTo(Commentaire::class, 'parent_id');
    }

    public function reponses() {
        return $this->hasMany(Commentaire::class, 'parent_id');
    }
}