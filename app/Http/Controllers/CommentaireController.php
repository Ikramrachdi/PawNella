<?php

namespace App\Http\Controllers;

use App\Models\Commentaire;
use Illuminate\Http\Request;

class CommentaireController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'contenu' => 'required|string',
        ]);

        $data['user_id'] = auth()->id();

        $commentaire = Commentaire::create($data);

        return response()->json($commentaire->load('auteur'), 201);
    }

    public function destroy(Commentaire $commentaire)
    {
        if ($commentaire->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $commentaire->delete();

        return response()->json(['message' => 'Commentaire supprimé']);
    }
}