<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\Participation;
use Illuminate\Http\Request;

class EvenementController extends Controller
{
    public function index()
    {
        return response()->json(
            Evenement::with('user', 'participations')->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string',
            'description' => 'nullable|string',
            'date' => 'required|date|after:now',
            'lieu' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'frais' => 'nullable|numeric|min:0',
            'places_max' => 'nullable|integer|min:1',
        ]);

        $evenement = Evenement::create([
            'user_id' => auth()->id(),
            'titre' => $request->titre,
            'description' => $request->description,
            'date' => $request->date,
            'lieu' => $request->lieu,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'frais' => $request->frais ?? 0,
            'places_max' => $request->places_max,
            'max_participants' => $request->places_max ?? 50,
        ]);

        return response()->json($evenement->load('user', 'participations'), 201);
    }

    public function show(Evenement $evenement)
    {
        return response()->json($evenement->load('user', 'participations'));
    }

    public function update(Request $request, Evenement $evenement)
    {
        if ($evenement->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $evenement->update([
            'titre' => $request->titre ?? $evenement->titre,
            'description' => $request->description ?? $evenement->description,
            'date' => $request->date ?? $evenement->date,
            'lieu' => $request->lieu ?? $evenement->lieu,
            'latitude' => $request->latitude ?? $evenement->latitude,
            'longitude' => $request->longitude ?? $evenement->longitude,
            'frais' => $request->frais ?? $evenement->frais,
            'places_max' => $request->places_max ?? $evenement->places_max,
        ]);

        return response()->json($evenement->load('user', 'participations'));
    }

    public function destroy(Evenement $evenement)
    {
        if ($evenement->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $evenement->delete();
        return response()->json(['message' => 'Événement supprimé']);
    }

    public function participer(Request $request, $id)
    {
        $evenement = Evenement::with('participations')->findOrFail($id);
        $userId = auth()->id();

        if ($evenement->participations()->where('user_id', $userId)->exists()) {
            return response()->json(['message' => 'Vous participez déjà à cet événement'], 400);
        }

        if ($evenement->places_max && $evenement->participations()->count() >= $evenement->places_max) {
            return response()->json(['message' => 'Cet événement est complet'], 400);
        }

        if (now()->isAfter($evenement->date)) {
            return response()->json(['message' => 'Cet événement est terminé'], 400);
        }

        Participation::create([
            'user_id' => $userId,
            'evenement_id' => $evenement->id,
        ]);

        return response()->json(['message' => 'Participation enregistrée avec succès !']);
    }
}