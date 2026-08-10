<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request) {
        $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/',
            'role' => 'required|in:client,prestataire,admin',
            'telephone' => 'nullable|string',
            'pays' => 'nullable|string',
            'ville' => 'nullable|string',
            'adresse' => 'nullable|string',
            'description' => 'nullable|string',
            'tarif' => 'nullable|numeric',
            'type_service' => 'nullable|string',
            'cin_recto' => 'nullable|string',
            'cin_verso' => 'nullable|string',
            'selfie' => 'nullable|string',
            'needs_review' => 'nullable|boolean',
            'review_reason' => 'nullable|string',
        ], [
            'email.unique' => 'Cette adresse email est déjà utilisée par un autre compte (client ou prestataire).',
            'email.email' => 'Format d\'email invalide. Exemple : nom@gmail.com',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.regex' => 'Le mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.',
            'nom.required' => 'Le nom est obligatoire.',
            'prenom.required' => 'Le prénom est obligatoire.',
        ]);

        // services_offerts est casté en 'array' : on normalise toujours en tableau minuscule
        $services = null;
        if ($request->filled('type_service')) {
            $services = [strtolower(trim($request->type_service))];
        }

        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'telephone' => $request->telephone,
            'pays' => $request->pays,
            'ville' => $request->ville,
            'adresse' => $request->adresse,
            'description' => $request->description,
            'tarif' => $request->tarif,
            'services_offerts' => $services,
            'cin_recto' => $request->cin_recto,
            'cin_verso' => $request->cin_verso,
            'selfie' => $request->selfie,
            'needs_review' => $request->needs_review ?? false,
            'review_reason' => $request->review_reason,
            'statut_validation' => $request->statut_validation ?? ($request->role === 'prestataire' ? 'en_attente' : 'valide'),
        ]);

        $token = $user->createToken('pawnella')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request) {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('pawnella')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

  public function logout(Request $request) {
        $token = $request->user()?->currentAccessToken();

        // Ne supprime que si c'est un vrai token API (pas une session cookie)
        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        return response()->json(['message' => 'Déconnecté avec succès']);
    }
    public function me(Request $request) {
        return response()->json($request->user());
    }

    public function update(Request $request) {
        $user = $request->user();

        $request->validate([
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'telephone' => 'sometimes|nullable|string',
        ]);

        $user->update($request->only([
            'nom', 'prenom', 'email', 'telephone', 'ville',
            'photo', 'description', 'tarif', 'biographie'
        ]));

        return response()->json($user);
    }
}