<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index() {
        return response()->json(
            Notification::where('destinataire_id', auth()->id())
                ->latest()
                ->take(20)
                ->get()
        );
    }

    public function store(Request $request) {
        $request->validate([
            'destinataire_id' => 'required|exists:users,id',
            'type' => 'required|string',
            'message' => 'required|string',
        ]);

        $notification = Notification::create([
            'destinataire_id' => $request->destinataire_id,
            'type' => $request->type,
            'message' => $request->message,
            'est_lue' => false,
        ]);

        return response()->json($notification, 201);
    }

    public function update(Request $request, Notification $notification) {
        $notification->update(['est_lue' => true]);
        return response()->json($notification);
    }

    public function destroy(Notification $notification) {
        $notification->delete();
        return response()->json(['message' => 'Notification supprimée']);
    }
}