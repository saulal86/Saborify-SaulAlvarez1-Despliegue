<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reseña extends Model
{
    public $timestamps = false;
    protected $fillable = ['receta_id', 'usuario_id', 'puntuacion', 'comentario'];

    public function receta()
    {
        return $this->belongsTo(Receta::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class);
    }
}
