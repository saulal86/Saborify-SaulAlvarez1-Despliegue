import {
    Typography,
    Box,
    Button,
    Card,
    CardMedia,
    CardContent,
    Divider,
    Chip,
    Rating
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CategoryIcon from "@mui/icons-material/Category";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { SaborifyContext } from "../context/SaborifyProvider";
import imagenPlaceholder from '../assets/imagenRecetaPlaceholder.png';

export default function FavRecetaCard({ receta, onRemove }) {
    const { setReceta } = useContext(SaborifyContext);

    return (
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Link to={`/recipe-detail`} style={{ textDecoration: 'none' }}>
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
                                onClick={setReceta(receta)}
                            >
                                View Recipe
                            </Button>
                        </Link>
                        {
                            <Button
                                variant="contained"
                                startIcon={<DeleteIcon />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(receta.id);
                                }}
                                sx={{
                                    backgroundColor: "white",
                                    color: "#f44336",
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    fontWeight: 'bold',
                                    textTransform: "none",
                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                                    '&:hover': {
                                        backgroundColor: "#ffebee",
                                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4)',
                                    }
                                }}
                            >
                                Remove
                            </Button>
                        }
                    </Box>
                </Box>

                <CardMedia
                    component="img"
                    height="180"
                    image={receta.imagen || imagenPlaceholder}
                    alt={receta.nombre}
                    onError={(e) => {
                        e.target.src = "/api/placeholder/400/320";
                        e.target.alt = "Image not available";
                    }}
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
                                Meal type: {Array.isArray(receta.tipoComida) ? receta.tipoComida.join(", ") : (receta.tipoComida || 'Not specified')}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <FavoriteIcon sx={{ fontSize: '1rem', color: '#ff7043', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                Favorite
                            </Typography>
                        </Box>

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
    );
};