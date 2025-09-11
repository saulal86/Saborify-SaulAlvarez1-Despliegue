import { useState, useContext, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  Alert,
  IconButton,
  Tooltip
} from "@mui/material";
import { SaborifyContext } from "../../context/SaborifyProvider";
import { useApi } from "../../context/ApiProvider";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RecetaCard from "../../components/RecetaCard";
import { Link } from "react-router-dom";
import Spinner from "../../components/Spinner";

export default function AIRecipeSearch() {
  const { setRecetas } = useContext(SaborifyContext);
  const api = useApi();

  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [searchInfo, setSearchInfo] = useState({
    message: '',
    total: 0,
    recetas_bd: 0,
    recetas_ia: 0
  });

  useEffect(() => {
    fetchPopularIngredients();
  }, []);

  const fetchPopularIngredients = async () => {
    try {
      const data = await api.obtenerIngredientesPopulares();
      const ingredientesList = Array.isArray(data) ? data : (data.ingredientes || []);
      setSuggestions(ingredientesList.slice(0, 10));
      console.log("Ingredientes populares cargados:", ingredientesList.length);
    } catch (error) {
      console.error("Error al cargar ingredientes populares:", error);
      setSuggestions([
        'cebolla', 'ajo', 'tomate', 'aceite de oliva', 'sal',
        'pimienta', 'perejil', 'huevos', 'patatas', 'arroz'
      ]);
    }
  };

  const addIngredient = () => {
    if (ingredient.trim() && !ingredients.includes(ingredient.trim().toLowerCase())) {
      const newIngredients = [...ingredients, ingredient.trim().toLowerCase()];
      setIngredients(newIngredients);
      setIngredient("");

      if (searched) {
        setSearched(false);
        setSearchResults([]);
        setError(null);
      }
    }
  };

  const removeIngredient = (indexToRemove) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));

    if (searched) {
      setSearched(false);
      setSearchResults([]);
      setError(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addIngredient();
    }
  };

  const handleIngredientSuggestion = async () => {
    if (ingredients.length === 0) {
      setError("Añade al menos un ingrediente para obtener sugerencias.");
      return;
    }

    setLoadingSuggestions(true);
    setError(null);

    try {
      const data = await api.sugerirIngredientes({ ingredients });
      console.log("Respuesta de sugerencias:", data);

      if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        setError("No se pudieron obtener sugerencias en este momento.");
      }
    } catch (error) {
      console.error("Error al obtener sugerencias:", error);
      setError("Error al obtener sugerencias de ingredientes.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const searchRecipes = async () => {
    if (ingredients.length === 0) {
      setError("Por favor, añade al menos un ingrediente para buscar recetas.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);
    setSearchInfo({ message: '', total: 0, recetas_bd: 0, recetas_ia: 0 });

    try {
      console.log("Buscando recetas con ingredientes:", ingredients);

      const data = await api.buscarRecetasPorIngredientes({ ingredients });
      console.log("Respuesta de búsqueda:", data);

      if (data.recetas && Array.isArray(data.recetas)) {
        setSearchResults(data.recetas);
        setRecetas(data.recetas);

        setSearchInfo({
          message: data.message || '',
          total: data.total || data.recetas.length,
          recetas_bd: data.recetas_bd || 0,
          recetas_ia: data.recetas_ia || 0
        });

        if (data.recetas.length === 0) {
          setError("No se encontraron recetas con los ingredientes seleccionados. Prueba con diferentes combinaciones.");
        }
      } else {
        setError(data.message || "No se encontraron recetas.");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error al buscar recetas:", error);
      setError("Error de conexión. Por favor, verifica que el servidor esté funcionando y inténtalo de nuevo.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setIngredient("");
    setIngredients([]);
    setSearchResults([]);
    setError(null);
    setSearched(false);
    setSearchInfo({ message: '', total: 0, recetas_bd: 0, recetas_ia: 0 });
    fetchPopularIngredients();
  };

  const addSuggestion = (suggestion) => {
    if (!ingredients.includes(suggestion.toLowerCase())) {
      setIngredients([...ingredients, suggestion.toLowerCase()]);

      if (searched) {
        setSearched(false);
        setSearchResults([]);
        setError(null);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8, p: 3 }}>
      <Link to="/all-recipes" style={{ textDecoration: "none" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{
            mb: 2,
            color: "#ff7043",
            "&:hover": { backgroundColor: "rgba(255,112,67,0.1)" },
          }}
        >
          Back to recipes
        </Button>
      </Link>

      <Box mb={6} textAlign="center">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            color: "#ff7043",
            fontWeight: "bold",
            position: "relative",
            display: "inline-block",
            "&::after": {
              content: '""',
              position: "absolute",
              width: "60%",
              height: "4px",
              bottom: "-10px",
              left: "20%",
              backgroundColor: "#ff7043",
              borderRadius: "2px",
            },
          }}
        >
          Smart Recipe Search
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: "700px",
            mx: "auto",
            mt: 3,
            fontSize: "1.1rem",
          }}
        >
          Enter the ingredients you have at home and our AI will recommend recipes you can prepare. Combine recipes from your collection with suggestions generated by artificial intelligence.
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          backgroundColor: "#fff7f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          mb: 4,
        }}
      >
        <Box mb={3}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
            Available ingredients
            <Tooltip title="Our AI will analyze these ingredients to find recipes in your collection and generate new suggestions">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              fullWidth
              variant="outlined"
              size="medium"
              label="Add ingredient"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Example: tomato, onion, garlic..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#ffffff",
                },
              }}
            />
            <Button
              variant="contained"
              onClick={addIngredient}
              sx={{
                backgroundColor: "#ff7043",
                color: "#ffffff",
                borderRadius: 2,
                px: 3,
                "&:hover": { backgroundColor: "#e64a19" },
              }}
            >
              Add
            </Button>
          </Box>
        </Box>

        <Box mb={3}>
          <Typography variant="body2" gutterBottom sx={{ color: "text.secondary" }}>
            {ingredients.length > 0
              ? `Selected ingredients (${ingredients.length}):`
              : "Add ingredients to start searching"}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {ingredients.map((ing, index) => (
              <Chip
                key={index}
                label={ing}
                onDelete={() => removeIngredient(index)}
                color="primary"
                variant="outlined"
                sx={{
                  borderColor: "#ff7043",
                  color: "#ff7043",
                  "& .MuiChip-deleteIcon": {
                    color: "#ff7043",
                    "&:hover": { color: "#e64a19" },
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center" mt={3}>
          <Button
            variant="contained"
            startIcon={loading ? null : <SearchIcon />}
            onClick={searchRecipes}
            disabled={loading || ingredients.length === 0}
            sx={{
              backgroundColor: "#ff7043",
              "&:hover": { backgroundColor: "#e64a19" },
              "&:disabled": { backgroundColor: "#ffccbc" },
              borderRadius: 2,
              px: 4,
              py: 1.5,
            }}
          >
            {loading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={20} color="inherit" />
                <span>Searching...</span>
              </Box>
            ) : (
              "Search recipes"
            )}
          </Button>

          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={clearSearch}
            sx={{
              color: "#ff7043",
              borderColor: "#ff7043",
              "&:hover": {
                backgroundColor: "#fff0e6",
                borderColor: "#e64a19",
                color: "#e64a19",
              },
              borderRadius: 2,
              px: 3,
            }}
          >
            Clear
          </Button>

          {ingredients.length > 0 && (
            <Button
              variant="outlined"
              startIcon={loadingSuggestions ? null : <AutoAwesomeIcon />}
              onClick={handleIngredientSuggestion}
              disabled={loadingSuggestions}
              sx={{
                color: "#6200ea",
                borderColor: "#6200ea",
                "&:hover": {
                  backgroundColor: "#f4f0ff",
                  borderColor: "#3700b3",
                  color: "#3700b3",
                },
                "&:disabled": { borderColor: "#e0e0e0", color: "#bdbdbd" },
                borderRadius: 2,
                px: 3,
              }}
            >
              {loadingSuggestions ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Suggesting...</span>
                </Box>
              ) : (
                "Suggest more ingredients"
              )}
            </Button>
          )}
        </Box>
      </Paper>

      {suggestions.length > 0 && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: "#f9f9ff",
            mb: 4,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
            {ingredients.length > 0 ? "Suggested ingredients for you" : "Popular ingredients"}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Click any ingredient to add it to your search
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
            {suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                clickable
                onClick={() => addSuggestion(suggestion)}
                sx={{
                  backgroundColor: "#e8e0ff",
                  color: "#6200ea",
                  "&:hover": {
                    backgroundColor: "#d4c2ff",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </Box>
        </Paper>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 4,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {searched && (
        <Box mt={4}>
          <Divider sx={{ mb: 4 }} />

          {searchInfo.message && (
            <Alert
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 2,
                backgroundColor: "#e3f2fd",
                "& .MuiAlert-message": {
                  fontSize: "1rem",
                }
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {searchInfo.message}
                </Typography>
                {(searchInfo.recetas_bd > 0 || searchInfo.recetas_ia > 0) && (
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                    {searchInfo.recetas_bd > 0 && `${searchInfo.recetas_bd} from your collection`}
                    {searchInfo.recetas_bd > 0 && searchInfo.recetas_ia > 0 && " • "}
                    {searchInfo.recetas_ia > 0 && `${searchInfo.recetas_ia} generated by AI`}
                  </Typography>
                )}
              </Box>
            </Alert>
          )}

          <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, color: "#333" }}>
            Search results
            {searchInfo.total > 0 && (
              <Typography component="span" variant="h6" sx={{ ml: 2, color: "#666", fontWeight: 400 }}>
                ({searchInfo.total} recipe{searchInfo.total !== 1 ? 's' : ''})
              </Typography>
            )}
          </Typography>

          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" mt={6} mb={6}>
              <Spinner />
            </Box>
          ) : searchResults.length > 0 ? (
            <Grid container spacing={4} justifyContent="center">
              {searchResults.map((receta) => (
                <RecetaCard
                  receta={receta}
                  key={receta.id}
                  showIABadge={receta.id && String(receta.id).startsWith('ai_')}
                />
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" mt={6} mb={6}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No recipes found with the selected ingredients.
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={2} mb={3}>
                Try different combinations of ingredients or add more basic ingredients.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setIngredients([]);
                  fetchPopularIngredients();
                }}
                sx={{
                  color: "#ff7043",
                  borderColor: "#ff7043",
                  "&:hover": {
                    backgroundColor: "#fff0e6",
                    borderColor: "#e64a19",
                  },
                }}
              >
                Start new search
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}