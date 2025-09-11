import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { styled } from "@mui/material/styles";
import { useApi } from "../../context/ApiProvider";

import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

const StyledCard = styled(Card)(() => ({
  width: "100%",
  position: "relative",
  overflow: "visible",
  borderRadius: "16px",
  boxShadow: "0 12px 24px rgba(0, 0, 0, 0.08)",
  background: "linear-gradient(140deg, #ffffff 0%, #fff8f0 100%)",
}));

const StyledTextField = styled(TextField)(() => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    transition: "all 0.3s ease",
    "& fieldset": {
      borderColor: "rgba(255, 112, 67, 0.2)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255, 112, 67, 0.4)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#ff7043",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(0, 0, 0, 0.6)",
    "&.Mui-focused": {
      color: "#ff7043",
    },
  },
}));

const StyledButton = styled(Button)(() => ({
  textTransform: "none",
  fontWeight: "600",
  fontSize: "1.05rem",
  padding: "12px 0",
  borderRadius: "12px",
  boxShadow: "0 6px 12px rgba(255, 112, 67, 0.2)",
  background: "linear-gradient(135deg, #ff7043, #ff9800)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 16px rgba(255, 112, 67, 0.3)",
    background: "linear-gradient(135deg, #ff5722, #ff7043)",
    transform: "translateY(-2px)",
  },
}));

const DecorativeShape = styled(Paper)(() => ({
  position: "absolute",
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, rgba(255, 112, 67, 0.1), rgba(255, 152, 0, 0.1))",
  zIndex: 0,
}));

export default function InicioSesion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { iniciarSesion, registroConGoogle } = useApi();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      const data = await registroConGoogle({
        token: credentialResponse.credential,
      });

      localStorage.setItem("token", data.token.split("|")[1]);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/";
    } catch (error) {
      setError(error.message || "Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    setError("No se pudo iniciar sesión con Google");
    console.error("Google Login Failed:", error);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await iniciarSesion({
        email,
        password,
      });

      localStorage.setItem("token", data.token.split("|")[1]);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/";
    } catch (error) {
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        py: 4,
        position: "relative",
      }}
    >
      <DecorativeShape sx={{ top: "10%", right: "-50px" }} elevation={0} />
      <DecorativeShape sx={{ bottom: "15%", left: "-30px" }} elevation={0} />

      <StyledCard>
        <Box
          sx={{
            height: "8px",
            width: "100%",
            background: "linear-gradient(90deg, #ff7043, #ff9800)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        />

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: "#ff5722",
                mb: 1.5,
                letterSpacing: "-0.5px",
              }}
            >
              Welcome back
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: "85%", mx: "auto" }}
            >
              Log in to discover new recipes and flavors
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
            <StyledTextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ?
                        <VisibilityOffOutlinedIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} /> :
                        <VisibilityOutlinedIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                      }
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <StyledButton
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
            >
              {loading ? "Processing..." : "Log In"}
            </StyledButton>

            <Box sx={{ position: "relative", mb: 3, mt: 3 }}>
              <Divider sx={{ my: 2.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    px: 2,
                    color: "text.secondary",
                    fontWeight: 500
                  }}
                >
                  Or log in with
                </Typography>
              </Divider>

              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  width={isMobile ? "100%" : "220px"}
                  theme="outline"
                  shape="pill"
                  useOneTap
                />
              </Box>
            </Box>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3.5 }}>
            Don't have an account?{" "}
            <Link
              to="/sign-up"
              style={{
                color: "#ff7043",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Sign up here
            </Link>
          </Typography>
        </CardContent>
      </StyledCard>
    </Container>
  );
}