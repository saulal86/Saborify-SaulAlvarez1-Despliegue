import { createContext, useContext, useCallback } from 'react';

const ApiContext = createContext();

const API_BASE_URL = 'https://saulal25.iesmontenaranco.com:8000/public/api';

export const useApi = () => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi debe ser usado dentro de un ApiProvider');
    }
    return context;
};

export const ApiProvider = ({ children }) => {

    const handleApiResponse = async (response) => {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    };

    const handleApiError = (error, defaultMessage) => {
        console.error('API Error:', error);
        throw new Error(error.message || defaultMessage);
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        } : {
            'Content-Type': 'application/json',
        };
    };


    const obtenerUsuario = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/user`, {
                headers: getAuthHeaders(),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener el usuario');
        }
    }, []);

    const obtenerUsuarios = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener los usuarios');
        }
    }, []);

    const actualizarUsuario = useCallback(async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/actualizar`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(userData),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al actualizar el usuario');
        }
    }, []);


    const iniciarSesion = useCallback(async (credentials) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al iniciar sesión');
        }
    }, []);

    const registrarUsuario = useCallback(async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/registro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al registrar el usuario');
        }
    }, []);

    const registroConGoogle = useCallback(async (googleData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/googleRegister`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(googleData),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al registrar con Google');
        }
    }, []);

    const cerrarSesion = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al cerrar sesión');
        }
    }, []);


    const obtenerRecetas = useCallback(async (filtros = {}) => {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filtros).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const url = `${API_BASE_URL}/recetas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await fetch(url);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener las recetas');
        }
    }, []);

    const obtenerRecetaPorId = useCallback(async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/recetas/${id}`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener la receta');
        }
    }, []);

    const crearReceta = useCallback(async (recetaData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/recetas`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(recetaData),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al crear la receta');
        }
    }, []);

    const actualizarReceta = useCallback(async (id, recetaData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/recetas/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(recetaData),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al actualizar la receta');
        }
    }, []);

    const eliminarReceta = useCallback(async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/recetas/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al eliminar la receta');
        }
    }, []);

    const obtenerRecetasMejorValoradas = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/recetasMejorValoradas`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener las recetas mejor valoradas');
        }
    }, []);

    const obtenerRecetasSinAlergeno = useCallback(async (alergeno) => {
        try {
            const response = await fetch(`${API_BASE_URL}/recetasAlergenos/${alergeno}`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener las recetas sin alérgeno');
        }
    }, []);

    const obtenerRecetasMasTiempo = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/recetasMasTiempo`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener las recetas con más tiempo');
        }
    }, []);

    const obtenerRecetasMenosTiempo = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/recetasMenosTiempo`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener las recetas con menos tiempo');
        }
    }, []);

    const obtenerRecetasPorDificultad = useCallback(async (dificultad) => {
        try {
            const response = await fetch(`${API_BASE_URL}/recetasPorDificultad/${dificultad}`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener las recetas por dificultad');
        }
    }, []);

    const obtenerDificultades = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/dificultades`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener las dificultades');
        }
    }, []);

    const obtenerRecetasPorUsuario = useCallback(async (usuario) => {
        try {
            const response = await fetch(`${API_BASE_URL}/recetasPorUsuario/${usuario}`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener las recetas por usuario');
        }
    }, []);


    const subirImagen = useCallback(async (imagenFile) => {
        try {
            const formData = new FormData();
            formData.append('imagen', imagenFile);

            const response = await fetch(`${API_BASE_URL}/subirImagen`, {
                method: 'POST',
                body: formData,
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al subir la imagen');
        }
    }, []);


    const buscarRecetasPorIngredientes = useCallback(async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/buscar-recetas-ingredientes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al buscar recetas por ingredientes');
        }
    }, []);

    const obtenerIngredientesPopulares = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/ingredientes-populares`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener ingredientes populares');
        }
    }, []);

    const sugerirIngrediente = useCallback(async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/sugerir-ingrediente`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener sugerencias de ingredientes');
        }
    }, []);

    const debugRecetas = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/debug-recetas`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error en debug de recetas');
        }
    }, []);

    const debugGemini = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/debug-gemini`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error en debug de Gemini');
        }
    }, []);


    const obtenerIngredientes = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/ingredientes`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener los ingredientes');
        }
    }, []);

    const obtenerRecetasDeIngrediente = useCallback(async (ingrediente) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${ingrediente}/recetas`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener recetas del ingrediente');
        }
    }, []);

    const obtenerIngredientesAlergenos = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/ingredientes-alergenos`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener ingredientes con alérgenos');
        }
    }, []);

    const obtenerIngredientePorId = useCallback(async (ingrediente) => {
        try {
            const response = await fetch(`${API_BASE_URL}/ingredientes/${ingrediente}`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener el ingrediente');
        }
    }, []);

    const eliminarIngrediente = useCallback(async (ingrediente) => {
        try {
            const response = await fetch(`${API_BASE_URL}/ingredientes/${ingrediente}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al eliminar el ingrediente');
        }
    }, []);


    const crearResenia = useCallback(async (reseniaData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/resenia`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(reseniaData),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al crear la reseña');
        }
    }, []);

    const obtenerReseniasReceta = useCallback(async (receta) => {
        try {
            const response = await fetch(`${API_BASE_URL}/resenias/${receta}`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener las reseñas de la receta');
        }
    }, []);

    const eliminarResenia = useCallback(async (resenia) => {
        try {
            const response = await fetch(`${API_BASE_URL}/resenias/${resenia}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al eliminar la reseña');
        }
    }, []);


    const obtenerTiposComida = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tiposComida`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al cargar los tipos de comida');
        }
    }, []);


    const obtenerAlergenos = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/alergenos`);
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al obtener los alérgenos');
        }
    }, []);


    const crearToken = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/profile/crearToken`, {
                headers: getAuthHeaders(),
            });
            return await handleApiResponse(response);
        } catch (error) {
            handleApiError(error, 'Error al crear el token');
        }
    }, []);

    const contextValue = {
        obtenerUsuario,
        obtenerUsuarios,
        actualizarUsuario,

        iniciarSesion,
        registrarUsuario,
        registroConGoogle,
        cerrarSesion,

        obtenerRecetas,
        obtenerRecetaPorId,
        crearReceta,
        actualizarReceta,
        eliminarReceta,
        obtenerRecetasMejorValoradas,
        obtenerRecetasSinAlergeno,
        obtenerRecetasMasTiempo,
        obtenerRecetasMenosTiempo,
        obtenerRecetasPorDificultad,
        obtenerDificultades,
        obtenerRecetasPorUsuario,

        subirImagen,

        buscarRecetasPorIngredientes,
        obtenerIngredientesPopulares,
        sugerirIngrediente,
        debugRecetas,
        debugGemini,

        obtenerIngredientes,
        obtenerRecetasDeIngrediente,
        obtenerIngredientesAlergenos,
        obtenerIngredientePorId,
        eliminarIngrediente,

        crearResenia,
        obtenerReseniasReceta,
        eliminarResenia,

        obtenerTiposComida,

        obtenerAlergenos,

        crearToken,
    };

    return (
        <ApiContext.Provider value={contextValue}>
            {children}
        </ApiContext.Provider>
    );
};