import { useState, useEffect, useContext, useRef } from "react";
import { SaborifyContext } from "../context/SaborifyProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Drawer,
  Avatar,
  Collapse,
  Divider,
  Container,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon
} from "@mui/material";
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  RestaurantMenu as RestaurantIcon,
  Kitchen as KitchenIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  ExpandMore as ExpandMoreIcon,
  AccountCircle as AccountCircleIcon,
  FavoriteBorder as FavoriteIcon,
  CollectionsBookmark as MyRecipesIcon,
  KeyboardArrowDown as ArrowDownIcon
} from "@mui/icons-material";
import Logo from "../assets/logo/LogoSaborify.png";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { recetas, ingredientes, setReceta, setIngrediente, setAlergenoSeleccionado } = useContext(SaborifyContext);

  const [placeholder, setPlaceholder] = useState("Buscar recetas o ingredientes");
  const [query, setQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const userMenuOpen = Boolean(userMenuAnchor);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (location.pathname.includes("/all-ingredients") || location.pathname.includes("/ingredient-detail")) {
      setPlaceholder("Search ingredients...");
    } else if (location.pathname.includes("/all-recipes") || location.pathname.includes("/recipe-detail")) {
      setPlaceholder("Search recipes...");
    } else {
      setPlaceholder("Search recipes or ingredients...");
    }
  }, [location.pathname]);

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setQuery(searchTerm);

    if (searchTerm.length > 1) {
      if (location.pathname.includes("/all-recipes") || location.pathname.includes("/recipe-detail")) {
        setFilteredResults(recetas.filter(receta => receta.nombre.toLowerCase().includes(searchTerm)));
      } else if (location.pathname.includes("/all-ingredients") || location.pathname.includes("/ingredient-detail")) {
        setFilteredResults(ingredientes.filter(ingrediente => ingrediente.nombre.toLowerCase().includes(searchTerm)));
      } else {
        setFilteredResults([]);
      }
    } else {
      setFilteredResults([]);
    }
  };

  const handleSelectRecipe = (receta) => {
    setReceta(receta);
    navigate(`/recipe-detail`);
    setQuery("");
    setFilteredResults([]);
    if (isMobile) setShowSearch(false);
  };

  const handleSelectIngredient = (ingrediente) => {
    setIngrediente(ingrediente);
    setAlergenoSeleccionado(null);
    navigate(`/ingredient-detail`);
    setQuery("");
    setFilteredResults([]);
    if (isMobile) setShowSearch(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("recetasFavs");
    setUser(null);
    setMenuOpen(false);
    handleCloseUserMenu();
    window.location.href = "/";
  };

  const handleOpenUserMenu = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleUserMenuOption = (path) => {
    navigate(path);
    handleCloseUserMenu();
    setMenuOpen(false);
  };

  const mostrarBuscador = [
    "/all-recipes",
    "/recipe-detail",
    "/all-ingredients",
    "/ingredient-detail"
  ].some(path => location.pathname.includes(path));

  const isActive = (path) => {
    return location.pathname.includes(path) ? true : false;
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    setSearchExpanded(!searchExpanded);
    if (showSearch) {
      setQuery("");
      setFilteredResults([]);
    }
  };

  const navItems = [
    {
      text: "Recipes",
      icon: <RestaurantIcon />,
      path: "/all-recipes"
    },
    {
      text: "Ingredients",
      icon: <KitchenIcon />,
      path: "/all-ingredients"
    }
  ];

  const userMenuItems = [
    {
      text: "See my profile",
      icon: <AccountCircleIcon />,
      path: "/my-profile"
    },
    {
      text: "My recipes",
      icon: <MyRecipesIcon />,
      path: "/my-recipes"
    },
    {
      text: "Favorite recipes",
      icon: <FavoriteIcon />,
      path: "/favorite-recipes"
    }
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: "#ffffff", 
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        padding: { xs: "0.5rem 0", md: "0.7rem 0" }
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img src={Logo} alt="LogoSaborify" style={{ width: isMobile ? "160px" : "200px" }} />
            </Link>
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 4, mx: 4, flexGrow: 1 }}>
              {navItems.map((item) => (
                <Link 
                  to={item.path} 
                  key={item.text}
                  style={{ textDecoration: "none" }}
                >
                  <Button 
                    startIcon={item.icon}
                    sx={{ 
                      fontSize: "1rem", 
                      fontWeight: "600", 
                      color: isActive(item.path) ? "#ff5722" : "#666",
                      textTransform: "none", 
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': { 
                        backgroundColor: "rgba(255, 112, 67, 0.08)"
                      },
                      '&::after': isActive(item.path) ? {
                        content: '""',
                        position: 'absolute',
                        width: '40%',
                        height: '3px',
                        backgroundColor: '#ff5722',
                        borderRadius: '3px',
                        bottom: '6px',
                        left: '30%'
                      } : {}
                    }}
                  >
                    {item.text}
                  </Button>
                </Link>
              ))}
            </Box>
          )}

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {mostrarBuscador && (
                <Box sx={{ position: "relative", minWidth: "260px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "30px",
                      px: 2,
                      py: 0.75,
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #eeeeee",
                      transition: "all 0.3s ease",
                      '&:focus-within': {
                        boxShadow: "0 0 0 2px rgba(255, 112, 67, 0.2)",
                        backgroundColor: "#ffffff"
                      }
                    }}
                  >
                    <SearchIcon sx={{ color: "#ff7043" }} />
                    <InputBase
                      placeholder={placeholder}
                      sx={{ ml: 1.5, flex: 1, fontSize: "0.95rem" }}
                      value={query}
                      onChange={handleSearch}
                    />
                    {query && (
                      <IconButton 
                        size="small" 
                        onClick={() => setQuery('')}
                        sx={{ p: 0.5 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Paper>

                  {filteredResults.length > 0 && (
                    <Paper 
                      elevation={3}
                      sx={{ 
                        position: "absolute", 
                        width: "100%", 
                        mt: 0.5, 
                        maxHeight: "350px", 
                        overflowY: "auto", 
                        zIndex: 10,
                        borderRadius: 2
                      }}
                    >
                      <List dense>
                        {filteredResults.map((item) => (
                          <ListItem key={item.id} disablePadding>
                            <ListItemButton 
                              onClick={() => {
                                location.pathname.includes("/all-recipes") || location.pathname.includes("/recipe-detail")
                                  ? handleSelectRecipe(item)
                                  : handleSelectIngredient(item);
                              }}
                              sx={{
                                py: 1.25,
                                px: 2,
                                '&:hover': {
                                  backgroundColor: "rgba(255, 112, 67, 0.08)"
                                }
                              }}
                            >
                              <ListItemText 
                                primary={item.nombre}
                                primaryTypographyProps={{
                                  style: {
                                    fontWeight: 500,
                                    fontSize: '0.95rem'
                                  }
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Box>
              )}

              {user ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    onClick={handleOpenUserMenu}
                    sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 1.5,
                      textTransform: "none",
                      py: 0.5,
                      px: 1,
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: "rgba(255, 112, 67, 0.08)"
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: "#ff7043",
                        width: 38,
                        height: 38,
                        fontSize: "1rem",
                        fontWeight: "bold"
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant="body2" sx={{ color: "#555", fontWeight: 600, lineHeight: 1.2 }}>
                        {user.name}
                      </Typography>
                    </Box>
                    <ArrowDownIcon 
                      sx={{ 
                        color: "#666", 
                        fontSize: "1.2rem", 
                        transition: "transform 0.3s ease",
                        transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)"
                      }} 
                    />
                  </Button>
                  
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={userMenuOpen}
                    onClose={handleCloseUserMenu}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        width: 220,
                        borderRadius: 2,
                        overflow: 'visible',
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    {userMenuItems.map((item) => (
                      <MenuItem 
                        key={item.text} 
                        onClick={() => handleUserMenuOption(item.path)}
                        sx={{ 
                          py: 1.25,
                          '&:hover': {
                            backgroundColor: "rgba(255, 112, 67, 0.08)"
                          }
                        }}
                      >
                        <ListItemIcon sx={{ color: "#ff7043", minWidth: "32px" }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text}
                          primaryTypographyProps={{
                            style: {
                              fontWeight: 500,
                              fontSize: '0.95rem'
                            }
                          }}
                        />
                      </MenuItem>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{ 
                        py: 1.25,
                        '&:hover': {
                          backgroundColor: "rgba(255, 112, 67, 0.08)"
                        }
                      }}
                    >
                      <ListItemIcon sx={{ color: "#ff7043", minWidth: "32px" }}>
                        <LogoutIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Sign Out"
                        primaryTypographyProps={{
                          style: {
                            fontWeight: 500,
                            fontSize: '0.95rem'
                          }
                        }}
                      />
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <Button
                    variant="contained"
                    startIcon={<LoginIcon />}
                    sx={{
                      background: "linear-gradient(45deg, #ff7043 30%, #ff9800 90%)",
                      color: "white",
                      fontWeight: "600",
                      py: 1,
                      px: 2.5,
                      borderRadius: "30px",
                      textTransform: "none",
                      boxShadow: "0 3px 12px rgba(255, 112, 67, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #ff5722 30%, #ff7043 90%)",
                        boxShadow: "0 5px 15px rgba(255, 112, 67, 0.4)",
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
            </Box>
          )}

          {isMobile && (
            <Box sx={{ display: "flex", gap: 1 }}>
              {mostrarBuscador && (
                <IconButton 
                  size="large" 
                  onClick={toggleSearch}
                  sx={{ 
                    color: showSearch ? "#ff5722" : "#666"
                  }}
                >
                  {showSearch ? <CloseIcon /> : <SearchIcon />}
                </IconButton>
              )}
              
              <IconButton
                size="large"
                edge="end"
                onClick={() => setMenuOpen(true)}
                sx={{ color: "#666" }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {isMobile && (
            <Collapse in={showSearch} sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1100 }}>
              <Box sx={{ 
                backgroundColor: "#fff", 
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                p: 2
              }}>
                <Paper
                  elevation={0}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "8px",
                    p: 1,
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #eeeeee"
                  }}
                >
                  <SearchIcon sx={{ color: "#ff7043", ml: 1 }} />
                  <InputBase
                    placeholder={placeholder}
                    sx={{ ml: 1, flex: 1 }}
                    value={query}
                    onChange={handleSearch}
                    autoFocus
                  />
                  {query && (
                    <IconButton 
                      size="small" 
                      onClick={() => setQuery('')}
                      sx={{ p: 0.5 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Paper>

                {filteredResults.length > 0 && (
                  <Paper 
                    elevation={0}
                    sx={{ 
                      width: "100%", 
                      mt: 1,
                      maxHeight: "250px", 
                      overflowY: "auto"
                    }}
                  >
                    <List dense>
                      {filteredResults.map((item) => (
                        <ListItem key={item.id} disablePadding>
                          <ListItemButton 
                            onClick={() => {
                              location.pathname.includes("/all-recipes") || location.pathname.includes("/recipe-detail")
                                ? handleSelectRecipe(item)
                                : handleSelectIngredient(item);
                            }}
                          >
                            <ListItemText primary={item.nombre} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
            </Collapse>
          )}
        </Toolbar>
      </Container>

      <Drawer
        anchor="right"
        open={isMobile && menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{
          sx: {
            width: "80%",
            maxWidth: "320px",
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            px: 2
          }
        }}
      >
        <Box sx={{ pt: 3, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ff7043" }}>
            Menú
          </Typography>
          <IconButton onClick={() => setMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {user && (
          <Box sx={{ mb: 3, display: "flex", alignItems: "center", p: 1.5, backgroundColor: "rgba(255, 112, 67, 0.08)", borderRadius: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: "#ff7043",
                width: 40,
                height: 40,
                fontSize: "1.1rem"
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "600", color: "#333" }}>
                {user.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Usuario
              </Typography>
            </Box>
          </Box>
        )}

        <List sx={{ p: 0 }}>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: isActive(item.path) ? "rgba(255, 112, 67, 0.08)" : "transparent"
                }}
              >
                <Box sx={{ 
                  color: isActive(item.path) ? "#ff5722" : "#666",
                  mr: 2
                }}>
                  {item.icon}
                </Box>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    style: {
                      fontWeight: isActive(item.path) ? 600 : 500,
                      color: isActive(item.path) ? "#ff5722" : "#444"
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          {user && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ color: "#666", px: 1.5, mb: 1 }}>
                Mi cuenta
              </Typography>
              
              {userMenuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => handleUserMenuOption(item.path)}
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: isActive(item.path) ? "rgba(255, 112, 67, 0.08)" : "transparent"
                    }}
                  >
                    <Box sx={{ 
                      color: isActive(item.path) ? "#ff5722" : "#666",
                      mr: 2
                    }}>
                      {item.icon}
                    </Box>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        style: {
                          fontWeight: isActive(item.path) ? 600 : 500,
                          color: isActive(item.path) ? "#ff5722" : "#444"
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </>
          )}
        </List>

        <Box sx={{ mt: 'auto', mb: 3, pt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          {user ? (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                color: "#ff7043",
                borderColor: "#ff7043",
                textTransform: "none",
                borderRadius: 8,
                p: 1.5,
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#ff5722",
                  backgroundColor: "rgba(255, 112, 67, 0.04)"
                }
              }}
            >
              Cerrar sesión
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              component={Link}
              to="/login"
              startIcon={<LoginIcon />}
              onClick={() => setMenuOpen(false)}
              sx={{
                background: "linear-gradient(45deg, #ff7043 30%, #ff9800 90%)",
                color: "white",
                textTransform: "none",
                borderRadius: 8,
                p: 1.5,
                fontWeight: 600,
                boxShadow: "0 4px 10px rgba(255, 112, 67, 0.3)",
                "&:hover": {
                  background: "linear-gradient(45deg, #ff5722 30%, #ff7043 90%)",
                }
              }}
            >
              Iniciar Sesión
            </Button>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
}