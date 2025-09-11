import { Container, Box } from '@mui/material';
import { useContext } from 'react';
import { SaborifyContext } from '../../context/SaborifyProvider';
import ReseñaForm from '../../components/ReseñaForm';

export default function CrearReseña() {
  const { receta } = useContext(SaborifyContext);

  const recetaId = receta.id;
  const usuarioId = Number(JSON.parse(localStorage.getItem('user')).id);
  
  return (
    <Container maxWidth="md">
      <Box my={4}>
        <ReseñaForm 
          recetaId={recetaId} 
          usuarioId={usuarioId} 
        />
      </Box>
    </Container>
  );
}
