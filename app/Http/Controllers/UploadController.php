<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function upload(Request $request) {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $path = $request->file('photo')->store('photos', 'public');
      $url = url(Storage::url($path));

        return response()->json([
            'url' => $url,
            'path' => $path,
        ]);
    }

    public function uploadMultiple(Request $request) {
        $request->validate([
            'photos.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $urls = [];
        foreach ($request->file('photos') as $photo) {
            $path = $photo->store('photos', 'public');
            $urls[] = Storage::url($path);
        }

        return response()->json(['urls' => $urls]);
    }
}