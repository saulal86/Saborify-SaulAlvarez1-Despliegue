import { useContext, useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Avatar,
  Collapse,
  Fade,
  Rating,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DifficultyIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { SaborifyContext } from "../../context/SaborifyProvider";
import { useApi } from "../../context/ApiProvider";
import { Link } from "react-router-dom";
import ReseñaCard from "../../components/ReseñaCard";
import Spinner from "../../components/Spinner";
import imagenPlaceholder from '../../assets/imagenRecetaPlaceholder.png';

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: "50px",
  fontWeight: 600,
  padding: "4px 8px",
  textTransform: "capitalize",
  boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
  fontSize: { xs: "0.75rem", sm: "0.875rem" },
  [theme.breakpoints.down('sm')]: {
    fontSize: "0.7rem",
    padding: "2px 6px",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: "relative",
  fontWeight: 700,
  color: "#ff7043",
  marginBottom: theme.spacing(2),
  display: "inline-block",
  fontSize: "1.5rem",
  [theme.breakpoints.down('sm')]: {
    fontSize: "1.25rem",
    marginBottom: theme.spacing(1.5),
  },
  "&:after": {
    content: '""',
    position: "absolute",
    width: "40px",
    height: "3px",
    bottom: "-8px",
    left: 0,
    backgroundColor: "#ff7043",
    borderRadius: "2px",
    [theme.breakpoints.down('sm')]: {
      width: "30px",
      height: "2px",
      bottom: "-6px",
    },
  },
}));

const RecipeInfoBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  backgroundColor: "#fff8f0",
  borderRadius: "12px",
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  width: "100%",
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    borderRadius: "8px",
    marginBottom: theme.spacing(1),
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: "16px",
  padding: theme.spacing(3),
  height: "100%",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  transition: "transform 0.3s ease-in-out",
  [theme.breakpoints.down('sm')]: {
    borderRadius: "12px",
    padding: theme.spacing(2),
  },
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    [theme.breakpoints.down('sm')]: {
      transform: "none",
    },
  },
}));

export default function Receta() {
  const { receta, setReceta } = useContext(SaborifyContext);
  const api = useApi();
  const user = JSON.parse(localStorage.getItem("user"));
  const [recipeUser, setRecipeUser] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reseñas, setReseñas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const isAIGenerated = receta?.IA === true;

  useEffect(() => {
    if (user && user.id && receta && receta.usuario_id) {
      const userId = String(user.id);
      const recetaUserId = String(receta.usuario_id);

      if (userId === recetaUserId) {
        setRecipeUser(true);
      } else {
        setRecipeUser(false);
      }
    } else {
      setRecipeUser(false);
    }
  }, [user, receta]);

  const getTipoComidaDisplay = (tipoComida) => {
    if (!tipoComida) return '-';

    if (Array.isArray(tipoComida)) {
      return tipoComida.length > 0 ? tipoComida[0] : '-';
    }

    return tipoComida;
  };

  const getTiposComidaChips = (tipoComida) => {
    if (!tipoComida) return [];

    if (Array.isArray(tipoComida)) {
      return tipoComida;
    }

    return [tipoComida];
  };

  const checkIfFavorite = (recetaToCheck) => {
    if (!recetaToCheck || !recetaToCheck.id) return false;

    const existingFavs = JSON.parse(localStorage.getItem("recetasFavs")) || [];

    if (recetaToCheck.IA === true) {
      return existingFavs.some(fav =>
        fav.IA === true &&
        fav.nombre === recetaToCheck.nombre &&
        JSON.stringify(fav.ingredientes) === JSON.stringify(recetaToCheck.ingredientes)
      );
    } else {
      return existingFavs.some(fav => fav.id === recetaToCheck.id && fav.IA !== true);
    }
  };

  const loadRecetaData = async () => {
    if (!receta || !receta.id) return;

    try {
      const data = await api.obtenerRecetaPorId(receta.id);

      if (data.data && data.data.length > 0) {
        const recetaActualizada = data.data[0];
        setReceta(recetaActualizada);

        const existingFavs = JSON.parse(localStorage.getItem("recetasFavs")) || [];
        const recetaIndex = existingFavs.findIndex(fav => fav.id === receta.id);

        if (recetaIndex !== -1) {
          existingFavs[recetaIndex] = {
            ...existingFavs[recetaIndex],
            valoracion: recetaActualizada.valoracion
          };
          localStorage.setItem("recetasFavs", JSON.stringify(existingFavs));
        }
      }
    } catch (error) {
      console.error("Error al cargar la receta:", error);
      setSnackbarMessage("Error loading recipe data");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const loadReseñas = async () => {
    if (!receta || !receta.id) return;

    setIsLoading(true);
    try {
      const data = await api.obtenerReseniasReceta(receta.id);

      let reseñasData = [];
      if (data.data && data.data.length > 0 && data.data[0].reseñas) {
        reseñasData = data.data[0].reseñas;
        setReseñas(reseñasData);
        await loadRecetaData();
      } else {
        setReseñas([]);
      }
    } catch (error) {
      console.error("Error al cargar las reseñas:", error);
      setReseñas([]);
      setSnackbarMessage("Error loading reviews");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = () => {
    const existingFavs = JSON.parse(localStorage.getItem("recetasFavs")) || [];

    let recetaIndex = -1;

    if (isAIGenerated) {
      recetaIndex = existingFavs.findIndex(fav =>
        fav.IA === true &&
        fav.nombre === receta.nombre &&
        JSON.stringify(fav.ingredientes) === JSON.stringify(receta.ingredientes)
      );
    } else {
      recetaIndex = existingFavs.findIndex(fav => fav.id === receta.id && fav.IA !== true);
    }

    if (recetaIndex !== -1) {
      existingFavs.splice(recetaIndex, 1);
      setIsFavorite(false);
      setSnackbarMessage("Recipe removed from favorites");
      setSnackbarSeverity("info");
    } else {
      existingFavs.push({ ...receta });
      setIsFavorite(true);
      setSnackbarMessage("Recipe added to favorites");
      setSnackbarSeverity("success");
    }

    localStorage.setItem("recetasFavs", JSON.stringify(existingFavs));
    setSnackbarOpen(true);
  };

  useEffect(() => {
    if (receta) {
      const isInFavorites = checkIfFavorite(receta);
      setIsFavorite(isInFavorites);
    }
  }, [receta]);

  useEffect(() => {
    if (receta && receta.id && !isAIGenerated) {
      loadReseñas();
    }
  }, [receta.id, isAIGenerated]);

  useEffect(() => {
    const nuevaReseña = localStorage.getItem("nuevaReseña");
    if (nuevaReseña === "true" && receta && receta.id && !isAIGenerated) {
      localStorage.removeItem("nuevaReseña");
      loadReseñas();
      setSnackbarMessage("Review added successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  }, [receta, isAIGenerated]);

  const handleDeleteSuccess = (deletedReseñaId) => {
    const reseñasActualizadas = reseñas.filter(r => r.id !== deletedReseñaId);
    setReseñas(reseñasActualizadas);

    setSnackbarMessage("Review deleted successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);

    loadRecetaData();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      console.log("Eliminar receta", receta.id);
      await api.eliminarReceta(receta.id);
      console.log("Receta eliminada con éxito");
      window.location.href = '/all-recipes';
    } catch (error) {
      console.error("Error al eliminar la receta:", error);
      setSnackbarMessage("Error deleting recipe");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (!receta || !receta.id) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 5 }, textAlign: 'center' }}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 2, sm: 3, md: 5 },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Fade in={true} timeout={800}>
        <Box
          sx={{
            backgroundColor: "#fffefc",
            borderRadius: { xs: "16px", sm: "20px", md: "24px" },
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            mb: { xs: 4, sm: 6, md: 8 },
          }}
        >
          <Box
            sx={{
              position: "relative",
              height: { xs: "200px", sm: "300px", md: "400px" },
              overflow: "hidden",
            }}
          >
            <CardMedia
              component="img"
              image={receta.imagen || imagenPlaceholder}
              alt={receta.nombre}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "brightness(0.8)",
                transition: "transform 0.8s ease",
                "&:hover": {
                  transform: { xs: "none", md: "scale(1.05)" },
                },
              }}
            />

            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                p: { xs: 2, sm: 3, md: 4 },
                color: "white",
              }}
            >
              <Grid container alignItems="flex-end" spacing={{ xs: 1, sm: 2 }}>
                <Grid item xs={12}>
                  <Typography
                    variant="h3"
                    component="h1"
                    fontWeight={800}
                    sx={{
                      fontSize: { xs: "1.5rem", sm: "2rem", md: "2.8rem" },
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      mb: { xs: 1, sm: 1.5, md: 2 },
                      lineHeight: 1.2,
                    }}
                  >
                    {receta.nombre}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{
                    display: "flex",
                    gap: { xs: 0.5, sm: 1 },
                    flexWrap: "wrap",
                    justifyContent: "flex-start"
                  }}>
                    <StyledChip
                      label={receta.tipoCocina}
                      color="warning"
                      sx={{ backgroundColor: "#ff7043", color: "white" }}
                    />
                    {getTiposComidaChips(receta.tipoComida).map((tipo, index) => (
                      <StyledChip
                        key={index}
                        label={tipo}
                        sx={{ backgroundColor: "#4caf50", color: "white" }}
                      />
                    ))}
                    {isAIGenerated && (
                      <StyledChip
                        label="IA"
                        sx={{ backgroundColor: "#9c27b0", color: "white" }}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3, md: 5 } }}>
            {((user?.role === "admin" && !isAIGenerated) || recipeUser) && (
              <Box sx={{ mb: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    backgroundColor: "#fff8f0",
                    borderRadius: "12px",
                    border: "1px dashed #ffcc80"
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 2, color: "#f57c00" }}>
                    Admin panel
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Link to={`/edit-recipe`} style={{ textDecoration: "none" }}>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        sx={{
                          backgroundColor: "#ff7043",
                          color: "white",
                          borderRadius: "10px",
                          boxShadow: "0 4px 10px rgba(255, 112, 67, 0.3)",
                          '&:hover': {
                            backgroundColor: "#f4511e",
                            boxShadow: "0 6px 12px rgba(255, 112, 67, 0.4)"
                          }
                        }}
                      >
                        Edit recipe
                      </Button>
                    </Link>

                    <Button
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={handleDelete}
                      sx={{
                        borderColor: "#d32f2f",
                        color: "#d32f2f",
                        borderRadius: "10px",
                        '&:hover': {
                          backgroundColor: "#ffebee",
                          borderColor: "#b71c1c"
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Box>

                  <Collapse in={showDeleteConfirm}>
                    <Box sx={{ mt: 2, p: 2, backgroundColor: "#ffebee", borderRadius: "8px" }}>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Are you sure you want to delete this recipe? This action cannot be undone.
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={cancelDelete}
                          sx={{ color: "#546e7a" }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={confirmDelete}
                          sx={{ backgroundColor: "#d32f2f", color: "white" }}
                        >
                          Confirm
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>
              </Box>
            )}

            <Grid container spacing={{ xs: 1, sm: 2, md: 6 }} sx={{ mb: { xs: 3, sm: 4 } }}>
              <Grid item xs={6} sm={4} md={2}>
                <RecipeInfoBox>
                  <AccessTimeIcon sx={{
                    color: "#ff7043",
                    mr: { xs: 1, sm: 1.5 },
                    fontSize: { xs: "1.2rem", sm: "1.5rem" }
                  }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                    >
                      Total time
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}
                    >
                      {receta.tiempoCocinado === 0 ? '< 10' : receta.tiempoCocinado} min
                    </Typography>
                  </Box>
                </RecipeInfoBox>
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <RecipeInfoBox>
                  <DifficultyIcon sx={{
                    color: "#ff7043",
                    mr: { xs: 1, sm: 1.5 },
                    fontSize: { xs: "1.2rem", sm: "1.5rem" }
                  }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                    >
                      Difficulty
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}
                    >
                      {receta.dificultad}
                    </Typography>
                  </Box>
                </RecipeInfoBox>
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <RecipeInfoBox>
                  <RestaurantIcon sx={{
                    color: "#ff7043",
                    mr: { xs: 1, sm: 1.5 },
                    fontSize: { xs: "1.2rem", sm: "1.5rem" }
                  }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                    >
                      Meal type
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}
                    >
                      {getTipoComidaDisplay(receta.tipoComida)}
                    </Typography>
                  </Box>
                </RecipeInfoBox>
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <RecipeInfoBox>
                  <LocalDiningIcon sx={{
                    color: "#ff7043",
                    mr: { xs: 1, sm: 1.5 },
                    fontSize: { xs: "1.2rem", sm: "1.5rem" }
                  }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                    >
                      Servings
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}
                    >
                      {receta.porciones || '-'}
                    </Typography>
                  </Box>
                </RecipeInfoBox>
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <RecipeInfoBox>
                  <LocalFireDepartmentIcon sx={{
                    color: "#ff7043",
                    mr: { xs: 1, sm: 1.5 },
                    fontSize: { xs: "1.2rem", sm: "1.5rem" }
                  }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                    >
                      Calories/serving
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}
                    >
                      {receta.caloriasPorPorcion || '-'} kcal
                    </Typography>
                  </Box>
                </RecipeInfoBox>
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <RecipeInfoBox>
                  <StarIcon sx={{
                    color: "#ff7043",
                    mr: { xs: 1, sm: 1.5 },
                    fontSize: { xs: "1.2rem", sm: "1.5rem" }
                  }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                    >
                      Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{
                          mr: 0.5,
                          fontSize: { xs: "0.8rem", sm: "1rem" }
                        }}
                      >
                        {receta.valoracion ? parseFloat(receta.valoracion).toFixed(1) : '0.0'}
                      </Typography>
                      <Rating
                        value={receta.valoracion ? parseFloat(receta.valoracion) : 0}
                        readOnly
                        precision={0.5}
                        size="small"
                        sx={{
                          fontSize: { xs: "0.9rem", sm: "1.2rem" }
                        }}
                      />
                    </Box>
                  </Box>
                </RecipeInfoBox>
              </Grid>
            </Grid>

            <Box sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: { xs: 3, sm: 4 }
            }}>
              <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                <IconButton
                  onClick={handleFavorite}
                  sx={{
                    backgroundColor: "#fff8f0",
                    size: { xs: "small", sm: "medium" },
                    '&:hover': { backgroundColor: "#ffe0b2" },
                    transform: isFavorite ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.2s ease-in-out'
                  }}
                >
                  {isFavorite ? (
                    <FavoriteIcon sx={{
                      color: "#ff4081",
                      fontSize: { xs: "1.2rem", sm: "1.5rem" }
                    }} />
                  ) : (
                    <FavoriteBorderIcon sx={{
                      color: "#ff7043",
                      fontSize: { xs: "1.2rem", sm: "1.5rem" }
                    }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>

            <Divider sx={{ my: { xs: 3, sm: 4, md: 5 } }} />

            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {receta.descripcion && (
                <Grid item xs={12}>
                  <StyledPaper>
                    <SectionTitle variant="h4">Description</SectionTitle>
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.7,
                        color: "#424242",
                        fontSize: { xs: "0.9rem", sm: "1rem" }
                      }}
                    >
                      {receta.descripcion}
                    </Typography>
                  </StyledPaper>
                </Grid>
              )}

              <Grid item xs={12} md={6} sx={{ width: "300px" }}>
                <StyledPaper>
                  <SectionTitle variant="h4">Ingredients</SectionTitle>
                  <List sx={{ p: 0 }}>
                    {receta.ingredientes && receta.ingredientes.map((ingrediente, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          py: { xs: 0.5, sm: 1 },
                          px: 0,
                          borderBottom: index < receta.ingredientes.length - 1 ? "1px solid #f5f5f5" : "none"
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                                color: "#424242"
                              }}
                            >
                              • {ingrediente.nombreIngrediente}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </StyledPaper>
              </Grid>

              <Grid item xs={12} md={6} id="tarjeta-pasos" sx={{ width: "700px" }}>
                <StyledPaper>
                  <SectionTitle variant="h4">Preparation</SectionTitle>
                  <List sx={{ p: 0 }}>
                    {receta.pasos && receta.pasos.map((paso, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          py: { xs: 1, sm: 1.5 },
                          px: 0,
                          borderBottom: index < receta.pasos.length - 1 ? "1px solid #f5f5f5" : "none",
                          alignItems: "flex-start"
                        }}
                      >
                        <Avatar
                          sx={{
                            backgroundColor: "#ff7043",
                            color: "white",
                            width: { xs: 24, sm: 32 },
                            height: { xs: 24, sm: 32 },
                            fontSize: { xs: "0.8rem", sm: "1rem" },
                            mr: { xs: 1, sm: 2 },
                            mt: 0.5
                          }}
                        >
                          {index + 1}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{
                                lineHeight: 1.6,
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                                color: "#424242"
                              }}
                            >
                              {paso.nombrePaso}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </StyledPaper>
              </Grid>
            </Grid>

            {!isAIGenerated && (
              <>
                <Divider sx={{ my: { xs: 4, sm: 5, md: 6 } }} />

                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                  <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 2, sm: 0 }
                  }}>
                    <SectionTitle variant="h4">
                      Reviews ({reseñas.length})
                    </SectionTitle>

                    <Link to="/create-review" style={{ textDecoration: "none" }}>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#ff7043",
                          color: "white",
                          borderRadius: "25px",
                          px: { xs: 2, sm: 3 },
                          py: { xs: 1, sm: 1.5 },
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          boxShadow: "0 4px 12px rgba(255, 112, 67, 0.3)",
                          '&:hover': {
                            backgroundColor: "#f4511e",
                            boxShadow: "0 6px 16px rgba(255, 112, 67, 0.4)"
                          }
                        }}
                      >
                        Write review
                      </Button>
                    </Link>
                  </Box>
                </Box>

                {isLoading ? (
                  <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                    <Spinner />
                  </Box>
                ) : reseñas.length > 0 ? (
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    {reseñas.map((reseña) => (
                      <Grid item xs={12} key={reseña.id}>
                        <ReseñaCard
                          reseña={reseña}
                          onDeleteSuccess={handleDeleteSuccess}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <StyledPaper>
                    <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                      >
                        There are no reviews yet
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          fontSize: { xs: "0.8rem", sm: "0.875rem" }
                        }}
                      >
                        Be the first to write a review for this recipe!
                      </Typography>
                    </Box>
                  </StyledPaper>
                )}
              </>
            )}
          </Box>
        </Box>
      </Fade>

      <Box sx={{
        display: "flex",
        justifyContent: "center",
        mt: { xs: 3, sm: 4 }
      }}>
        <Link to="/all-recipes" style={{ textDecoration: "none" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{
              borderColor: "#ff7043",
              color: "#ff7043",
              borderRadius: "25px",
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              '&:hover': {
                backgroundColor: "#fff8f0",
                borderColor: "#f4511e"
              }
            }}
          >
            Back to recipes
          </Button>
        </Link>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: '100%',
            fontSize: { xs: "0.8rem", sm: "0.875rem" }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}