import { createContext, useEffect, useState } from "react";
import { useApi } from "./ApiProvider";
export const SaborifyContext = createContext();

export const SaborifyProvider = ({ children }) => {
  const {
    obtenerRecetas,
    obtenerIngredientes,
    obtenerIngredientesAlergenos,
    obtenerAlergenos,
    obtenerRecetasMejorValoradas,
    obtenerDificultades
  } = useApi();

  const [recetas, setRecetas] = useState([]);
  const [receta, setReceta] = useState({});
  const [ingredientes, setIngredientes] = useState([]);
  const [ingrediente, setIngrediente] = useState({});
  const [ingredientesAlergenos, setIngredientesAlergenos] = useState([]);
  const [alergenos, setAlergenos] = useState([]);
  const [recetasMejorValoradas, setRecetasMejorValoradas] = useState([]);
  const [recetasMasVistas, setRecetasMasVistas] = useState([]);
  const [alergenoSeleccionado, setAlergenoSeleccionado] = useState({});
  const [dificultades, setDificultades] = useState([]);

  async function cargaRecetas() {
    try {
      const jsonData = await obtenerRecetas();
      setRecetas(jsonData.data);
    } catch (error) {
      console.error('Error al cargar recetas:', error.message);
    }
  }

  async function cargaIngredientes() {
    try {
      const jsonData = await obtenerIngredientes();
      setIngredientes(jsonData.data);
    } catch (error) {
      console.error('Error al cargar ingredientes:', error.message);
    }
  }

  async function cargaIngredientesAlergenos() {
    try {
      const jsonData = await obtenerIngredientesAlergenos();
      setIngredientesAlergenos(jsonData);
    } catch (error) {
      console.error('Error al cargar ingredientes alérgenos:', error.message);
    }
  }

  async function cargaAlergenos() {
    try {
      const jsonData = await obtenerAlergenos();
      setAlergenos(jsonData);
    } catch (error) {
      console.error('Error al cargar alérgenos:', error.message);
    }
  }

  async function cargaRecetasMejorValoradas() {
    try {
      const jsonData = await obtenerRecetasMejorValoradas();
      setRecetasMejorValoradas(jsonData.data);
    } catch (error) {
      console.error('Error al cargar recetas mejor valoradas:', error.message);
    }
  }

  function cargaRecetasMasVistas() {
    if (recetas.length > 0) {
      const recetasAleatorias = [...recetas]
        .sort(() => Math.random() - 0.5) 
        .slice(0, 9);
      setRecetasMasVistas(recetasAleatorias);
    }
  }

  async function cargaDificultades() {
    try {
      const jsonData = await obtenerDificultades();
      setDificultades(jsonData);
    } catch (error) {
      console.error('Error al cargar dificultades:', error.message);
    }
  }

  useEffect(() => {
    cargaRecetas();
    cargaIngredientes();
    cargaAlergenos();
    cargaIngredientesAlergenos();
    cargaRecetasMejorValoradas();
    cargaDificultades();
  }, []);

  useEffect(() => {
    if (recetas.length > 0) {
      cargaRecetasMasVistas();
    }
  }, [recetas]);

  return (
    <SaborifyContext.Provider
      value={{
        recetas,
        setRecetas,
        receta,
        setReceta,
        ingredientes,
        ingrediente,
        setIngrediente,
        ingredientesAlergenos,
        alergenos,
        recetasMejorValoradas,
        recetasMasVistas, 
        alergenoSeleccionado,
        setAlergenoSeleccionado,
        cargaRecetas,
        dificultades
      }}
    >
      {children}
    </SaborifyContext.Provider>
  );
};