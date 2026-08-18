<?php

namespace App\Http\Controllers;

use App\Models\Animal;
use Illuminate\Http\Request;

class AnimalController extends Controller
{
    // Règles de validation communes à store et update
    private function reglesSante()
    {
        return [
            'a_probleme_sante' => 'nullable|boolean',
            'probleme_sante' => 'nullable|string',
            'traitement' => 'nullable|string',
            'consignes_sante' => 'nullable|string',
            'veterinaire' => 'nullable|string',
            'contact_urgence_sante' => 'nullable|string',
            'sante_certifiee_le' => 'nullable|date',
        ];
    }

    public function index() {
        return response()->json(
            Animal::where('user_id', auth()->id())->get()
        );
    }

    public function store(Request $request) {
        $data = $request->validate(array_merge([
            'nom' => 'required|string',
            'espece' => 'required|string',
            'sexe' => 'required|in:male,femelle',
            'race' => 'nullable|string',
            'date_naissance' => 'nullable|date',
            'caractere' => 'nullable|string',
            'photo' => 'nullable|string',
            'preuve_propriete' => 'nullable|string',
            'type_preuve' => 'nullable|string',
            'taille' => 'nullable|string',
            'poids' => 'nullable|numeric',
        ], $this->reglesSante()));

        $data['user_id'] = auth()->id();
        $data['statut'] = 'disponible';
        $data['statut_preuve'] = !empty($data['preuve_propriete']) ? 'en_attente' : null;

        // Si l'animal est déclaré en bonne santé, on nettoie les champs santé
        if (empty($data['a_probleme_sante'])) {
            $data['probleme_sante'] = null;
            $data['traitement'] = null;
            $data['consignes_sante'] = null;
            $data['veterinaire'] = null;
            $data['contact_urgence_sante'] = null;
            $data['sante_certifiee_le'] = null;
        }

        $animal = Animal::create($data);

        return response()->json($animal, 201);
    }

    public function show(Animal $animal) {
        if ($animal->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        return response()->json($animal);
    }

    public function update(Request $request, Animal $animal) {
        if ($animal->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $data = $request->validate(array_merge([
            'nom' => 'sometimes|required|string',
            'espece' => 'sometimes|required|string',
            'sexe' => 'sometimes|required|in:male,femelle',
            'race' => 'nullable|string',
            'date_naissance' => 'nullable|date',
            'caractere' => 'nullable|string',
            'photo' => 'nullable|string',
            'preuve_propriete' => 'nullable|string',
            'type_preuve' => 'nullable|string',
            'taille' => 'nullable|string',
            'poids' => 'nullable|numeric',
        ], $this->reglesSante()));
        

        // Si le document change, la validation repart de zéro
        if (array_key_exists('preuve_propriete', $data)
            && $data['preuve_propriete'] !== $animal->preuve_propriete) {
            $data['statut_preuve'] = !empty($data['preuve_propriete']) ? 'en_attente' : null;
        }

        // Si l'animal repasse en bonne santé, on nettoie les champs santé
        if (array_key_exists('a_probleme_sante', $data) && empty($data['a_probleme_sante'])) {
            $data['probleme_sante'] = null;
            $data['traitement'] = null;
            $data['consignes_sante'] = null;
            $data['veterinaire'] = null;
            $data['contact_urgence_sante'] = null;
            $data['sante_certifiee_le'] = null;
        }

        $animal->update($data);

        return response()->json($animal);
    }

    public function destroy(Animal $animal) {
        if ($animal->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $animal->delete();
        return response()->json(['message' => 'Animal supprimé']);
    }
}