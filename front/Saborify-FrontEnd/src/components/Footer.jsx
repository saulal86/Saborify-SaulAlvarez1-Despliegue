import { useState, useEffect } from "react";
import { Box, Typography, IconButton, Container, Grid, Divider, useMediaQuery, useTheme } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn, KeyboardArrowUp as ArrowUpIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import Logo from "../assets/logo/LogoSaborify.png";

export default function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (window.pageYOffset > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box 
      component="footer" 
      sx={{
        bgcolor: "#ffffff",
        color: "#555",
        pt: { xs: 6, md: 8 },
        pb: { xs: 4, md: 4 },
        position: "relative",
        borderTop: "1px solid rgba(0, 0, 0, 0.06)",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} justifyContent="space-between" sx={{ mb: 4 }}>
          <Grid item xs={12} md={4} sx={{ mb: { xs: 2, md: 0 } }}>
            <Link to="/" style={{ display: 'inline-block' }}>
              <img src={Logo} alt="LogoSaborify" style={{ width: isMobile ? "180px" : "220px" }} />
            </Link>
            <Typography variant="body2" sx={{ mt: 2, color: "#666", maxWidth: "90%" }}>
              Your culinary destination to discover flavors, recipes, and ingredients that will transform your cooking experience.
            </Typography>
            
            <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
              <IconButton 
                href="https://facebook.com" 
                target="_blank"
                sx={{ 
                  color: "#fff", 
                  backgroundColor: "#ff7043",
                  width: 36,
                  height: 36,
                  '&:hover': {
                    backgroundColor: "#ff5722",
                    transform: "translateY(-3px)",
                    boxShadow: "0 4px 8px rgba(255, 112, 67, 0.4)",
                  },
                  transition: "all 0.3s ease"
                }}
              >
                <Facebook fontSize="small" />
              </IconButton>
              
              <IconButton 
                href="https://twitter.com" 
                target="_blank"
                sx={{ 
                  color: "#fff", 
                  backgroundColor: "#ff7043",
                  width: 36,
                  height: 36,
                  '&:hover': {
                    backgroundColor: "#ff5722",
                    transform: "translateY(-3px)",
                    boxShadow: "0 4px 8px rgba(255, 112, 67, 0.4)",
                  },
                  transition: "all 0.3s ease"
                }}
              >
                <Twitter fontSize="small" />
              </IconButton>
              
              <IconButton 
                href="https://instagram.com" 
                target="_blank"
                sx={{ 
                  color: "#fff", 
                  backgroundColor: "#ff7043",
                  width: 36,
                  height: 36,
                  '&:hover': {
                    backgroundColor: "#ff5722",
                    transform: "translateY(-3px)",
                    boxShadow: "0 4px 8px rgba(255, 112, 67, 0.4)",
                  },
                  transition: "all 0.3s ease"
                }}
              >
                <Instagram fontSize="small" />
              </IconButton>
              
              <IconButton 
                href="https://linkedin.com" 
                target="_blank"
                sx={{ 
                  color: "#fff", 
                  backgroundColor: "#ff7043",
                  width: 36,
                  height: 36,
                  '&:hover': {
                    backgroundColor: "#ff5722",
                    transform: "translateY(-3px)",
                    boxShadow: "0 4px 8px rgba(255, 112, 67, 0.4)",
                  },
                  transition: "all 0.3s ease"
                }}
              >
                <LinkedIn fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: "#333", 
                fontWeight: "600", 
                fontSize: "1.1rem",
                mb: 2.5,
                position: "relative",
                "&:after": {
                  content: '""',
                  position: "absolute",
                  width: "40px",
                  height: "3px",
                  backgroundColor: "#ff7043",
                  bottom: "-8px",
                  left: "0",
                  borderRadius: "3px"
                }
              }}
            >
              Sections
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link 
                to="/all-recipes" 
                style={{ 
                  color: "#666", 
                  textDecoration: "none", 
                  display: "flex", 
                  alignItems: "center",
                  fontSize: "0.95rem",
                  transition: "all 0.2s ease"
                }}
                className="footer-link"
                sx={{
                  '&:hover': {
                    color: "#ff5722",
                    transform: "translateX(4px)"
                  }
                }}
              >
                Recipes
              </Link>
              
              <Link 
                to="/all-ingredients" 
                style={{ 
                  color: "#666", 
                  textDecoration: "none", 
                  display: "flex", 
                  alignItems: "center",
                  fontSize: "0.95rem",
                  transition: "all 0.2s ease"
                }}
                className="footer-link"
                sx={{
                  '&:hover': {
                    color: "#ff5722",
                    transform: "translateX(4px)"
                  }
                }}
              >
                Ingredients
              </Link>
              
              <Link 
                to="/contact" 
                style={{ 
                  color: "#666", 
                  textDecoration: "none", 
                  display: "flex", 
                  alignItems: "center",
                  fontSize: "0.95rem",
                  transition: "all 0.2s ease"
                }}
                className="footer-link"
                sx={{
                  '&:hover': {
                    color: "#ff5722",
                    transform: "translateX(4px)"
                  }
                }}
              >
                Contact
              </Link>
            </Box>
          </Grid>
          
        </Grid>
        
        <Divider sx={{ my: 4, borderColor: "rgba(0,0,0,0.08)" }} />
        
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 0 }
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: "#888",
              textAlign: { xs: "center", md: "left" } 
            }}
          >
            © {new Date().getFullYear()} Saborify. All rights reserved.
          </Typography>
          
          <Box 
            sx={{ 
              display: "flex", 
              gap: 3,
              justifyContent: "center" 
            }}
          >
            <Link 
              to="/privacy-policy" 
              style={{ 
                color: "#888", 
                textDecoration: "none",
                fontSize: "0.85rem",
                transition: "color 0.2s"
              }}
              sx={{ '&:hover': { color: "#ff5722" } }}
            >
              Privacy
            </Link>
            
            <Link 
              to="/terms" 
              style={{ 
                color: "#888", 
                textDecoration: "none",
                fontSize: "0.85rem",
                transition: "color 0.2s"
              }}
              sx={{ '&:hover': { color: "#ff5722" } }}
            >
              Terms
            </Link>
            
            <Link 
              to="/cookies" 
              style={{ 
                color: "#888", 
                textDecoration: "none",
                fontSize: "0.85rem",
                transition: "color 0.2s"
              }}
              sx={{ '&:hover': { color: "#ff5722" } }}
            >
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
      
      {showScrollTop && (
        <IconButton
          onClick={scrollToTop}
          sx={{
            position: 'absolute',
            right: 20,
            top: -25,
            backgroundColor: '#ff7043',
            color: '#fff',
            width: 50,
            height: 50,
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            '&:hover': {
              backgroundColor: '#ff5722',
            },
            transition: 'all 0.3s ease'
          }}
        >
          <ArrowUpIcon />
        </IconButton>
      )}
    </Box>
  );
}