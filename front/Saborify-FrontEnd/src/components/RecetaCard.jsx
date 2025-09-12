import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Grid,
    Box,
    Button,
    Chip,
    Divider,
    Rating
} from "@mui/material";
import { Link } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { motion } from "framer-motion";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CategoryIcon from "@mui/icons-material/Category";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import { useContext, useMemo } from "react";
import PropTypes from 'prop-types';
import { SaborifyContext } from "../context/SaborifyProvider";

import imagenPlaceholder1 from '../assets/imagenRecetaPlaceholder.png';
import imagenPlaceholder2 from '../assets/imagenRecetaPlaceholder2.jpg';
import imagenPlaceholder3 from '../assets/imagenRecetaPlaceholder3.jpg';
import imagenPlaceholder4 from '../assets/imagenRecetaPlaceholder4.jpg';

const placeholderImages = [
    imagenPlaceholder1,
    imagenPlaceholder2,
    imagenPlaceholder3,
    imagenPlaceholder4
];

export default function RecetaCard({ receta }) {
    const { setReceta } = useContext(SaborifyContext);

    const getRandomPlaceholder = useMemo(() => {
        if (receta.imagen) return receta.imagen;
        
        const seed = receta.id.toString();
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        const index = Math.abs(hash) % placeholderImages.length;
        return placeholderImages[index];
    }, [receta.id, receta.imagen]);

    if (!receta || !receta.id || !receta.nombre) {
        return null;
    }

    return (
        <Grid item xs={12} sm={6} md={3} display="flex" justifyContent="center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ width: '100%' }}
            >
                <Card
                    elevation={3}
                    sx={{
                        height: '100%',
                        width: '300px',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease-in-out',
                        position: 'relative',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 20px rgba(255, 112, 67, 0.2)',
                        },
                    }}
                    onClick={() => setReceta(receta)}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            zIndex: 10,
                            '&:hover': {
                                opacity: 1,
                            },
                        }}
                    >
                        <Link to="/recipe-detail" style={{ textDecoration: 'none' }}>
                            <Button
                                variant="contained"
                                startIcon={<VisibilityIcon />}
                                sx={{
                                    backgroundColor: "#ff7043",
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    fontWeight: 'bold',
                                    textTransform: "none",
                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                                    '&:hover': {
                                        backgroundColor: "#ff5722",
                                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4)',
                                    }
                                }}
                            >
                                View Recipe
                            </Button>
                        </Link>
                    </Box>

                    <CardMedia
                        component="img"
                        height="180"
                        image={getRandomPlaceholder}
                        alt={receta.nombre}
                    />

                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                                color: '#ff7043',
                                fontWeight: 'bold'
                            }}
                        >
                            {receta.nombre}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <RestaurantIcon sx={{ fontSize: '0.9rem', color: '#ff7043', mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Cuisine type: {receta.tipoCocina || 'Not specified'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                <CategoryIcon sx={{ fontSize: '0.9rem', color: '#ff7043', mr: 1, mt: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Meal type: {Array.isArray(receta.tipoComida) ? receta.tipoComida.join(", ") : receta.tipoComida || 'Not specified'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocalDiningIcon sx={{ fontSize: '0.9rem', color: '#ff7043', mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Servings: {receta.porciones || 'Not specified'}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Chip
                                icon={<SignalCellularAltIcon />}
                                label={receta.dificultad || 'N/A'}
                                size="small"
                                sx={{
                                    bgcolor: '#fff8f0',
                                    color: '#ff7043',
                                    border: '1px solid #ffe0b2',
                                }}
                            />
                            <Chip
                                icon={<AccessTimeIcon />}
                                label={receta.tiempoCocinado ? `${receta.tiempoCocinado} min` : '< 10 min'}
                                size="small"
                                sx={{
                                    bgcolor: '#fff8f0',
                                    color: '#ff7043',
                                    border: '1px solid #ffe0b2',
                                }}
                            />
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mt: 2,
                            flexDirection: 'column'
                        }}>

                            <Rating
                                name={`rating-${receta.id}`}
                                value={receta.valoracion || 0}
                                precision={0.5}
                                readOnly
                                size="small"
                                sx={{
                                    '& .MuiRating-iconFilled': {
                                        color: '#ff7043',
                                    }
                                }}
                            />
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                {receta.valoracion ? `${Number(receta.valoracion).toFixed(1)}/5` : 'No ratings'}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </motion.div>
        </Grid>
    );
}

RecetaCard.propTypes = {
    receta: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        nombre: PropTypes.string.isRequired,
        imagen: PropTypes.string,
        tipoCocina: PropTypes.string,
        tipoComida: PropTypes.arrayOf(PropTypes.string),
        dificultad: PropTypes.string,
        tiempoCocinado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        porciones: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        valoracion: PropTypes.number,
    }).isRequired
};