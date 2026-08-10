<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AnimalController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\AnnonceAdoptionController;
use App\Http\Controllers\CandidatureController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\SignalementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\PrestatairController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\AvisController;

// ============================
// ROUTES PUBLIQUES (sans connexion)
// ============================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/prestataires', [PrestatairController::class, 'index']);
Route::get('/prestataires/{id}', [PrestatairController::class, 'show']);

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);

Route::get('/annonces', [AnnonceAdoptionController::class, 'index']);
Route::get('/annonces/{annonce}', [AnnonceAdoptionController::class, 'show']);
Route::get('/about/stats', [AboutController::class, 'stats']);

Route::get('/prestataires/{id}/avis', [AvisController::class, 'index']);

Route::post('/upload', [UploadController::class, 'upload']);
Route::post('/upload-multiple', [UploadController::class, 'uploadMultiple']);

// ============================
// ROUTES PROTÉGÉES (connexion requise)
// ============================
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'update']);
    Route::get('/mes-avis', [AvisController::class, 'mesAvis']);
    Route::post('/avis', [AvisController::class, 'store']);

    Route::apiResource('animals', AnimalController::class);
    Route::apiResource('posts', PostController::class);

    Route::post('/annonces', [AnnonceAdoptionController::class, 'store']);
    Route::put('/annonces/{annonce}', [AnnonceAdoptionController::class, 'update']);
    Route::delete('/annonces/{annonce}', [AnnonceAdoptionController::class, 'destroy']);

    Route::apiResource('candidatures', CandidatureController::class);
    Route::apiResource('messages', MessageController::class);
    Route::apiResource('reservations', ReservationController::class);
    Route::apiResource('evenements', EvenementController::class);
    Route::post('/evenements/{id}/participer', [EvenementController::class, 'participer']);
    Route::apiResource('signalements', SignalementController::class);
    Route::apiResource('notifications', NotificationController::class);

    Route::get('/mes-services', [ServiceController::class, 'mesServices']);
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

    // Admin
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    Route::get('/admin/prestataires-en-attente', [AdminController::class, 'prestatairesEnAttente']);
    Route::get('/admin/prestataires', [AdminController::class, 'tousPrestataires']);
    Route::post('/admin/prestataires/{id}/valider', [AdminController::class, 'valider']);
    Route::post('/admin/prestataires/{id}/rejeter', [AdminController::class, 'rejeter']);
});