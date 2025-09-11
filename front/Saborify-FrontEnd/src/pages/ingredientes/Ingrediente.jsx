import { useContext, useEffect, useState } from "react";
import { SaborifyContext } from "../../context/SaborifyProvider";
import { useApi } from "../../context/ApiProvider";
import {
  Container,
  Typography,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
  Button
} from "@mui/material";
import RecetaCard from "../../components/RecetaCard";
import Spinner from "../../components/Spinner";
import { Link } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Ingrediente() {
  const { ingrediente, alergenoSeleccionado, recetasMasVistas } = useContext(SaborifyContext);
  const { obtenerRecetasDeIngrediente, obtenerRecetasSinAlergeno } = useApi();
  const [recetasRelacionadas, setRecetasRelacionadas] = useState([]);
  const [recetasSinAlergenos, setRecetasSinAlergenos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  async function cargaRecetasRelacionadas() {
    try {
      setIsLoading(true);
      const response = await obtenerRecetasDeIngrediente(ingrediente.id);
      setRecetasRelacionadas(response.data || []);
    } catch (ex) {
      console.error('Error al cargar recetas relacionadas:', ex.message);
      setRecetasRelacionadas([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function cargaRecetasSinAlergenos() {
    try {
      const response = await obtenerRecetasSinAlergeno(alergenoSeleccionado);
      setRecetasSinAlergenos(response.data || []);
    } catch (ex) {
      console.error('Error al cargar recetas sin alérgenos:', ex.message);
      setRecetasSinAlergenos([]);
    }
  }

  useEffect(() => {
    cargaRecetasRelacionadas();
    cargaRecetasSinAlergenos();

    if (alergenoSeleccionado === null) {
      const recetasAleatorias = [...recetasMasVistas]
        .sort(() => Math.random() - 0.5)
        .slice(0, 9);
      setRecetasSinAlergenos(recetasAleatorias);
    }
  }, []);

  useEffect(() => {
    cargaRecetasRelacionadas();
  }, [ingrediente]);

  const recetasSugeridas = recetasSinAlergenos
    .filter(receta => !recetasRelacionadas.some(r => r.id === receta.id))
    .slice(0, 3);

  const noHayRecetas = !isLoading && recetasRelacionadas.length === 0;

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: { xs: 3, sm: 4, md: 6 },
        mb: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '60vh'
      }}
    >
      <Box
        mb={{ xs: 4, sm: 5, md: 6 }}
        textAlign="center"
        px={{ xs: 1, sm: 2 }}
        width="100%"
        maxWidth="800px"
      >
        <Typography
          variant={isMobile ? "h5" : isTablet ? "h4" : "h3"}
          component="h1"
          gutterBottom
          sx={{
            color: '#ff7043',
            fontWeight: 'bold',
            position: 'relative',
            display: 'inline-block',
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem', lg: '3rem' },
            lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 },
            mb: { xs: 2, sm: 3 },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: { xs: '80%', sm: '70%', md: '60%' },
              height: { xs: '3px', sm: '4px' },
              bottom: { xs: '-8px', sm: '-10px' },
              left: { xs: '10%', sm: '15%', md: '20%' },
              backgroundColor: '#ff7043',
              borderRadius: '2px'
            }
          }}
        >
          Recipes with {ingrediente.nombre}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: { xs: '100%', sm: '600px', md: '700px' },
            mx: 'auto',
            mt: { xs: 2, sm: 2.5, md: 3 },
            fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
            lineHeight: { xs: 1.5, sm: 1.6 },
            px: { xs: 1, sm: 0 }
          }}
        >
          Explore our selection of recipes that include {ingrediente.nombre} as a main ingredient.
        </Typography>
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            py: { xs: 4, sm: 6, md: 8 }
          }}
        >
          <Spinner />
        </Box>
      ) : noHayRecetas ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            textAlign: 'center',
            py: { xs: 4, sm: 6, md: 8 },
            px: { xs: 2, sm: 3, md: 4 },
            maxWidth: '100%',
            width: '100%'
          }}
        >
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              backgroundColor: 'rgba(255,112,67,0.05)',
              borderRadius: { xs: 2, sm: 3 },
              border: '2px solid rgba(255,112,67,0.2)',
              width: '100%',
              maxWidth: '500px',
              mb: { xs: 4, sm: 5, md: 6 }
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: '#ff7043',
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' }
              }}
            >
              Oops! 🍳
            </Typography>

            <Divider sx={{ my: 2, backgroundColor: 'rgba(255,112,67,0.3)' }} />

            <Typography
              variant="body1"
              color="text.primary"
              sx={{
                mb: 2,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                lineHeight: 1.6
              }}
            >
              We currently have no recipes available with <strong>{ingrediente.nombre}</strong>.
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' },
                lineHeight: 1.5
              }}
            >
              We suggest you explore other ingredients or check out our most popular recipes.
            </Typography>
          </Paper>

          {recetasSugeridas.length > 0 && (
            <Box
              sx={{
                width: '100%',
                maxWidth: '1200px',
                px: { xs: 1, sm: 0 }
              }}
            >
              <Typography
                variant={isMobile ? "h6" : isTablet ? "h5" : "h4"}
                sx={{
                  color: "#ff7043",
                  fontWeight: 'bold',
                  mb: { xs: 3, sm: 3.5, md: 4 },
                  fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem', lg: '2rem' },
                  position: 'relative',
                  display: 'inline-block',
                  textAlign: 'center',
                  width: '100%',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: { xs: '100px', sm: '120px', md: '150px' },
                    height: { xs: '2px', sm: '3px' },
                    bottom: { xs: '-6px', sm: '-8px' },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#ff7043',
                    borderRadius: '2px'
                  }
                }}
              >
                Recipes you may be interested in
              </Typography>

              <Grid
                container
                spacing={{ xs: 2, sm: 2.5, md: 3 }}
                mt={1}
                sx={{
                  justifyContent: 'center'
                }}
              >
                {recetasSugeridas.map((receta) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={receta.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <RecetaCard receta={receta} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {recetasRelacionadas.length > 0 && (
            <Box sx={{ width: '100%', mb: { xs: 4, sm: 6, md: 8 } }}>
              <Grid
                container
                spacing={{ xs: 2, sm: 2.5, md: 3 }}
                sx={{
                  justifyContent: 'center',
                  maxWidth: '1200px',
                  mx: 'auto'
                }}
              >
                {recetasRelacionadas.map((receta) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    xl={3}
                    key={receta.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <RecetaCard receta={receta} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {recetasSugeridas.length > 0 && (
            <Box
              sx={{
                width: '100%',
                maxWidth: '1200px',
                mt: recetasRelacionadas.length > 0 ? { xs: 6, sm: 7, md: 8 } : 0,
                px: { xs: 1, sm: 0 }
              }}
            >
              <Typography
                variant={isMobile ? "h6" : isTablet ? "h5" : "h4"}
                sx={{
                  color: "#ff7043",
                  fontWeight: 'bold',
                  mb: { xs: 3, sm: 3.5, md: 4 },
                  fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem', lg: '2rem' },
                  position: 'relative',
                  display: 'inline-block',
                  textAlign: 'center',
                  width: '100%',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: { xs: '100px', sm: '120px', md: '150px' },
                    height: { xs: '2px', sm: '3px' },
                    bottom: { xs: '-6px', sm: '-8px' },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#ff7043',
                    borderRadius: '2px'
                  }
                }}
              >
                Recipes you may be interested in
              </Typography>

              <Grid
                container
                spacing={{ xs: 2, sm: 2.5, md: 3 }}
                mt={1}
                sx={{
                  justifyContent: 'center'
                }}
              >
                {recetasSugeridas.map((receta) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={receta.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <RecetaCard receta={receta} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      <Box sx={{
        display: "flex",
        justifyContent: "center",
        mt: { xs: 3, sm: 4 }
      }}>
        <Link to="/all-ingredients" style={{ textDecoration: "none" }}>
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
            Back to ingredients
          </Button>
        </Link>
      </Box>
    </Container>
  );
}