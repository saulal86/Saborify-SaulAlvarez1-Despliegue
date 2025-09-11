import { useContext, useRef } from "react";
import {
  Container,
  Typography,
  Card,
  Box,
  useMediaQuery,
  useTheme,
  Divider,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { SaborifyContext } from "../../context/SaborifyProvider";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SetMealIcon from '@mui/icons-material/SetMeal';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RecetaCard from "../../components/RecetaCard";
import PropTypes from "prop-types";

const StyledFeatureCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  height: "100%",
  padding: theme.spacing(2),
  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  background: "linear-gradient(145deg, #ffffff, #fff8f0)",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
    background: "linear-gradient(145deg, #fff6e5, #ffead8)",
  },
}));

const StyledStatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(3),
  height: "100%",
  background: "linear-gradient(135deg, #ff7043 0%, #ff5722 100%)",
  color: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  "&:before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    right: "-50%",
    width: "100%",
    height: "100%",
    background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
    borderRadius: "50%",
  },
  "&:hover": {
    transform: "translateY(-5px) scale(1.02)",
    boxShadow: "0 15px 30px rgba(255, 112, 67, 0.3)",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: "relative",
  display: "inline-block",
  color: "#ff7043",
  fontWeight: 700,
  marginBottom: theme.spacing(3),
  textAlign: "center",
  fontSize: "1.75rem",
  [theme.breakpoints.up('sm')]: {
    fontSize: "2rem",
    marginBottom: theme.spacing(4),
  },
  [theme.breakpoints.up('md')]: {
    fontSize: "2.25rem",
    marginBottom: theme.spacing(5),
  },
  "&:after": {
    content: '""',
    position: "absolute",
    width: "40px",
    height: "3px",
    borderRadius: "2px",
    background: "#ff7043",
    bottom: "-8px",
    left: "50%",
    transform: "translateX(-50%)",
    [theme.breakpoints.up('sm')]: {
      width: "50px",
      height: "4px",
      bottom: "-10px",
    },
    [theme.breakpoints.up('md')]: {
      width: "60px",
      bottom: "-12px",
    },
  },
}));

const SlideWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  height: "100%",
  display: "flex",
  alignItems: "stretch",
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.5),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2),
  },
}));

const ResponsiveContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
  [theme.breakpoints.up('sm')]: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(8),
  },
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(10),
  },
}));

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  margin: `0 ${theme.spacing(8)}`,
  [theme.breakpoints.down('sm')]: {
    margin: `0 ${theme.spacing(6)}`,
  },
  [theme.breakpoints.down('xs')]: {
    margin: `0 ${theme.spacing(4)}`,
  },
}));

export default function HomePage() {
  const { recetasMejorValoradas, recetasMasVistas } = useContext(SaborifyContext);
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("lg"));

  const sliderRef1 = useRef(null);
  const sliderRef2 = useRef(null);

  const NextArrow = ({ onClick }) => (
    <Box
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: '50%',
        right: { xs: '-35px', sm: '-45px', md: '-55px' },
        transform: 'translateY(-50%)',
        zIndex: 2,
        cursor: 'pointer',
        color: '#ff7043',
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '50%',
        width: { xs: 40, sm: 44, md: 48 },
        height: { xs: 40, sm: 44, md: 48 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        border: '2px solid rgba(255, 112, 67, 0.1)',
        '&:hover': {
          bgcolor: 'white',
          boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          color: '#ff5722',
          transform: 'translateY(-50%) scale(1.1)',
          borderColor: 'rgba(255, 112, 67, 0.3)',
        }
      }}
    >
      <ArrowForwardIosIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
    </Box>
  );

  const PrevArrow = ({ onClick }) => (
    <Box
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: '50%',
        left: { xs: '-35px', sm: '-45px', md: '-55px' },
        transform: 'translateY(-50%)',
        zIndex: 2,
        cursor: 'pointer',
        color: '#ff7043',
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '50%',
        width: { xs: 40, sm: 44, md: 48 },
        height: { xs: 40, sm: 44, md: 48 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        border: '2px solid rgba(255, 112, 67, 0.1)',
        '&:hover': {
          bgcolor: 'white',
          boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          color: '#ff5722',
          transform: 'translateY(-50%) scale(1.1)',
          borderColor: 'rgba(255, 112, 67, 0.3)',
        }
      }}
    >
      <ArrowBackIosIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, ml: 0.5 }} />
    </Box>
  );

  const getSlidesToShow = () => {
    if (isXsScreen) return 1;
    if (isSmallScreen) return 2;
    if (isMediumScreen) return 3;
    return 3;
  };

  const slidesToShow = getSlidesToShow();

  const settings = {
    dots: true,
    infinite: recetasMejorValoradas?.length > slidesToShow,
    speed: 700,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplay: recetasMejorValoradas?.length > slidesToShow,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    dotsClass: "slick-dots custom-dots",
    centerMode: false,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  const sliderCustomStyles = {
    "& .slick-slide": {
      padding: { xs: "0 6px", sm: "0 8px", md: "0 12px" },
      boxSizing: "border-box",
      height: "auto"
    },
    "& .slick-track": {
      display: "flex",
      alignItems: "stretch",
      "& .slick-slide": {
        height: "auto",
        "& > div": {
          height: "100%"
        }
      }
    },
    "& .custom-dots": {
      bottom: { xs: -40, sm: -45, md: -50 },
      "& li button:before": {
        fontSize: { xs: 12, sm: 14, md: 16 },
        color: "#ff7043",
        opacity: 0.5,
      },
      "& li.slick-active button:before": {
        opacity: 1,
      }
    },
    mb: { xs: 4, sm: 5, md: 6 },
    mt: { xs: 1, sm: 1.5, md: 2 },
    pb: { xs: 4, sm: 5, md: 6 }
  };

  const renderRecipeCard = (receta) => (
    <SlideWrapper key={receta.id}>
      <RecetaCard receta={receta} />
    </SlideWrapper>
  );

  const statsData = [
    {
      icon: <LocalFireDepartmentIcon sx={{ fontSize: { xs: 35, sm: 40, md: 45 } }} />,
      number: "1,250+",
      label: "Popular Recipes",
      description: "The most cooked by our community"
    },
    {
      icon: <GroupIcon sx={{ fontSize: { xs: 35, sm: 40, md: 45 } }} />,
      number: "15K+",
      label: "Home Chefs",
      description: "Active users sharing experiences"
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: { xs: 35, sm: 40, md: 45 } }} />,
      number: "30 min",
      label: "Average Time",
      description: "Quick recipes for your daily life"
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: { xs: 35, sm: 40, md: 45 } }} />,
      number: "4.8★",
      label: "Average Rating",
      description: "Quality guaranteed by the community"
    }
  ];

  return (
    <ResponsiveContainer maxWidth="xl">
      <Box
        sx={{
          textAlign: "center",
          mb: { xs: 6, sm: 7, md: 8 },
          px: { xs: 1, sm: 2 },
          position: "relative",
          "&:after": {
            content: '""',
            position: "absolute",
            bottom: { xs: -15, sm: -18, md: -20 },
            left: "20%",
            width: "60%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255, 112, 67, 0.5), transparent)",
          }
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 800,
            color: "#ff7043",
            mb: { xs: 1.5, sm: 2, md: 2.5 },
            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem", lg: "3rem" },
            lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 }
          }}
        >
          Welcome to Saborify!
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: "text.secondary",
            maxWidth: { xs: "100%", sm: "600px", md: "800px" },
            mx: "auto",
            lineHeight: { xs: 1.4, sm: 1.5, md: 1.6 },
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem", lg: "1.25rem" },
            px: { xs: 1, sm: 0 }
          }}
        >
          Discover delicious recipes, cooking tips, and much more on your new favorite culinary platform.
        </Typography>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr",
          md: "repeat(2, 1fr)"
        }}
        gap={{ xs: 2, sm: 3, md: 4 }}
        sx={{ mb: { xs: 6, sm: 8, md: 10 } }}
      >
        <Link to="/all-recipes" style={{ textDecoration: "none", height: "100%" }}>
          <StyledFeatureCard>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: { xs: 1.5, sm: 2 },
                color: "#ff7043",
                flexDirection: { xs: "column", sm: "row" },
                textAlign: { xs: "center", sm: "left" }
              }}
            >
              <MenuBookIcon sx={{
                fontSize: { xs: 28, sm: 30, md: 32 },
                mr: { xs: 0, sm: 1.5 },
                mb: { xs: 1, sm: 0 }
              }} />
              <Typography variant="h5" sx={{
                fontWeight: 700,
                fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" }
              }}>
                Detailed Recipes
              </Typography>
            </Box>
            <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: { xs: 1.5, sm: 2 },
                lineHeight: 1.7,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                textAlign: { xs: "center", sm: "left" }
              }}
            >
              Find detailed recipes with all the necessary ingredients and easy-to-follow steps to prepare delicious dishes.
            </Typography>
            <Box sx={{ mt: "auto", textAlign: { xs: "center", sm: "right" } }}>
              <Chip
                label="Explore recipes"
                size={isXsScreen ? "small" : "medium"}
                sx={{
                  bgcolor: "rgba(255, 112, 67, 0.1)",
                  color: "#ff7043",
                  fontWeight: 600,
                  fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                  '&:hover': {
                    bgcolor: "rgba(255, 112, 67, 0.2)",
                  }
                }}
              />
            </Box>
          </StyledFeatureCard>
        </Link>

        <Link to="/all-ingredients" style={{ textDecoration: "none", height: "100%" }} className="tarjeta-info" >
          <StyledFeatureCard>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: { xs: 1.5, sm: 2 },
                color: "#ff7043",
                flexDirection: { xs: "column", sm: "row" },
                textAlign: { xs: "center", sm: "left" }
              }}
            >
              <SetMealIcon sx={{
                fontSize: { xs: 28, sm: 30, md: 32 },
                mr: { xs: 0, sm: 1.5 },
                mb: { xs: 1, sm: 0 }
              }} />
              <Typography variant="h5" sx={{
                fontWeight: 700,
                fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" }
              }}>
                Allergen Filtering
              </Typography>
            </Box>
            <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: { xs: 1.5, sm: 2 },
                lineHeight: 1.7,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                textAlign: { xs: "center", sm: "left" }
              }}
            >
              Filter ingredients by the allergens you want to avoid and find safe recipes tailored to your dietary needs.
            </Typography>
            <Box sx={{ mt: "auto", textAlign: { xs: "center", sm: "right" } }}>
              <Chip
                label="View ingredients"
                size={isXsScreen ? "small" : "medium"}
                sx={{
                  bgcolor: "rgba(255, 112, 67, 0.1)",
                  color: "#ff7043",
                  fontWeight: 600,
                  fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                  '&:hover': {
                    bgcolor: "rgba(255, 112, 67, 0.2)",
                  }
                }}
              />
            </Box>
          </StyledFeatureCard>
        </Link>
      </Box>

      {recetasMejorValoradas && recetasMejorValoradas.length > 0 && (
        <Box sx={{ mb: { xs: 6, sm: 8, md: 10 } }} className="carrusel-recetas">
          <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
            <SectionTitle variant="h4">
              Top Rated Recipes
            </SectionTitle>
          </Box>

          <CarouselContainer>
            <Box sx={sliderCustomStyles}>
              <Slider ref={sliderRef1} {...settings}>
                {recetasMejorValoradas.map(renderRecipeCard)}
              </Slider>
            </Box>
          </CarouselContainer>
        </Box>
      )}

      <Box sx={{ mb: 15 }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 5, md: 6 } }}>
          <SectionTitle variant="h4">
            Our Culinary Community
          </SectionTitle>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: "600px",
              mx: "auto",
              fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
              lineHeight: 1.6,
              px: { xs: 2, sm: 0 }
            }}
          >
            Join thousands of cooking enthusiasts who share, discover, and enjoy every day.
          </Typography>
        </Box>

        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)"
          }}
          gap={{ xs: 2, sm: 3, md: 3 }}
        >
          {statsData.map((stat, index) => (
            <StyledStatsCard key={index}>
              <Box sx={{ mb: 2, position: "relative", zIndex: 1 }}>
                {stat.icon}
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  position: "relative",
                  zIndex: 1
                }}
              >
                {stat.number}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                  position: "relative",
                  zIndex: 1
                }}
              >
                {stat.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                  lineHeight: 1.4,
                  position: "relative",
                  zIndex: 1
                }}
              >
                {stat.description}
              </Typography>
            </StyledStatsCard>
          ))}
        </Box>
      </Box>

      {recetasMasVistas && recetasMasVistas.length > 0 && (
        <Box sx={{ mb: { xs: 4, sm: 5, md: 6 } }} className="carrusel-recetas">
          <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
            <SectionTitle variant="h4">
              Most Viewed Recipes
            </SectionTitle>
          </Box>

          <CarouselContainer>
            <Box sx={sliderCustomStyles}>
              <Slider ref={sliderRef2} {...settings}>
                {recetasMasVistas.map(renderRecipeCard)}
              </Slider>
            </Box>
          </CarouselContainer>
        </Box>
      )}

      <Box
        sx={{
          mt: { xs: 6, sm: 8, md: 10 },
          textAlign: "center",
          p: { xs: 3, sm: 4, md: 5 },
          mx: { xs: 1, sm: 0 },
          borderRadius: { xs: 3, sm: 4 },
          background: "linear-gradient(145deg, #fff3e0, #fff8f0)",
          boxShadow: "0 6px 20px rgba(255, 112, 67, 0.08)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#ff7043",
            mb: { xs: 1.5, sm: 2 },
            fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" }
          }}
        >
          Ready to explore the culinary world?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: { xs: 2, sm: 3 },
            color: "text.secondary",
            maxWidth: { xs: "100%", sm: "600px", md: "700px" },
            mx: "auto",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            lineHeight: { xs: 1.5, sm: 1.6 },
            px: { xs: 1, sm: 0 }
          }}
        >
          Discover thousands of recipes, cooking tips, and culinary tricks that will make your meals exceptional.
        </Typography>
      </Box>
    </ResponsiveContainer>
  );
}

HomePage.propTypes = {
  onClick: PropTypes.func,
};