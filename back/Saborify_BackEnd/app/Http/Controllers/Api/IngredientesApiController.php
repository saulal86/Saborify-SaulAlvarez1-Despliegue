<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\IngredienteAlergenoCollection;
use App\Http\Resources\IngredienteCollection;
use App\Http\Resources\RecetaCollection;
use App\Models\Alergenos;
use App\Models\Ingrediente;
use App\Models\IngredienteAlergeno;
use Illuminate\Http\Request;

use function PHPSTORM_META\map;

class IngredientesApiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return new IngredienteCollection(Ingrediente::all());
    }

    public function ingredientesAlergenos()
    {
        $alergenos = Alergenos::all();
        $resultado = [];

        foreach ($alergenos as $alergeno) {
            $ingredientesConAlergeno = IngredienteAlergeno::where('alergeno_id', $alergeno->id)
                ->pluck('ingrediente_id');

            $ingredientesSinAlergeno = Ingrediente::whereNotIn('id', $ingredientesConAlergeno)
                ->get(['id', 'nombre']);

            $resultado[] = [
                'alergeno' => "Sin " . $alergeno->nombre,
                'ingredientes' => $ingredientesSinAlergeno
            ];
        }

        return $resultado;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $producto = Ingrediente::where("id", "=", $id)->get();
        return new IngredienteCollection($producto);
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
        $ingrediente = Ingrediente::findOrFail($id);
        $ingrediente->recetas()->detach();
        $ingrediente->delete();

        return response()->json(['message' => 'Ingrediente eliminado correctamente']);
    }

    public function recetasIngrediente($id){
        $ingrediente = Ingrediente::where('id', $id)->first();
        $recetas = $ingrediente->recetas()->with('ingredientes')->get();

        return new RecetaCollection($recetas);
    }
}
