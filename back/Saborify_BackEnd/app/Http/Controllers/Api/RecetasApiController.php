<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CrearRecetaRequest;
use App\Http\Resources\RecetaCollection;
use App\Http\Resources\RecetaResource;
use App\Models\Ingrediente;
use App\Models\Receta;
use App\Models\TipoComida;
use Illuminate\Http\Request;

class RecetasApiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $recetas = Receta::all();
        return new RecetaCollection($recetas);
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(CrearRecetaRequest $request)
    {
        $datos = $request->validated();

        $ingredientesNombres = $datos['ingredientes'] ?? [];
        $pasos = $datos['pasos'] ?? [];
        $tiposComida = $datos['tipoComida'] ?? [];

        unset($datos['ingredientes']);
        unset($datos['pasos']);
        unset($datos['tipoComida']);

        $receta = Receta::create($datos);

        $ingredientesIds = [];
        foreach ($ingredientesNombres as $nombre) {
            $ingrediente = Ingrediente::firstOrCreate(['nombre' => $nombre]);
            $ingredientesIds[] = $ingrediente->id;
        }
        $receta->ingredientes()->sync($ingredientesIds);

        if (!empty($pasos)) {
            $pasosData = [];

            foreach ($pasos as $paso) {
                $pasosData[] = [
                    'receta_id' => $receta->id,
                    'paso' => $paso
                ];
            }

            $receta->pasos()->createMany($pasosData);
        }

        if (!empty($tiposComida)) {
            $tiposComidaIds = [];

            foreach ($tiposComida as $nombreTipo) {
                $tipoComida = TipoComida::firstOrCreate(['nombre' => $nombreTipo]);
                $tiposComidaIds[] = $tipoComida->id;
            }

            $receta->tipoComida()->sync($tiposComidaIds);
        }

        $receta->load(['ingredientes', 'pasos', 'tipoComida']);

        return new RecetaResource($receta);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $receta = Receta::where("id", "=", $id)->get();
        return new RecetaCollection($receta);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CrearRecetaRequest $request, Receta $receta)
    {
        $datos = $request->validated();

        $receta->update([
            'nombre' => $datos['nombre'] ?? $receta->nombre,
            'dificultad' => $datos['dificultad'] ?? $receta->dificultad,
            'imagen' => $datos['imagen'] ?? $receta->imagen,
            'tiempoCocinado' => $datos['tiempoCocinado'] ?? $receta->tiempoCocinado,
            'tipoComida' => $datos['tipoComida'] ?? $receta->tipoComida
        ]);

        if (isset($datos['ingredientes']) && is_array($datos['ingredientes'])) {
            $ingredientesIds = [];

            foreach ($datos['ingredientes'] as $ingredienteData) {
                $nombreIngrediente = $ingredienteData['nombreIngrediente'] ?? null;

                if ($nombreIngrediente) {
                    $ingrediente = Ingrediente::firstOrCreate(['nombre' => $nombreIngrediente]);
                    $ingredientesIds[] = $ingrediente->id;
                }
            }

            $receta->ingredientes()->sync($ingredientesIds);
        }

        if (isset($datos['pasos']) && is_array($datos['pasos'])) {
            $receta->pasos()->delete();

            $pasosData = [];
            foreach ($datos['pasos'] as $pasoData) {
                $textoPaso = $pasoData['nombrePaso'] ?? null;

                if ($textoPaso) {
                    $pasosData[] = [
                        'receta_id' => $receta->id,
                        'paso' => $textoPaso
                    ];
                }
            }

            if (!empty($pasosData)) {
                $receta->pasos()->createMany($pasosData);
            }
        }

        if (isset($datos['tipoComida']) && is_array($datos['tipoComida'])) {
            $tiposComidaIds = [];

            foreach ($datos['tipoComida'] as $tipoComidaData) {
                $nombreTipoComida = is_array($tipoComidaData) ?
                    ($tipoComidaData['nombre'] ?? null) :
                    $tipoComidaData;

                if ($nombreTipoComida) {
                    $tipoComida = TipoComida::firstOrCreate(['nombre' => $nombreTipoComida]);
                    $tiposComidaIds[] = $tipoComida->id;
                }
            }

            if (!empty($tiposComidaIds)) {
                $receta->tipoComida()->sync($tiposComidaIds);
            }
        }

        $receta->load(['ingredientes', 'pasos', 'tipoComida']);

        return new RecetaResource($receta);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {

            $receta = Receta::findOrFail($id);

            $receta->ingredientes()->detach();

            $receta->reseñas()->delete();

            $receta->pasos()->delete();

            $receta->tipoComida()->detach();

            $receta->delete();


            return response()->json(['message' => 'Receta eliminada correctamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar la receta', 'error' => $e->getMessage()], 500);
        }
    }

    public function recetasMejorValoradas()
    {
        $recetas = Receta::with('reseñas')
            ->withAvg('reseñas', 'puntuacion')
            ->orderByDesc('reseñas_avg_puntuacion')
            ->take(9)
            ->get();

        return new RecetaCollection($recetas);
    }

    public function recetasSinAlergeno($alergeno)
    {
        $recetas = Receta::whereDoesntHave('ingredientes', function ($query) use ($alergeno) {
            $query->whereHas('alergenos', function ($query) use ($alergeno) {
                $query->where('nombre', $alergeno);
            });
        })->get();

        return new RecetaCollection($recetas);
    }

    public function recetasMasTiempo()
    {
        $recetas = Receta::orderBy('tiempoCocinado', 'desc')->get();
        return new RecetaCollection($recetas);
    }

    public function recetasMenosTiempo()
    {
        $recetas = Receta::orderBy('tiempoCocinado', 'asc')->get();
        return new RecetaCollection($recetas);
    }

    public function recetasPorDificultad($dificultad)
    {
        $recetas = Receta::where('dificultad', $dificultad)->get();
        return new RecetaCollection($recetas);
    }


    public function subirImagen(Request $request)
    {
        $request->validate([
            'imagen' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        try {
            if ($request->hasFile('imagen')) {
                $imagen = $request->file('imagen');

                $nombreImagen = time() . '_' . uniqid() . '.' . $imagen->getClientOriginalExtension();

                $rutaImagen = $imagen->storeAs('recetas', $nombreImagen, 'public');

                $urlImagen = asset('storage/' . $rutaImagen);

                return response()->json([
                    'mensaje' => 'Imagen subida correctamente',
                    'url' => $urlImagen
                ], 200);
            }

            return response()->json([
                'error' => 'No se encontró ninguna imagen'
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al subir la imagen',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    public function recetasPorTipoComida($tipoComida)
    {
        $recetas = Receta::whereHas('tipoComida', function ($query) use ($tipoComida) {
            $query->where('nombre', $tipoComida);
        })->get();

        return new RecetaCollection($recetas);
    }


    public function dificultades(){
        $recetas = Receta::select('dificultad')->distinct()->get();

        return response()->json($recetas);
    }

    public function recetasPorUsuario($id)
    {
        $recetas = Receta::where('usuario_id', $id)->get();
        return new RecetaCollection($recetas);
    }
}
