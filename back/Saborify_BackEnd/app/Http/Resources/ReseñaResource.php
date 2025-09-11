<?php

namespace App\Http\Resources;

use App\Models\Receta;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReseñaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'usuario' => User::find($this->usuario_id)->name,
            'receta' => Receta::find($this->receta_id)->nombre,
            'puntuacion' => $this->puntuacion,
            'comentario' => $this->comentario
        ];
    }
}
