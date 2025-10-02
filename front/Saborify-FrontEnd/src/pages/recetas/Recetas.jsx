import { useContext, useEffect, useState } from "react";
import {
    Container,
    Typography,
    Grid,
    Box,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Paper,
} from "@mui/material";
import { SaborifyContext } from "../../context/SaborifyProvider";
import { useApi } from "../../context/ApiProvider";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimerOffIcon from "@mui/icons-material/TimerOff";
import TuneIcon from "@mui/icons-material/Tune";
import NoFoodIcon from "@mui/icons-material/NoFood";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RecetaCard from "../../components/RecetaCard";
import Spinner from "../../components/Spinner";

export default function Recetas() {
    const { recetas, setRecetas, cargaRecetas, dificultades } = useContext(SaborifyContext);
    const {
        obtenerAlergenos,
        obtenerRecetas,
        obtenerRecetasPorDificultad,
        obtenerRecetasSinAlergeno,
        obtenerRecetasMasTiempo,
        obtenerRecetasMenosTiempo
    } = useApi();

    const [loading, setLoading] = useState(false);
    const [alergenos, setAlergenos] = useState([]);
    const [error, setError] = useState(null);

    const [selectedDificultad, setSelectedDificultad] = useState("");
    const [selectedAlergeno, setSelectedAlergeno] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const puedeCrearReceta = user && (user.role === "user" || user.role === "admin");
    const puedeUsarIA = !!user;

    useEffect(() => {
        cargaRecetas();
        cargarAlergenos();
    }, []);

    const cargarAlergenos = async () => {
        try {
            setError(null);
            const result = await obtenerAlergenos();

            if (result && Array.isArray(result)) {
                setAlergenos(result);
            } else if (result && result.data && Array.isArray(result.data)) {
                setAlergenos(result.data);
            } else {
                console.error("Respuesta inválida para alérgenos", result);
                setAlergenos([]);
            }
        } catch (error) {
            console.error("Error al cargar alérgenos:", error);
            setError("Error loading allergens");
            setAlergenos([]);
        }
    };

    const fetchRecetasConApi = async (apiFunction, ...params) => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiFunction(...params);

            if (result && result.data && Array.isArray(result.data)) {
                setRecetas(result.data);
            } else if (result && Array.isArray(result)) {
                setRecetas(result);
            } else {
                console.error("Respuesta inválida del backend", result);
                setRecetas([]);
                setError("No recipes found");
            }
        } catch (error) {
            console.error("Error al cargar recetas:", error);
            setError(error.message || "Error loading recipes");
            setRecetas([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDificultadChange = (event) => {
        const dificultad = event.target.value;
        setSelectedDificultad(dificultad);
        setSelectedAlergeno("");
        fetchRecetasConApi(obtenerRecetasPorDificultad, dificultad);
    };

    const handleAlergenoChange = (event) => {
        const alergeno = event.target.value;
        setSelectedAlergeno(alergeno);
        setSelectedDificultad("");
        fetchRecetasConApi(obtenerRecetasSinAlergeno, alergeno);
    };

    const handleResetFilters = () => {
        setSelectedDificultad("");
        setSelectedAlergeno("");
        fetchRecetasConApi(obtenerRecetas);
    };

    const handleMasTiempo = () => {
        setSelectedDificultad("");
        setSelectedAlergeno("");
        fetchRecetasConApi(obtenerRecetasMasTiempo);
    };

    const handleMenosTiempo = () => {
        setSelectedDificultad("");
        setSelectedAlergeno("");
        fetchRecetasConApi(obtenerRecetasMenosTiempo);
    };

    const renderAIButton = () => {
        if (puedeUsarIA) {
            return (
                <Link to="/ai-recipe-search" style={{ textDecoration: "none" }}>
                    <Button
                        startIcon={<SmartToyIcon />}
                        endIcon={<AutoAwesomeIcon />}
                        variant="contained"
                        size="large"
                        sx={{
                            textTransform: "none",
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            background: "linear-gradient(45deg, #6200ea 30%, #9c27b0 90%)",
                            color: "#ffffff",
                            boxShadow: "0 8px 25px rgba(98, 0, 234, 0.3)",
                            position: "relative",
                            overflow: "hidden",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                                background: "linear-gradient(45deg, #3700b3 30%, #7b1fa2 90%)",
                                boxShadow: "0 12px 35px rgba(98, 0, 234, 0.4)",
                                transform: "translateY(-2px)",
                            },
                            "&:before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: "-100%",
                                width: "100%",
                                height: "100%",
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                                transition: "left 0.5s",
                            },
                            "&:hover:before": {
                                left: "100%",
                            },
                            "& .MuiButton-startIcon": {
                                marginRight: "8px",
                            },
                            "& .MuiButton-endIcon": {
                                marginLeft: "8px",
                                animation: "sparkle 2s ease-in-out infinite",
                            },
                            "@keyframes sparkle": {
                                "0%, 100%": { 
                                    transform: "scale(1) rotate(0deg)",
                                    opacity: 1 
                                },
                                "50%": { 
                                    transform: "scale(1.2) rotate(180deg)",
                                    opacity: 0.8 
                                },
                            },
                        }}
                    >
                        AI Recipe Generator
                    </Button>
                </Link>
            );
        } else {
            return (
                <Button
                    startIcon={<SmartToyIcon />}
                    endIcon={<AutoAwesomeIcon />}
                    variant="contained"
                    size="large"
                    disabled
                    sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        backgroundColor: "#e0e0e0",
                        color: "#9e9e9e",
                        "&.Mui-disabled": {
                            backgroundColor: "#e0e0e0",
                            color: "#9e9e9e",
                        },
                    }}
                    title="Inicia sesión para usar esta función"
                >
                    AI Recipe Generator
                </Button>
            );
        }
    };

    const renderErrorMessage = () => {
        if (error) {
            return (
                <Box
                    sx={{
                        textAlign: "center",
                        py: 4,
                        backgroundColor: "#ffebee",
                        borderRadius: 2,
                        mb: 2
                    }}
                >
                    <Typography variant="body1" color="error">
                        {error}
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={handleResetFilters}
                        sx={{ mt: 2 }}
                    >
                        Try again
                    </Button>
                </Box>
            );
        }
        return null;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, p: 3, position: "relative" }}>
            <Box mb={6} textAlign="center">
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        color: '#ff7043',
                        fontWeight: 'bold',
                        position: 'relative',
                        display: 'inline-block',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            width: '60%',
                            height: '4px',
                            bottom: '-10px',
                            left: '20%',
                            backgroundColor: '#ff7043',
                            borderRadius: '2px'
                        }
                    }}
                >
                    Explore all recipes from our community
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                        maxWidth: '700px',
                        mx: 'auto',
                        mt: 3,
                        fontSize: '1.1rem'
                    }}
                >
                    Find here all the recipes created by Saborify users. You can filter by difficulty, preparation time, and allergens. Discover new delights to cook!
                </Typography>
            </Box>

            {/* AI Button destacado en su propia sección */}
            {/* <Paper
                elevation={6}
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 4,
                    background: "linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%)",
                    border: "2px solid #e1bee7",
                    textAlign: "center",
                }}
            >
                <Box mb={2}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: "#6200ea",
                            fontWeight: "bold",
                            mb: 1,
                        }}
                    >
                        🤖 New! AI Recipe Generator
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        Tell us what ingredients you have and our AI will create personalized recipes for you
                    </Typography>
                </Box>
                {renderAIButton()}
            </Paper> */}

            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 3,
                    backgroundColor: "#fff7f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
            >
                <Box display="flex" alignItems="center" justifyContent="center" gap={2} flexWrap="wrap">
                    <Button
                        startIcon={<RestartAltIcon />}
                        variant="contained"
                        color="warning"
                        onClick={handleResetFilters}
                        disabled={loading}
                        sx={{
                            textTransform: "none",
                            fontWeight: 500,
                            borderRadius: 2,
                            backgroundColor: "#ff7043",
                            "&:hover": { backgroundColor: "#e64a19" },
                        }}
                    >
                        All
                    </Button>

                    <Button
                        startIcon={<AccessTimeIcon />}
                        variant="outlined"
                        onClick={handleMasTiempo}
                        disabled={loading}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            color: "#ff7043",
                            borderColor: "#ff7043",
                            "&:hover": {
                                backgroundColor: "#fff0e6",
                                borderColor: "#e64a19",
                                color: "#e64a19",
                            },
                        }}
                    >
                        More Time
                    </Button>

                    <Button
                        startIcon={<TimerOffIcon />}
                        variant="outlined"
                        onClick={handleMenosTiempo}
                        disabled={loading}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            color: "#ff7043",
                            borderColor: "#ff7043",
                            "&:hover": {
                                backgroundColor: "#fff0e6",
                                borderColor: "#e64a19",
                                color: "#e64a19",
                            },
                        }}
                    >
                        Less Time
                    </Button>

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>
                            <Box display="flex" alignItems="center">
                                <TuneIcon sx={{ fontSize: 18, mr: 1 }} /> Difficulty
                            </Box>
                        </InputLabel>
                        <Select
                            label="Difficulty"
                            value={selectedDificultad}
                            onChange={handleDificultadChange}
                            disabled={loading}
                            sx={{
                                backgroundColor: "#ffffff",
                                borderRadius: 2,
                            }}
                        >
                            {dificultades.map((dificultad) => (
                                <MenuItem value={dificultad.dificultad} key={dificultad.dificultad}>
                                    {dificultad.dificultad}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 160 }} id="alergenos-select">
                        <InputLabel>
                            <Box display="flex" alignItems="center">
                                <NoFoodIcon sx={{ fontSize: 18, mr: 1 }} /> Without allergens
                            </Box>
                        </InputLabel>
                        <Select
                            label="Without allergens"
                            value={selectedAlergeno}
                            onChange={handleAlergenoChange}
                            disabled={loading}
                            sx={{
                                backgroundColor: "#ffffff",
                                borderRadius: 2,
                            }}
                        >
                            {alergenos.map((alergeno) => (
                                <MenuItem value={alergeno.nombre} key={alergeno.id}>
                                    {alergeno.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {renderErrorMessage()}

            {loading ? (
                <Spinner />
            ) : (
                <Grid container spacing={4} justifyContent="center">
                    {recetas.length === 0 && !error ? (
                        <Typography variant="h6" color="text.secondary">
                            No recipes found.
                        </Typography>
                    ) : (
                        recetas.map((receta) => (
                            <RecetaCard receta={receta} key={receta.id} />
                        ))
                    )}
                </Grid>
            )}

            {puedeCrearReceta && (
                <Link to="/create-recipe" style={{ textDecoration: "none" }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            position: "fixed",
                            bottom: 60,
                            right: 40,
                            px: 3,
                            py: 1.5,
                            fontSize: "16px",
                            fontWeight: "bold",
                            textTransform: "none",
                            borderRadius: "30px",
                            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
                            backgroundColor: "#ff7043",
                            color: "#fff",
                            transition: "all 0.3s ease-in-out",
                            "&:hover": {
                                backgroundColor: "#e64a19",
                                transform: "scale(1.05)",
                            },
                        }}
                    >
                        Create new recipe
                    </Button>
                </Link>
            )}
        </Container>
    );
}