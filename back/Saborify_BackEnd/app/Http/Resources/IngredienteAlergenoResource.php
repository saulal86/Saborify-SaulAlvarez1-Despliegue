<?php

namespace App\Http\Resources;

use App\Models\Ingrediente;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IngredienteAlergenoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'ingrediente' => Ingrediente::where('id', $this->ingrediente_id)->first()->nombre,
        ];
    }
}
