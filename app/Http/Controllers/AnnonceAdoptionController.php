<?php

namespace App\Http\Controllers;

use App\Models\AnnonceAdoption;
use Illuminate\Http\Request;

class AnnonceAdoptionController extends Controller
{
    public function index() {
        return response()->json(
            AnnonceAdoption::with('animal', 'proprietaire')->latest()->get()
        );
    }

    public function store(Request $request) {
        $request->validate([
            'animal_id' => 'required|exists:animals,id',
            'description' => 'required|string',
            'ville' => 'required|string',
        ]);

        $annonce = AnnonceAdoption::create([
            'user_id' => auth()->id(),
            'animal_id' => $request->animal_id,
            'description' => $request->description,
            'ville' => $request->ville,
            'statut' => 'active',
        ]);

        return response()->json($annonce->load('animal'), 201);
    }

    public function show(AnnonceAdoption $annonce) {
        return response()->json($annonce->load('animal', 'candidatures'));
    }

    public function update(Request $request, AnnonceAdoption $annonce) {
        $annonce->update($request->all());
        return response()->json($annonce);
    }

    public function destroy(AnnonceAdoption $annonce) {
        $annonce->delete();
        return response()->json(['message' => 'Annonce supprimée']);
    }
}