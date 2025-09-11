import { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Rating,
    Card,
    CardContent,
    Snackbar,
    Alert,
    CircularProgress,
    Paper,
    Divider,
    InputAdornment
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StarIcon from '@mui/icons-material/Star';
import CommentIcon from '@mui/icons-material/Comment';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../context/ApiProvider';
import PropTypes from 'prop-types';

export default function ReseñaForm({ recetaId, usuarioId, onReseñaCreated }) {
    const [puntuacion, setPuntuacion] = useState(0);
    const [comentario, setComentario] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const { crearResenia } = useApi();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (puntuacion === 0) {
            setError('Please add a rating');
            return;
        }

        if (!comentario.trim()) {
            setError('Please add a comment');
            return;
        }

        if (!recetaId || !usuarioId) {
            setError('Missing required data to create the review');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const reseñaData = {
                receta_id: recetaId,
                usuario_id: usuarioId,
                puntuacion,
                comentario: comentario.trim()
            };

            const data = await crearResenia(reseñaData);
            console.log("Reseña creada:", data);

            setPuntuacion(0);
            setComentario('');
            setSuccess(true);

            if (onReseñaCreated) {
                onReseñaCreated(data);
            }

            setTimeout(() => {
                navigate(`/recipe-detail`);
            }, 1500);

        } catch (err) {
            console.error('Error al crear la reseña:', err);
            setError(err.message || 'Error al enviar la reseña');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseAlert = () => {
        setError(null);
        setSuccess(false);
    };

    const getRatingText = (rating) => {
        const texts = {
            0: 'Select a rating',
            1: "Didn't like it at all!",
            2: "It's okay",
            3: "It's good",
            4: "Really liked it!",
            5: "Excellent! One of the best!"
        };
        return texts[rating] || '';
    };

    return (
        <Paper elevation={0} sx={{
            p: 0,
            borderRadius: 3,
            overflow: 'hidden',
            mb: 4
        }}>
            <Box sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(to right, #ff7043, #ffab91)',
                color: 'white'
            }}>
                <StarIcon sx={{ fontSize: 36, mr: 2 }} />
                <Typography variant="h5" fontWeight="bold">
                    What did you think of this recipe?
                </Typography>
            </Box>

            <Card elevation={3} sx={{
                mt: -2,
                mx: 2,
                mb: 2,
                p: 0,
                borderRadius: 3,
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
                <CardContent sx={{ p: 4 }}>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mb: 3
                        }}>
                            <Typography variant="h6" component="h2" fontWeight="medium" sx={{
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Box component="span" sx={{
                                    bgcolor: '#ff7043',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: 32,
                                    height: 32,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 1.5,
                                    fontSize: 18
                                }}>1</Box>
                                Your rating
                            </Typography>

                            <Rating
                                name="rating"
                                value={puntuacion}
                                onChange={(event, newValue) => {
                                    setPuntuacion(newValue || 0);
                                    if (newValue > 0 && error?.includes('puntuación')) {
                                        setError(null);
                                    }
                                }}
                                size="large"
                                disabled={loading}
                                sx={{
                                    fontSize: '2.5rem',
                                    '& .MuiRating-iconFilled': {
                                        color: '#ff7043',
                                    },
                                    '& .MuiRating-iconHover': {
                                        color: '#f4511e',
                                    },
                                }}
                            />

                            <Typography variant="body2" sx={{
                                mt: 1,
                                color: puntuacion === 0 ? 'text.secondary' : '#ff7043',
                                fontStyle: 'italic',
                                fontWeight: puntuacion === 0 ? 'normal' : 'medium'
                            }}>
                                {getRatingText(puntuacion)}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" component="h2" fontWeight="medium" sx={{
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Box component="span" sx={{
                                    bgcolor: '#ff7043',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: 32,
                                    height: 32,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 1.5,
                                    fontSize: 18
                                }}>2</Box>
                                Your comment
                            </Typography>

                            <TextField
                                label="Share your experience"
                                placeholder="What did you think of this recipe? Did you adapt it? Any advice for other cooks?"
                                multiline
                                rows={4}
                                value={comentario}
                                onChange={(e) => {
                                    setComentario(e.target.value);
                                    if (e.target.value.trim() && error?.includes('comment')) {
                                        setError(null);
                                    }
                                }}
                                variant="outlined"
                                fullWidth
                                disabled={loading}
                                error={error?.includes('comment')}
                                InputProps={{
                                    sx: { borderRadius: 2 },
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CommentIcon sx={{ color: '#ff7043' }} />
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <Typography variant="body2" sx={{
                                mt: 2,
                                display: 'flex',
                                alignItems: 'center',
                                color: 'text.secondary'
                            }}>
                                <Box component="span" sx={{
                                    bgcolor: '#ffe0b2',
                                    color: '#fb8c00',
                                    borderRadius: '50%',
                                    width: 20,
                                    height: 20,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 1,
                                    fontSize: 14,
                                    fontWeight: 'bold'
                                }}>i</Box>
                                Your opinion is valuable to the community. Be constructive and detailed!
                            </Typography>
                        </Box>

                        <Box display="flex" justifyContent="center" mt={4}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading || puntuacion === 0}
                                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: '#ff7043',
                                    '&:hover': {
                                        bgcolor: '#f4511e'
                                    },
                                    '&:disabled': {
                                        bgcolor: '#bdbdbd'
                                    },
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1rem'
                                }}
                            >
                                {loading ? 'Sending...' : 'Post Review'}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseAlert}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseAlert}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 2 }}
                    icon={false}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            p: 0.5,
                            borderRadius: '50%',
                            mr: 1,
                            display: 'flex'
                        }}>
                            <StarIcon fontSize="small" />
                        </Box>
                        Review posted successfully!
                    </Box>
                </Alert>
            </Snackbar>
        </Paper>
    );
}

ReseñaForm.propTypes = {
    recetaId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]).isRequired,
    usuarioId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]).isRequired,
    onReseñaCreated: PropTypes.func
};