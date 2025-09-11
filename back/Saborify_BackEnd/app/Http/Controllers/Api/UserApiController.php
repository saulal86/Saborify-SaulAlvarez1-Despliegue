<?php

namespace App\Http\Controllers\Api;

use Google\Client as GoogleClient;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class UserApiController extends Controller
{

    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'user' => $user,
            'token' => $token
        ]);
    }

    public function registro(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'userName' => 'required|string|max:255|unique:users,userName',
            'password' => 'required|string',
            'role' => 'required|string'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'userName' => $request->userName,
            'password' => Hash::make($request->password),
            'role' => $request->role
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registro exitoso',
            'user' => $user,
            'token' => $token
        ], 201);
    }


    public function googleRegister(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        try {
            $googleClient = new GoogleClient();
            $googleClient->setClientId("601935688943-ktb1sb3nfn3r05k7gnnk7d6ifjajtp2s.apps.googleusercontent.com");

            $payload = $googleClient->verifyIdToken($request->token);

            if ($payload) {
                $googleId = $payload['sub'];
                $name = $payload['name'];
                $email = $payload['email'];

                $user = User::where('google_id', $googleId)
                    ->orWhere('email', $email)
                    ->first();

                if (!$user) {
                    $user = User::create([
                        'name' => $name,
                        'email' => $email,
                        'userName' => explode('@', $email)[0],
                        'google_id' => $googleId,
                        'password' => Hash::make(uniqid()),
                        'role' => 'user'
                    ]);
                }

                $user->tokens()->delete();
                $token = $user->createToken('auth-token')->plainTextToken;

                return response()->json([
                    'message' => 'Autenticación con Google exitosa',
                    'user' => $user,
                    'token' => $token
                ]);
            } else {
                return response()->json(['message' => 'Token de Google no válido'], 401);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al procesar el registro con Google', 'error' => $e->getMessage()], 500);
        }
    }

    public function actualizar(Request $request)
    {
        $userId = $request->user_id ?? ($request->user() ? $request->user()->id : null);

        if (!$userId) {
            return response()->json([
                'message' => 'ID de usuario no proporcionado'
            ], 400);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'userName' => 'required|string|max:255|unique:users,userName,'.$user->id,
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
        ]);

        if ($request->has('current_password')) {
            $validatorPassword = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8',
                'confirm_password' => 'required|same:new_password',
            ]);

            if ($validatorPassword->fails()) {
                return response()->json([
                    'message' => 'Datos de contraseña inválidos',
                    'errors' => $validatorPassword->errors()
                ], 422);
            }

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'La contraseña actual es incorrecta'
                ], 422);
            }
        }

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos de usuario inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user->update([
                'name' => $request->name,
                'userName' => $request->userName,
                'email' => $request->email,
            ]);

            if ($request->has('current_password')) {
                $user->update([
                    'password' => Hash::make($request->new_password)
                ]);
            }

            $message = $request->has('current_password')
                ? 'Datos de perfil y contraseña actualizados correctamente'
                : 'Datos de perfil actualizados correctamente';

            return response()->json([
                'message' => $message,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'userName' => $user->userName,
                    'email' => $user->email,
                ]
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'message' => 'Error al actualizar los datos'
            ], 500);
        }
    }
}
