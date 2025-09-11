<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Receta extends Model
{
    protected $hidden = ['updated_at', 'created_at'];
    public $timestamps = false;
    protected $fillable = [
        'nombre',
        'tipoCocina',
        'tiempoCocinado',
        'dificultad',
        'porciones',
        'caloriasPorPorcion',
        'imagen_url',
        'usuario_id'
    ];


    public function ingredientes()
    {
        return $this->belongsToMany(Ingrediente::class);
    }

    public function pasos()
    {
        return $this->hasMany(Paso::class);
    }

    public function reseñas()
    {
        return $this->hasMany(Reseña::class);
    }

    public function tipoComida()
    {
        return $this->belongsToMany(TipoComida::class, 'tipo_comida_receta', 'receta_id', 'tipo_comida_id')
            ->withTimestamps();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function alergenos()
    {
        return $this->belongsToMany(Alergenos::class);
    }
}
