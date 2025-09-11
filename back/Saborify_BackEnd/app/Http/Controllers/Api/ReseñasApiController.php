<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReseniaRequest;
use App\Http\Requests\ReseñaRequest;
use App\Http\Resources\RecetaReseñasCollection;
use App\Http\Resources\ReseñaResource;
use App\Models\Receta;
use App\Models\Reseña;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReseñasApiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create() {}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'receta_id' => 'required|integer|exists:recetas,id',
            'usuario_id' => 'required|integer|exists:users,id',
            'puntuacion' => 'required|integer|min:1|max:5',
            'comentario' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $existingReview = Reseña::where('receta_id', $request->receta_id)
            ->where('usuario_id', $request->usuario_id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'Ya has publicado una reseña para esta receta'
            ], 409);
        }

        $reseña = Reseña::create([
            'receta_id' => $request->receta_id,
            'usuario_id' => $request->usuario_id,
            'puntuacion' => $request->puntuacion,
            'comentario' => $request->comentario,
        ]);

        return response()->json([
            'message' => 'Reseña creada con éxito',
            'data' => $reseña
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $receta = Receta::where("id", "=", $id)->get();
        return new RecetaReseñasCollection($receta);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $reseña = Reseña::findOrFail($id);
        $reseña->delete();

        return response()->json(['message' => 'Reseña eliminada correctamente']);
    }
}
