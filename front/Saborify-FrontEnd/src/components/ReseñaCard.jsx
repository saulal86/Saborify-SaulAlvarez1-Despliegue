import {
  Typography,
  Grid,
  Box,
  Avatar,
  Rating,
  CardContent,
  styled,
  Card,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import PropTypes from "prop-types";
import { useState } from "react";
import { useApi } from '../context/ApiProvider';

export default function ReseñaCard({ reseña, idx, onDeleteSuccess }) {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { eliminarResenia } = useApi();

  const user = JSON.parse(localStorage.getItem("user"));

  const ReviewCard = styled(Card)(({ theme }) => ({
    backgroundColor: "#fff",
    borderRadius: "12px",
    marginBottom: theme.spacing(2),
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    position: "relative",
    height: "100%"
  }));

  const handleOpenDeleteModal = () => {
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setError('');
  };

  const confirmDelete = async () => {
    setLoading(true);
    setError('');

    try {
      console.log("Eliminando reseña:", reseña.id);

      await eliminarResenia(reseña.id);

      console.log("Reseña eliminada con éxito");
      setSuccessMessage('Review deleted successfully');

      if (onDeleteSuccess) {
        onDeleteSuccess(reseña.id);
      }

      handleCloseDeleteModal();

    } catch (error) {
      console.error("Error al eliminar la reseña:", error);
      setError(error.message || 'Error deleting the review');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setError('');
  };

  return (
    <>
      <Grid item xs={12} md={6} key={idx}>
        <ReviewCard>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#ff7043', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {reseña.usuario}
                  </Typography>
                  <Rating
                    value={reseña.puntuacion}
                    readOnly
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              {user?.role === "admin" && (
                <IconButton
                  size="small"
                  onClick={handleOpenDeleteModal}
                  disabled={loading}
                  sx={{
                    color: "#d32f2f",
                    '&:hover': {
                      backgroundColor: "#ffebee"
                    },
                    '&:disabled': {
                      color: "#bdbdbd"
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
              {reseña.comentario}
            </Typography>
          </CardContent>
        </ReviewCard>
      </Grid>

      <Dialog
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteModal}
            disabled={loading}
            sx={{ color: "#546e7a" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: "#d32f2f",
              color: "white",
              '&:disabled': {
                backgroundColor: "#bdbdbd"
              }
            }}
            autoFocus
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error && !openDeleteModal}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

ReseñaCard.propTypes = {
  reseña: PropTypes.shape({
    id: PropTypes.number.isRequired,
    usuario: PropTypes.string.isRequired,
    puntuacion: PropTypes.number.isRequired,
    comentario: PropTypes.string.isRequired,
  }).isRequired,
  idx: PropTypes.number.isRequired,
  onDeleteSuccess: PropTypes.func
};