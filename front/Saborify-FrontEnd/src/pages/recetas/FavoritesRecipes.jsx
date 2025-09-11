import { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Grid,
    Box,
    Paper,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavRecetaCard from "../../components/FavRecetaCard";
import Spinner from "../../components/Spinner";

export default function FavoritesRecipes() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFavorites = () => {
            try {
                const savedFavorites = localStorage.getItem("recetasFavs");
                if (savedFavorites) {
                    setFavorites(JSON.parse(savedFavorites));
                }
            } catch (error) {
                console.error("Error cargando favoritos:", error);
            } finally {
                setLoading(false);
            }
        };

        loadFavorites();
    }, []);

    const removeFromFavorites = (id) => {
        try {
            const updatedFavorites = favorites.filter(receta => receta.id !== id);
            setFavorites(updatedFavorites);
            localStorage.setItem("recetasFavs", JSON.stringify(updatedFavorites));
        } catch (error) {
            console.error("Error eliminando favorito:", error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Spinner />
            </Box>
        );
    }

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
                    Favorites Recipes
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
        Find here all the recipes you have saved as favorites
                </Typography>
            </Box>

            {favorites.length === 0 ? (
                <Paper
                    elevation={1}
                    sx={{
                        p: 5,
                        borderRadius: 2,
                        textAlign: "center",
                        backgroundColor: "#f9f9f9"
                    }}
                >
                    <FavoriteBorderIcon sx={{ fontSize: 60, color: "#bdbdbd", mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
            You have no favorite recipes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
            Add recipes to your favorites to see them here.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={4} justifyContent="center">
                    {favorites.map((receta) => (
                        <Grid item xs={12} sm={6} md={3} display="flex" justifyContent="center" key={receta.id}>
                            <FavRecetaCard receta={receta} onRemove={removeFromFavorites} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}