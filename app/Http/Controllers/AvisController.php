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
            ->where('type', 'client_vers_prestataire')
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
            ->where('type', 'client_vers_prestataire')
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
            'client_id'      => 'nullable|exists:users,id',
            'reservation_id' => 'nullable|exists:reservations,id',
            'note'           => 'required|integer|min:1|max:5',
            'commentaire'    => 'nullable|string|max:1000',
            'type'           => 'nullable|string',
        ]);

        $type = $data['type'] ?? 'client_vers_prestataire';

        if ($type === 'prestataire_vers_client') {
            // Le prestataire note le client
            $data['prestataire_id'] = $request->user()->id;
            // client_id vient de la requête (le client noté)
        } else {
            // Le client note le prestataire (comportement existant)
            $data['client_id'] = $request->user()->id;
        }
        $data['type'] = $type;

        if ($data['client_id'] == $data['prestataire_id']) {
            return response()->json(['message' => 'Vous ne pouvez pas vous noter vous-même.'], 422);
        }

        $avis = Avis::create($data);

              // Recalcule la note moyenne du prestataire (uniquement les avis reçus des clients)
        if ($type === 'client_vers_prestataire') {
            $moyenne = Avis::where('prestataire_id', $data['prestataire_id'])
                ->where('type', 'client_vers_prestataire')
                ->avg('note');
            User::where('id', $data['prestataire_id'])->update(['note_moyenne' => round($moyenne, 1)]);
        }

        return response()->json($avis->load('client:id,prenom,nom,photo'), 201);
    }
        // Avis reçus par le client connecté (notes données par les prestataires)
    public function mesAvisClient(Request $request)
    {
        $avis = Avis::with('prestataire:id,prenom,nom,photo')
            ->where('client_id', $request->user()->id)
            ->where('type', 'prestataire_vers_client')
            ->latest()
            ->get();

        return response()->json([
            'avis'    => $avis,
            'moyenne' => round($avis->avg('note'), 1),
            'total'   => $avis->count(),
        ]);
    }
}