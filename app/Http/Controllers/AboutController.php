<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AnnonceAdoption;
use Illuminate\Http\Request;

class AboutController extends Controller
{
    public function stats()
    {
        $prestatairesVerifies = User::where('role', 'prestataire')
            ->where('statut_validation', 'valide')
            ->count();

        $animauxAdoptes = AnnonceAdoption::where('statut', 'adoptee')->count();

        $villes = User::whereNotNull('ville')
            ->where('ville', '!=', '')
            ->distinct()
            ->count('ville');

        $utilisateurs = User::count();

            return response()->json([
            'prestataires_verifies' => $prestatairesVerifies,
            'animaux_adoptes' => $animauxAdoptes,
            'villes' => $villes,
            'utilisateurs' => $utilisateurs,
            'animaux' => \App\Models\Animal::count(),
            'services' => \App\Models\Service::where('actif', true)->count(),
            'reservations' => \App\Models\Reservation::count(),
        ]);
    }
}