<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoComida extends Model
{
    protected $table = 'tipo_comida';
    protected $hidden = ['updated_at', 'created_at'];
    public $timestamps = false;
    protected $fillable = [
        'nombre'
    ];

    public function recetas()
    {
        return $this->belongsToMany(Receta::class, 'tipo_comida_receta', 'tipo_comida_id', 'receta_id')
            ->withTimestamps();
    }
}
