import {
    Typography,
    Box,
} from "@mui/material";
import KitchenIcon from '@mui/icons-material/Kitchen';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import RamenDiningIcon from '@mui/icons-material/RamenDining';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CakeIcon from '@mui/icons-material/Cake';
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';

export default function Spinner() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                position: 'relative'
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    mb: 3,
                    width: 100,
                    height: 100,
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        backgroundColor: '#fff3e0',
                        border: '3px dashed #ffab91',
                        animation: 'plateSpin 3s linear infinite',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {[RamenDiningIcon, LocalDiningIcon, RestaurantMenuIcon, CakeIcon, KitchenIcon].map((Icon, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                position: 'absolute',
                                animation: `orbit 2s infinite ease-in-out`,
                                animationDelay: `${idx * 0.3}s`,
                                transformOrigin: '50px 50px',
                            }}
                        >
                            <Icon sx={{ color: '#ff7043', fontSize: 28 }} />
                        </Box>
                    ))}
                </Box>

                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2,
                    }}
                >
                    <EmojiFoodBeverageIcon sx={{ fontSize: 40, color: '#bf360c' }} />
                </Box>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Loading recipes...
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                Just a moment, something smells delicious!
            </Typography>
        </Box>
    );
}
