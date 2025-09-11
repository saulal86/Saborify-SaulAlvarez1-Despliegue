import Receta from "./pages/recetas/Receta";
import Recetas from "./pages/recetas/Recetas";
import { SaborifyProvider } from "./context/SaborifyProvider";
import { ApiProvider } from "./context/ApiProvider";
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Header from "./components/Header";
import HomePage from "./pages/perfil/HomePage";
import Ingredientes from "./pages/ingredientes/Ingredientes";
import Ingrediente from "./pages/ingredientes/Ingrediente";
import Footer from "./components/Footer";
import "./css/estilos.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import EditarReceta from "./pages/recetas/EditarReceta";
import NuevReceta from "./pages/recetas/NuevaReceta";
import ScrollToTop from "./pages/ScrollToTop";
import CrearReseña from "./pages/reseñas/CrearReseña";
import NotFoundPage from "./components/NotFoundPage";
import FavoritesRecipes from "./pages/recetas/FavoritesRecipes";
import MisRecetas from "./pages/recetas/MisRecetas";
import InicioSesion from "./pages/perfil/InicioSesion";
import Registro from "./pages/perfil/Registro";
import MiPerfil from "./pages/perfil/MiPerfil";
import AIRecipeSearch from "./pages/recetas/AIRecipeSearch";
import Contacto from "./pages/Contacto";

export default function App() {
    return (
        <GoogleOAuthProvider clientId="601935688943-ktb1sb3nfn3r05k7gnnk7d6ifjajtp2s.apps.googleusercontent.com">
            <ApiProvider>
                <SaborifyProvider>
                    <BrowserRouter>
                        <ScrollToTop />
                        <Header />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<InicioSesion />} />
                            <Route path="/sign-up" element={<Registro />} />
                            <Route path="/all-recipes" element={<Recetas />} />
                            <Route path="/recipe-detail" element={<Receta />} />
                            <Route path="/edit-recipe" element={<EditarReceta />} />
                            <Route path="/create-recipe" element={<NuevReceta />} />
                            <Route path="/all-ingredients" element={<Ingredientes />} />
                            <Route path="/ingredient-detail" element={<Ingrediente />} />
                            <Route path="/create-review" element={<CrearReseña />} />
                            <Route path="/my-profile" element={<MiPerfil />} /> 
                            <Route path="/my-recipes" element={<MisRecetas/>} /> 
                            <Route path="/favorite-recipes" element={<FavoritesRecipes />} />
                            <Route path="/ai-recipe-search" element={<AIRecipeSearch />} />
                            <Route path="/contact" element={<Contacto/>} /> 

                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                        <Footer />
                    </BrowserRouter>
                </SaborifyProvider>
            </ApiProvider>
        </GoogleOAuthProvider>
    );
}