<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Notification;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index() {
        return response()->json(
            Reservation::with('animal', 'proprietaire', 'prestataire', 'service')
                ->where('proprietaire_id', auth()->id())
                ->orWhere('prestataire_id', auth()->id())
                ->latest()
                ->get()
        );
    }

    public function store(Request $request) {
        $request->validate([
            'prestataire_id' => 'required|exists:users,id',
            'service_id' => 'nullable|exists:services,id',
            'animal_id' => 'nullable|exists:animals,id',
            'type_service' => 'required|string',
            'ville' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date',
            'montant' => 'required|numeric',
        ]);

        $reservation = Reservation::create([
            'proprietaire_id' => auth()->id(),
            'prestataire_id' => $request->prestataire_id,
            'service_id' => $request->service_id,
            'animal_id' => $request->animal_id,
            'type_service' => $request->type_service,
            'ville' => $request->ville,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'montant' => $request->montant,
            'notes' => $request->notes,
            'statut' => 'en_attente',
        ]);

        // Notifier le prestataire de la nouvelle demande
        Notification::create([
            'destinataire_id' => $reservation->prestataire_id,
            'type' => 'reservation',
            'message' => 'Nouvelle réservation pour : ' . $reservation->type_service,
            'est_lue' => false,
        ]);

        return response()->json($reservation->load('animal', 'prestataire', 'service'), 201);
    }

    public function show(Reservation $reservation) {
        return response()->json($reservation->load('animal', 'proprietaire', 'prestataire', 'service'));
    }

    public function update(Request $request, Reservation $reservation) {
        $reservation->update($request->all());
        return response()->json($reservation);
    }

    public function destroy(Reservation $reservation) {
        $reservation->delete();
        return response()->json(['message' => 'Réservation supprimée']);
    }
}