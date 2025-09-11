<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoComida;
use Illuminate\Http\Request;

class TipoComidaController extends Controller
{
    public function index()
    {
        return TipoComida::all();
    }
}
