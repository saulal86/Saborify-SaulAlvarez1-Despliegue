<?php

namespace App\Http\Resources;

use App\Models\TipoComida;
use App\Models\TipoComidaReceta;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecetaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $tipoComida = [];

        $tipoComidasReceta = TipoComidaReceta::where('receta_id', $this->id)->get();

        foreach ($tipoComidasReceta as $id) {
            $tipoComida[] = TipoComida::where('id', $id->tipo_comida_id)->first()->nombre;
        }

        $this->load('reseñas');

        $mediaValoracion = $this->reseñas->avg('puntuacion');
        $mediaValoracionFormateada = $mediaValoracion ? round($mediaValoracion * 10) / 10 : null;

        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'nombre' => $this->nombre,
            'imagen' => $this->imagen_url,
            'tipoCocina' => $this->tipoCocina,
            'tipoComida' => !empty($tipoComida) ? $tipoComida : $this->tipoComida,
            'tiempoCocinado' => $this->tiempoCocinado,
            'dificultad' => $this->dificultad,
            'porciones' => $this->porciones,
            'caloriasPorPorcion' => $this->caloriasPorPorcion,
            'ingredientes' => new IngredienteNombreCollection($this->ingredientes),
            'pasos' => new PasoNombreCollection($this->pasos),
            'valoracion' => $mediaValoracionFormateada,
        ];
    }
}
