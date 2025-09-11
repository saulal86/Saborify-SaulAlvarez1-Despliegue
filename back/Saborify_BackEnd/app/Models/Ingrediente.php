<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ingrediente extends Model
{
    protected $hidden = ['updated_at', 'created_at'];
    public $timestamps = false;
    protected $fillable = [
        'nombre'
    ];


    public function recetas()
    {
        return $this->belongsToMany(Receta::class);
    }

    public function ingredientesAlergenos()
    {
        return $this->belongsToMany(IngredienteAlergeno::class);
    }

    public function alergenos()
    {
        return $this->belongsToMany(Alergenos::class, 'ingrediente_alergeno', 'ingrediente_id', 'alergeno_id');
    }
}
