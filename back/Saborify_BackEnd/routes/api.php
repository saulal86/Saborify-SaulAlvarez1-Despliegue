<?php

use App\Http\Controllers\Api\AIRecipeController;
use App\Http\Controllers\Api\AlergenosApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\IngredientesApiController;
use App\Http\Controllers\Api\RecetasApiController;
use App\Http\Controllers\Api\ReseñasApiController;
use App\Http\Controllers\Api\TipoComidaController;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ProfileController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/recetas', [RecetasApiController::class, 'index'])->name('recetas');
Route::get('/recetas/{receta}', [RecetasApiController::class, 'show'])->name('receta');
Route::put('/recetas/{receta}', [RecetasApiController::class, 'update'])->middleware('auth:sanctum');
Route::post('/recetas', [RecetasApiController::class, 'store'])->name('creaReceta')->middleware('auth:sanctum');
Route::delete('/recetas/{receta}', [RecetasApiController::class, 'destroy'])->name('eliminaReceta')->middleware('auth:sanctum');
Route::get('/recetasMejorValoradas', [RecetasApiController::class, 'recetasMejorValoradas'])->name('recetasMejorValoradas');
Route::get('/recetasAlergenos/{alergeno}', [RecetasApiController::class, 'recetasSinAlergeno'])->name('recetasPorAlergeno');
Route::get('/recetasMasTiempo', [RecetasApiController::class, 'recetasMasTiempo']);
Route::get('/recetasMenosTiempo', [RecetasApiController::class, 'recetasMenosTiempo']);
Route::get('/recetasPorDificultad/{dificultad}', [RecetasApiController::class, 'recetasPorDificultad']);
Route::post('/subirImagen', [RecetasApiController::class, 'subirImagen']);
Route::get('/dificultades', [RecetasApiController::class, 'dificultades']);
Route::get('/recetasPorUsuario/{usuario}', [RecetasApiController::class, 'recetasPorUsuario'])->name('recetasPorUsuario');

Route::post('/buscar-recetas-ingredientes', [AIRecipeController::class, 'buscarRecetasPorIngredientes']);
Route::get('/ingredientes-populares', [AIRecipeController::class, 'ingredientesPopulares']);
Route::post('/sugerir-ingrediente', [AIRecipeController::class, 'sugerirIngrediente']);
Route::get('/debug-recetas', [AIRecipeController::class, 'debug']);
Route::get('/debug-gemini', [AIRecipeController::class, 'debugGemini']);

Route::get('/ingredientes', [IngredientesApiController::class, 'index'])->name('ingredientes');
Route::get('/{ingrediente}/recetas', [IngredientesApiController::class, 'recetasIngrediente'])->name('ingredientes');
Route::get('/ingredientes-alergenos', [IngredientesApiController::class, 'ingredientesAlergenos'])->name('ingredientesAlergenos');
Route::get('/ingredientes/{ingrediente}', [IngredientesApiController::class, 'show'])->name('ingrediente');
Route::delete('/ingredientes/{ingrediente}', [IngredientesApiController::class, 'destroy'])->name('eliminaIngrediente')->middleware('auth:sanctum');

Route::post('/resenia', [ReseñasApiController::class, 'store'])->name('creaReseña')->middleware('auth:sanctum');
Route::get('/resenias/{receta}', [ReseñasApiController::class, 'show'])->name('reseñasReceta');
Route::delete('/resenias/{resenia}', [ReseñasApiController::class, 'destroy'])->name('eliminaReseña')->middleware('auth:sanctum');

Route::get('/tiposComida', [TipoComidaController::class, 'index'])->name('tiposComida');

Route::get('/alergenos', [AlergenosApiController::class, 'index']);

Route::get('/profile/crearToken', [ProfileController::class, 'crearToken']);

Route::get('/usuarios', [UserApiController::class, 'index']);
Route::put('/actualizar', [UserApiController::class, 'actualizar'])->middleware('auth:sanctum');
Route::post('/login', [UserApiController::class, 'login']);
Route::post('/registro', [UserApiController::class, 'registro']);
Route::post('/googleRegister', [UserApiController::class, 'googleRegister']);

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->middleware('auth:sanctum');
