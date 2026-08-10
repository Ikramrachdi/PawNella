<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\User;
use Illuminate\Http\Request;

class AvisController extends Controller
{
    // Avis d'un prestataire précis (public)
    public function index($prestataireId)
    {
        $avis = Avis::with('client:id,prenom,nom,photo')
            ->where('prestataire_id', $prestataireId)
            ->latest()
            ->get();

        return response()->json([
            'avis'     => $avis,
            'moyenne'  => round($avis->avg('note'), 1),
            'total'    => $avis->count(),
        ]);
    }

    // Avis reçus par le prestataire connecté
    public function mesAvis(Request $request)
    {
        $avis = Avis::with('client:id,prenom,nom,photo')
            ->where('prestataire_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'avis'     => $avis,
            'moyenne'  => round($avis->avg('note'), 1),
            'total'    => $avis->count(),
        ]);
    }

    // Déposer un avis
    public function store(Request $request)
    {
        $data = $request->validate([
            'prestataire_id' => 'required|exists:users,id',
            'reservation_id' => 'nullable|exists:reservations,id',
            'note'           => 'required|integer|min:1|max:5',
            'commentaire'    => 'nullable|string|max:1000',
        ]);

        $data['client_id'] = $request->user()->id;

        if ($data['client_id'] == $data['prestataire_id']) {
            return response()->json(['message' => 'Vous ne pouvez pas vous noter vous-même.'], 422);
        }

        $avis = Avis::create($data);

        // Recalcule la note moyenne du prestataire
        $moyenne = Avis::where('prestataire_id', $data['prestataire_id'])->avg('note');
        User::where('id', $data['prestataire_id'])->update(['note_moyenne' => round($moyenne, 1)]);

        return response()->json($avis->load('client:id,prenom,nom,photo'), 201);
    }
}