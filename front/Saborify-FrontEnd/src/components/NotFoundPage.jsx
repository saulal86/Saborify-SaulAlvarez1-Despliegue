import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

export default function NotFoundPage() {
    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '70vh',
                    textAlign: 'center',
                    py: 8
                }}
            >
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: '5rem', md: '8rem' },
                        fontWeight: 800,
                        color: '#ff7043',
                        mb: 2,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    404
                </Typography>

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 600,
                        mb: 3,
                        color: '#444'
                    }}
                >
                    Page not found!
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        fontSize: '1.1rem',
                        color: '#666',
                        maxWidth: '500px',
                        mb: 5
                    }}
                >
                    Sorry, the page you are looking for does not exist or has been moved.
                    You may have typed the address incorrectly or the page may have been deleted.
                </Typography>

                <Box
                    sx={{
                        position: 'relative',
                        width: { xs: '280px', sm: '350px' },
                        height: { xs: '200px', sm: '250px' },
                        mb: 4,
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: '10%',
                            width: '80%',
                            height: '40px',
                            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 80%)',
                            borderRadius: '50%',
                            zIndex: -1
                        }
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '140px',
                            color: '#ff9800',
                            opacity: 0.8
                        }}
                    >
                        👨‍🍳
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button
                        component={Link}
                        to="/"
                        variant="contained"
                        startIcon={<HomeIcon />}
                        sx={{
                            background: 'linear-gradient(45deg, #ff7043 30%, #ff9800 90%)',
                            color: 'white',
                            fontWeight: 600,
                            py: 1.2,
                            px: 3,
                            borderRadius: '30px',
                            textTransform: 'none',
                            boxShadow: '0 3px 12px rgba(255, 112, 67, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #ff5722 30%, #ff7043 90%)',
                                boxShadow: '0 5px 15px rgba(255, 112, 67, 0.4)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Back to Home
                    </Button>

                    <Button
                        component={Link}
                        to="/all-recipes"
                        variant="outlined"
                        sx={{
                            color: '#ff7043',
                            borderColor: '#ff7043',
                            fontWeight: 600,
                            py: 1.2,
                            px: 3,
                            borderRadius: '30px',
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: '#ff5722',
                                backgroundColor: 'rgba(255, 112, 67, 0.04)'
                            }
                        }}
                    >
                        Explore recipes
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}


