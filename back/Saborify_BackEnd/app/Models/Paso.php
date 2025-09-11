<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paso extends Model
{
    protected $table = "receta_pasos";
    protected $hidden = ['updated_at', 'created_at'];
    public $timestamps = false;
    protected $fillable = [
        'receta_id',
        'paso'
    ];

    public function receta()
    {
        return $this->belongsTo(Receta::class);
    }
}
