<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index() {
        return response()->json(
            Message::with('expediteur', 'destinataire')
                ->where('expediteur_id', auth()->id())
                ->orWhere('destinataire_id', auth()->id())
                ->latest()
                ->get()
        );
    }

    public function store(Request $request) {
        $request->validate([
            'destinataire_id' => 'required|exists:users,id',
            'contenu' => 'required|string',
        ]);

        $message = Message::create([
            'expediteur_id' => auth()->id(),
            'destinataire_id' => $request->destinataire_id,
            'contenu' => $request->contenu,
            'est_lu' => false,
        ]);

        return response()->json($message->load('expediteur', 'destinataire'), 201);
    }

    public function show(Message $message) {
        return response()->json($message);
    }

    public function update(Request $request, Message $message) {
        $message->update($request->all());
        return response()->json($message);
    }

    public function destroy(Message $message) {
        $message->delete();
        return response()->json(['message' => 'Message supprimé']);
    }
}