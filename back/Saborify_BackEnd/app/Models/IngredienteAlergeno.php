<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IngredienteAlergeno extends Model
{
    protected $table = 'ingrediente_alergeno';
    protected $fillable = ['ingrediente_id', 'alergeno_id'];

    public function ingrediente()
    {
        return $this->belongsTo(Ingrediente::class, 'ingrediente_id');
    }

    public function alergeno()
    {
        return $this->belongsTo(Alergenos::class, 'alergeno_id');
    }
}
