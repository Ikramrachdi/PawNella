<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index() {
        return response()->json(
Post::with(['auteur', 'commentaires.auteur'])->latest()->get()        );
    }

    public function store(Request $request) {
        $request->validate([
            'contenu' => 'required|string',
        ]);

              $post = Post::create([
            'user_id' => auth()->id(),
            'contenu' => $request->contenu,
            'type' => $request->type ?? 'texte',
            'media_url' => $request->media_url,
            'visibilite' => 'public',
            'likes' => 0,
        ]);

        return response()->json($post->load('auteur'), 201);
    }

    public function show(Post $post) {
        return response()->json($post->load('auteur', 'commentaires'));
    }

    public function update(Request $request, Post $post) {
        $post->update($request->all());
        return response()->json($post);
    }

    public function destroy(Post $post) {
        $post->delete();
        return response()->json(['message' => 'Post supprimé']);
    }
}