<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Avis;
use App\Models\Reservation;
use Illuminate\Http\Request;

class PrestatairController extends Controller
{
    public function index(Request $request) {
        $query = User::where('role', 'prestataire')
            ->where('statut_validation', 'valide');

        if ($request->ville) {
            $query->where('ville', 'like', '%' . $request->ville . '%');
        }

        if ($request->service) {
            $service = strtolower(trim($request->service));
            $query->whereRaw('LOWER(services_offerts) LIKE ?', ['%' . $service . '%']);
        }

        return response()->json($query->get([
            'id', 'nom', 'prenom', 'photo', 'ville',
            'description', 'services_offerts', 'tarif',
            'note_moyenne', 'est_verifie', 'telephone'
        ]));
    }

    public function show($id) {
        $prestataire = User::where('role', 'prestataire')->findOrFail($id);

        $totalAvis = Avis::where('prestataire_id', $id)->count();
        $moyenne   = Avis::where('prestataire_id', $id)->avg('note');

        $totalReservations = Reservation::where('prestataire_id', $id)
            ->whereIn('statut', ['acceptee', 'terminee'])
            ->count();

        $data = $prestataire->toArray();
        $data['note_moyenne']       = $totalAvis > 0 ? round($moyenne, 1) : null;
        $data['total_avis']         = $totalAvis;
        $data['total_reservations'] = $totalReservations;

        return response()->json($data);
    }
}