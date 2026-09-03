<?php

namespace App\Http\Controllers;

use App\Models\DemandeContact;
use Illuminate\Http\Request;

class DemandeContactController extends Controller
{
    // Enregistrer une demande (public : connecté ou non)
    public function store(Request $request)
    {
               $data = $request->validate([
            'nom'       => 'required|string|max:255',
            'email'     => 'required|email|max:255',
            'telephone' => 'nullable|string|max:30',
            'type'      => 'required|string|max:100',
            'objet'     => 'required|string|max:255',
            'message'   => 'required|string|max:2000',
        ]);

        $data['user_id'] = auth('sanctum')->id(); // null si non connecté
        $data['statut'] = 'nouvelle';

        DemandeContact::create($data);

        return response()->json(['message' => 'Votre demande a bien été envoyée !'], 201);
    }

    // Liste des demandes (admin)
    public function index()
    {
        $demandes = DemandeContact::with('user:id,prenom,nom')
            ->latest()
            ->get();

        return response()->json($demandes);
    }

    // Marquer comme traitée (admin)
    public function update(Request $request, DemandeContact $demande)
    {
        $demande->update(['statut' => $request->statut ?? 'traitee']);
        return response()->json($demande);
    }
}