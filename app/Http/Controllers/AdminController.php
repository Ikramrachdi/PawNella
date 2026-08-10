<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // Champs renvoyés pour l'inspection d'un prestataire (documents inclus)
    private function champsPrestataire()
    {
        return [
            'id', 'nom', 'prenom', 'email', 'telephone', 'ville', 'adresse',
            'description', 'tarif', 'services_offerts', 'photo',
            'cin_recto', 'cin_verso', 'selfie',
            'statut_validation', 'est_verifie',
            'needs_review', 'review_reason', 'created_at',
        ];
    }

    // Liste des prestataires en attente de validation
    public function prestatairesEnAttente(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $prestataires = User::where('role', 'prestataire')
            ->where('statut_validation', 'en_attente')
            ->get($this->champsPrestataire());

        return response()->json($prestataires);
    }

    // Liste de TOUS les prestataires (le front filtre par statut)
    public function tousPrestataires(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $prestataires = User::where('role', 'prestataire')
            ->orderByRaw("FIELD(statut_validation, 'en_attente', 'valide', 'rejete')")
            ->latest()
            ->get($this->champsPrestataire());

        return response()->json($prestataires);
    }

    public function valider(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $prestataire = User::where('role', 'prestataire')->findOrFail($id);
        $prestataire->update([
            'statut_validation' => 'valide',
            'est_verifie' => true,
            'needs_review' => false,
            'review_reason' => null,
        ]);

        return response()->json(['message' => 'Prestataire validé', 'prestataire' => $prestataire]);
    }

    public function rejeter(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $prestataire = User::where('role', 'prestataire')->findOrFail($id);
        $prestataire->update([
            'statut_validation' => 'rejete',
            'est_verifie' => false,
            'needs_review' => false,
        ]);

        return response()->json(['message' => 'Prestataire rejeté', 'prestataire' => $prestataire]);
    }

    // Statistiques générales pour le dashboard admin
    public function stats(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json([
            'total_users' => User::count(),
            'total_clients' => User::where('role', 'client')->count(),
            'total_prestataires' => User::where('role', 'prestataire')->count(),
            'prestataires_en_attente' => User::where('role', 'prestataire')->where('statut_validation', 'en_attente')->count(),
            'prestataires_valides' => User::where('role', 'prestataire')->where('statut_validation', 'valide')->count(),
        ]);
    }
}