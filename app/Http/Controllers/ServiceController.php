<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::with('prestataire')->where('actif', true);

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('ville') && $request->ville) {
            $query->whereHas('prestataire', function ($q) use ($request) {
                $q->where('ville', 'like', '%' . $request->ville . '%');
            });
        }

        $services = $query->latest()->get();
        return response()->json($services);
    }

    public function mesServices(Request $request)
    {
        $services = Service::where('user_id', $request->user()->id)->latest()->get();
        return response()->json($services);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Seuls les prestataires peuvent créer des services'], 403);
        }

        if ($user->statut_validation === 'en_attente') {
            return response()->json(['message' => 'Votre compte est en cours de validation. Vous pourrez publier des services une fois validé par notre équipe.'], 403);
        }

        if ($user->statut_validation === 'rejete') {
            return response()->json(['message' => 'Votre compte a été rejeté. Contactez le support pour plus d\'informations.'], 403);
        }

        $request->validate([
            'type' => 'required|in:promenade,garde,pension,visite,toilettage,taxi,soins,dressage',
            'titre' => 'required|string',
            'description' => 'nullable|string',
            'tarif' => 'required|numeric|min:0.01',
            'unite' => 'nullable|string',
            'photos' => 'nullable|array',
            'photo_principale' => 'nullable|string',
        ]);

        $service = Service::create([
            'user_id' => $user->id,
            'type' => $request->type,
            'titre' => $request->titre,
            'description' => $request->description,
            'tarif' => $request->tarif,
            'unite' => $request->unite ?? '30min',
            'photos' => $request->photos ?? [],
            'photo_principale' => $request->photo_principale,
            'actif' => true,
        ]);

        return response()->json($service, 201);
    }

    public function show(Service $service)
    {
        return response()->json($service->load('prestataire'));
    }

    public function update(Request $request, Service $service)
    {
        if ($service->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $service->update($request->only([
            'type', 'titre', 'description', 'tarif', 'unite', 'photos', 'photo_principale', 'actif'
        ]));

        return response()->json($service);
    }

    public function destroy(Request $request, Service $service)
    {
        if ($service->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $service->delete();
        return response()->json(['message' => 'Service supprimé']);
    }
}