<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReseniaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'receta_id' => 'required|exists:recetas,id',
            'usuario_id' => 'required|exists:users,id',
            'puntuacion' => 'required|numeric|between:0,5',
            'comentario' => 'required|string|max:500'
        ];
    }
}
