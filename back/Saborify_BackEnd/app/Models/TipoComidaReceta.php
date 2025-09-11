<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoComidaReceta extends Model
{
    protected $table = 'tipo_comida_receta';
    protected $hidden = ['updated_at', 'created_at'];
    public $timestamps = false;
    protected $fillable = [
        'receta_id',
        'tipo_comida_id'
    ];
}
