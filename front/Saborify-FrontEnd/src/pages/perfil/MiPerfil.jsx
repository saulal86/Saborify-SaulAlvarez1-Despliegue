
import {
  Container, Typography, TextField, Button, Box, Snackbar, Alert,
  Paper, Divider, Card, CardContent, Grid, IconButton, InputAdornment,
  CircularProgress, Tooltip, useTheme, useMediaQuery
} from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FavoriteIcon from "@mui/icons-material/Favorite";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import GoogleIcon from "@mui/icons-material/Google";
import { SaborifyContext } from "../../context/SaborifyProvider";
import { useApi } from "../../context/ApiProvider";
import RecetaCardMiPerfil from "../../components/RecetaCardMiPerfil";
import Spinner from "../../components/Spinner";

export default function MiPerfil() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { setReceta } = useContext(SaborifyContext);
  
  const { actualizarUsuario, obtenerRecetasPorUsuario } = useApi();

  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [cambiarPassword, setCambiarPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [mostrarPasswordActual, setMostrarPasswordActual] = useState(false);
  const [mostrarPasswordNueva, setMostrarPasswordNueva] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [misRecetas, setMisRecetas] = useState([]);
  const [recetasFavoritas, setRecetasFavoritas] = useState([]);
  const [loadingRecetas, setLoadingRecetas] = useState(false);
  const [loadingFavoritas, setLoadingFavoritas] = useState(false);

  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const authToken = localStorage.getItem("token");

    if (userData && authToken) {
      try {
        const user = JSON.parse(userData);
        setNombre(user.name || "");
        setUsername(user.userName || "");
        setEmail(user.email || "");
        setUserId(user.id || null);

        const hasGoogleId = user.google_id !== null && user.google_id !== undefined;
        setIsGoogleUser(hasGoogleId);

        cargarMisRecetas(user.id);
        cargarRecetasFavoritas();
      } catch (error) {
        console.error("Error al parsear datos del usuario:", error);
        setError(true);
        setErrorMessage("Error al cargar los datos del usuario");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const cargarMisRecetas = async (userId) => {
    setLoadingRecetas(true);
    try {
      const data = await obtenerRecetasPorUsuario(userId);
      setMisRecetas(data.data || []);
    } catch (error) {
      console.error("Error al cargar recetas del usuario:", error);
      setError(true);
      setErrorMessage("Error al cargar tus recetas. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoadingRecetas(false);
    }
  };

  const cargarRecetasFavoritas = () => {
    setLoadingFavoritas(true);
    try {
      const favoritasData = localStorage.getItem("recetasFavs");
      if (favoritasData) {
        const favoritas = JSON.parse(favoritasData);
        setRecetasFavoritas(favoritas);
      } else {
        setRecetasFavoritas([]);
      }
    } catch (error) {
      console.error("Error al cargar recetas favoritas:", error);
    } finally {
      setLoadingFavoritas(false);
    }
  };

  const validarFormulario = () => {
    if (!nombre.trim()) {
      setError(true);
      setErrorMessage("El nombre es obligatorio");
      return false;
    }

    if (!username.trim()) {
      setError(true);
      setErrorMessage("El nombre de usuario es obligatorio");
      return false;
    }

    if (!email.trim()) {
      setError(true);
      setErrorMessage("El email es obligatorio");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(true);
      setErrorMessage("El formato del email no es válido");
      return false;
    }

    if (cambiarPassword) {
      if (!passwordActual.trim()) {
        setError(true);
        setErrorMessage("La contraseña actual es obligatoria");
        return false;
      }

      if (!passwordNueva.trim()) {
        setError(true);
        setErrorMessage("La nueva contraseña es obligatoria");
        return false;
      }

      if (passwordNueva.length < 8) {
        setError(true);
        setErrorMessage("La contraseña debe tener al menos 8 caracteres");
        return false;
      }

      if (passwordNueva !== confirmPassword) {
        setError(true);
        setErrorMessage("Las contraseñas no coinciden");
        return false;
      }
    }

    return true;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));

      const datosUsuario = {
        name: nombre,
        userName: username,
        email: email,
        user_id: userId
      };

      if (cambiarPassword) {
        datosUsuario.current_password = passwordActual;
        datosUsuario.new_password = passwordNueva;
        datosUsuario.confirm_password = confirmPassword;
      }

      const data = await actualizarUsuario(datosUsuario);

      const nuevosDatos = {
        ...userData,
        name: data.user.name || nombre,
        userName: data.user.userName || username,
        email: data.user.email || email,
        id: data.user.id || userData.id
      };

      localStorage.setItem("user", JSON.stringify(nuevosDatos));

      setSuccessMessage(data.message || (cambiarPassword
        ? "Datos de perfil y contraseña actualizados correctamente"
        : "Datos de perfil actualizados correctamente"));
      setOpenSnackbar(true);

      if (cambiarPassword) {
        setPasswordActual("");
        setPasswordNueva("");
        setConfirmPassword("");
        setCambiarPassword(false);
      }

    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      setError(true);
      setErrorMessage(error.message || "Error al actualizar el perfil. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(false);
  };

  const toggleCambiarPassword = () => {
    setCambiarPassword(!cambiarPassword);
    if (!cambiarPassword) {
      setPasswordActual("");
      setPasswordNueva("");
      setConfirmPassword("");
    }
  };

  const handleVerReceta = (receta) => {
    setReceta(receta)
    navigate(`/recipe-detail`);
  };

  const handleVerTodasMisRecetas = () => {
    navigate("/my-recipes");
  };

  const handleVerTodasFavoritas = () => {
    navigate("/favorite-recipes");
  };
  
  return (
    <Container
      maxWidth="md"
      sx={{
        my: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3
      }}
    >
      <Paper elevation={0} sx={{
        p: 0,
        borderRadius: isMobile ? 2 : 3,
        overflow: 'hidden',
        background: 'linear-gradient(to right, #ff7043, #ffab91)'
      }}>
        <Box sx={{
          p: isMobile ? 2 : 3,
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          flexDirection: isMobile ? 'column' : 'row',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <PersonIcon sx={{
            fontSize: isMobile ? 28 : 36,
            mr: isMobile ? 0 : 2,
            mb: isMobile ? 1 : 0
          }} />
          <Typography
            variant={isMobile ? "h5" : "h4"}
            fontWeight="bold"
            sx={{ fontSize: isMobile ? '1.5rem' : '2.125rem' }}
          >
              Edit Profile
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{
        mt: -2,
        p: isMobile ? 2 : 4,
        pt: isMobile ? 3 : 5,
        borderRadius: isMobile ? 2 : 3,
        position: 'relative',
        zIndex: 1
      }}>
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Name"
              variant="outlined"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                sx: { borderRadius: 2 },
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{
                      color: '#ff7043',
                      fontSize: isMobile ? 20 : 24
                    }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                sx: { borderRadius: 2 },
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleIcon sx={{
                      color: '#ff7043',
                      fontSize: isMobile ? 20 : 24
                    }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                sx: { borderRadius: 2 },
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{
                      color: '#ff7043',
                      fontSize: isMobile ? 20 : 24
                    }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: isMobile ? 3 : 4 }} />

        <Card sx={{
          mb: isMobile ? 3 : 4,
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              mb: 2,
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 2 : 0
            }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                fontWeight="medium"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Box component="span" sx={{
                  bgcolor: '#ff7043',
                  color: 'white',
                  borderRadius: '50%',
                  width: isMobile ? 28 : 32,
                  height: isMobile ? 28 : 32,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                  fontSize: isMobile ? 16 : 18
                }}>
                  <LockIcon fontSize={isMobile ? "small" : "medium"} />
                </Box>
  Change Password
              </Typography>

              <Tooltip
                title={isGoogleUser ? "No puedes cambiar la contraseña con una cuenta de Google" : ""}
                placement="top"
              >
                <span>
                  <Button
                    variant={cambiarPassword ? "contained" : "outlined"}
                    onClick={toggleCambiarPassword}
                    disabled={isGoogleUser}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      borderRadius: 2,
                      bgcolor: cambiarPassword ? '#ff7043' : 'transparent',
                      borderColor: isGoogleUser ? '#bdbdbd' : '#ff7043',
                      color: isGoogleUser ? '#bdbdbd' : (cambiarPassword ? 'white' : '#ff7043'),
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      minWidth: isMobile ? 'auto' : '64px',
                      '&:hover': {
                        bgcolor: cambiarPassword ? '#f4511e' : 'rgba(255, 112, 67, 0.08)',
                        borderColor: isGoogleUser ? '#bdbdbd' : '#f4511e'
                      }
                    }}
                  >
      {cambiarPassword ? "Cancel" : "Change Password"}
                  </Button>
                </span>
              </Tooltip>
            </Box>

            {isGoogleUser && (
              <Box sx={{
                mt: 2,
                p: isMobile ? 1.5 : 2,
                bgcolor: 'rgba(255, 112, 67, 0.55)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'flex-start',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <GoogleIcon sx={{
                  color: '#ff7043',
                  mr: isMobile ? 0 : 1.5,
                  mb: isMobile ? 1 : 0,
                  mt: isMobile ? 0 : 0.3
                }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                >
      You have logged in with Google. Password management is handled through your Google account.
                </Typography>
              </Box>
            )}

            {cambiarPassword && !isGoogleUser && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={isMobile ? 2 : 3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Current password"
                      variant="outlined"
                      type={mostrarPasswordActual ? "text" : "password"}
                      value={passwordActual}
                      onChange={(e) => setPasswordActual(e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        sx: { borderRadius: 2 },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setMostrarPasswordActual(!mostrarPasswordActual)}
                              edge="end"
                              size={isMobile ? "small" : "medium"}
                            >
                              {mostrarPasswordActual ?
                                <VisibilityOffIcon fontSize={isMobile ? "small" : "medium"} /> :
                                <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />
                              }
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="New password"
                      variant="outlined"
                      type={mostrarPasswordNueva ? "text" : "password"}
                      value={passwordNueva}
                      onChange={(e) => setPasswordNueva(e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        sx: { borderRadius: 2 },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setMostrarPasswordNueva(!mostrarPasswordNueva)}
                              edge="end"
                              size={isMobile ? "small" : "medium"}
                            >
                              {mostrarPasswordNueva ?
                                <VisibilityOffIcon fontSize={isMobile ? "small" : "medium"} /> :
                                <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />
                              }
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Confirm new password"
                      variant="outlined"
                      type={mostrarConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        sx: { borderRadius: 2 },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                              edge="end"
                              size={isMobile ? "small" : "medium"}
                            >
                              {mostrarConfirmPassword ?
                                <VisibilityOffIcon fontSize={isMobile ? "small" : "medium"} /> :
                                <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />
                              }
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      error={passwordNueva !== confirmPassword && confirmPassword !== ""}
                      helperText={passwordNueva !== confirmPassword && confirmPassword !== "" ? "Passwords do not match" : ""}
                    />
                  </Grid>
                </Grid>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 2,
                    display: 'flex',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <Box component="span" sx={{
                    bgcolor: '#ffe0b2',
                    color: '#fb8c00',
                    borderRadius: '50%',
                    width: isMobile ? 18 : 20,
                    height: isMobile ? 18 : 20,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1,
                    fontSize: isMobile ? 12 : 14,
                    fontWeight: 'bold',
                    flexShrink: 0,
                    mt: isMobile ? 0.2 : 0
                  }}>i</Box>
  Password must be at least 8 characters.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Box
          display="flex"
          justifyContent="space-between"
          mt={isMobile ? 3 : 4}
          flexDirection={isMobile ? 'column' : 'row'}
          gap={isMobile ? 2 : 0}
        >
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon fontSize={isMobile ? "small" : "medium"} />}
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              borderColor: '#9e9e9e',
              color: '#757575',
              order: isMobile ? 2 : 1,
              '&:hover': {
                borderColor: '#757575',
                bgcolor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleGuardar}
            startIcon={<SaveIcon fontSize={isMobile ? "small" : "medium"} />}
            disabled={loading}
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              bgcolor: '#ff7043',
              order: isMobile ? 1 : 2,
              px: isMobile ? 2 : 3,
              '&:hover': {
                bgcolor: '#f4511e'
              }
            }}
          >
  {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{
        mt: isMobile ? 3 : 4,
        p: isMobile ? 2 : 3,
        borderRadius: isMobile ? 2 : 3
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          mb: 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0
        }}>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            fontWeight="bold"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Box sx={{
              bgcolor: '#ff7043',
              color: 'white',
              borderRadius: '50%',
              width: isMobile ? 32 : 36,
              height: isMobile ? 32 : 36,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5
            }}>
              <RestaurantIcon fontSize={isMobile ? "small" : "medium"} />
            </Box>
  My Recipes
          </Typography>

          <Button
            variant="outlined"
            endIcon={<NavigateNextIcon fontSize={isMobile ? "small" : "medium"} />}
            onClick={handleVerTodasMisRecetas}
            size={isMobile ? "small" : "medium"}
            sx={{
              borderRadius: 2,
              borderColor: '#ff7043',
              color: '#ff7043',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              alignSelf: isMobile ? 'flex-start' : 'auto',
              '&:hover': {
                borderColor: '#f4511e',
                bgcolor: 'rgba(255, 112, 67, 0.08)'
              }
            }}
          >
  View all
          </Button>
        </Box>

        {loadingRecetas ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Spinner size={isMobile ? 32 : 40} />
          </Box>
        ) : misRecetas.length > 0 ? (
          <Box>
            {misRecetas.slice(0, 3).map((receta) => (
              <RecetaCardMiPerfil key={receta.id} receta={receta} handleVerReceta={handleVerReceta} />
            ))}
          </Box>
        ) : (
          <Box sx={{
            py: isMobile ? 3 : 4,
            textAlign: 'center',
            bgcolor: '#f5f5f5',
            borderRadius: 2,
            px: isMobile ? 2 : 3
          }}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
  You haven't created any recipes yet
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/create-recipe')}
              size={isMobile ? "small" : "medium"}
              sx={{
                mt: 2,
                borderRadius: 2,
                bgcolor: '#ff7043',
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                '&:hover': {
                  bgcolor: '#f4511e'
                }
              }}
            >
  Create my first recipe
            </Button>
          </Box>
        )}
      </Paper>

      <Paper elevation={3} sx={{
        mt: isMobile ? 3 : 4,
        p: isMobile ? 2 : 3,
        borderRadius: isMobile ? 2 : 3
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          mb: 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0
        }}>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            fontWeight="bold"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Box sx={{
              bgcolor: '#ff7043',
              color: 'white',
              borderRadius: '50%',
              width: isMobile ? 32 : 36,
              height: isMobile ? 32 : 36,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5
            }}>
              <FavoriteIcon fontSize={isMobile ? "small" : "medium"} />
            </Box>
  Favorite Recipes
          </Typography>

          <Button
            variant="outlined"
            endIcon={<NavigateNextIcon fontSize={isMobile ? "small" : "medium"} />}
            onClick={handleVerTodasFavoritas}
            size={isMobile ? "small" : "medium"}
            sx={{
              borderRadius: 2,
              borderColor: '#ff7043',
              color: '#ff7043',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              alignSelf: isMobile ? 'flex-start' : 'auto',
              '&:hover': {
                borderColor: '#f4511e',
                bgcolor: 'rgba(255, 112, 67, 0.08)'
              }
            }}
          >
  View all
          </Button>
        </Box>

        {loadingFavoritas ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#ff7043' }} size={isMobile ? 32 : 40} />
          </Box>
        ) : recetasFavoritas.length > 0 ? (
          <Box>
            {recetasFavoritas.slice(0, 3).map((receta) => (
              <RecetaCardMiPerfil key={receta.id} receta={receta} handleVerReceta={handleVerReceta} />
            ))}
          </Box>
        ) : (
          <Box sx={{
            py: isMobile ? 3 : 4,
            textAlign: 'center',
            bgcolor: '#f5f5f5',
            borderRadius: 2,
            px: isMobile ? 2 : 3
          }}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
  You don't have any favorite recipes yet
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/all-recipes')}
              size={isMobile ? "small" : "medium"}
              sx={{
                mt: 2,
                borderRadius: 2,
                bgcolor: '#ff7043',
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                '&:hover': {
                  bgcolor: '#f4511e'
                }
              }}
            >
  Explore recipes
            </Button>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}