import {
    Typography, Button, Box, Card, Rating, Chip
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import imagenPlaceholder from '../assets/imagenRecetaPlaceholder.png';

export default function RecetaCardMiPerfil({ receta, handleVerReceta }) {
    return (
        <Card sx={{
            display: 'flex',
            mb: 2,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
            }
        }}>
            <Box sx={{
                width: '35%',
                minHeight: 150,
                maxHeight: 150,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box
                    component="img"
                    src={receta.imagen || imagenPlaceholder}
                    alt={receta.nombre}
                    onError={(e) => { e.target.src = '/placeholder-food.jpg' }}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            </Box>

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '65%',
                p: 2
            }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5, color: '#333' }}>
                        {receta.nombre}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating
                            value={parseFloat(receta.valoracion) || 0}
                            readOnly
                            precision={0.5}
                            size="small"
                            sx={{ color: '#ff7043' }}
                        />
                        <Typography variant="body2" sx={{ ml: 1, color: '#666' }}>
                            {receta.valoracion || '0'}/5
                        </Typography>
                    </Box>

                    <Chip
                        label={receta.tipoCocina || 'General'}
                        size="small"
                        sx={{
                            bgcolor: '#ffe0b2',
                            color: '#f57c00',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                        }}
                    />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleVerReceta(receta)}
                        sx={{
                            borderRadius: 4,
                            bgcolor: '#ff7043',
                            fontSize: '0.75rem',
                            '&:hover': {
                                bgcolor: '#f4511e'
                            },
                            textTransform: 'none'
                        }}
                    >
                        View Recipe
                    </Button>
                </Box>
            </Box>
        </Card>
    );
};

