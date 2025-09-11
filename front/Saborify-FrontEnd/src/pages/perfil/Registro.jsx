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
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import { useApi } from "../../context/ApiProvider";

import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

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

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { registrarUsuario, registroConGoogle } = useApi();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  async function handleRegistro() {
    if (contraseña !== confirmarContraseña) {
      setError("Passwords do not match");
      return;
    }

    if (!nombre || !email || !userName || !contraseña) {
      setError("All fields are required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await registrarUsuario({
        name: nombre,
        email,
        userName,
        password: contraseña,
        role: "user",
      });

      localStorage.setItem("token", data.token.split("|")[1]);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/";
    } catch (error) {
      setError(error.message || "Registration error");
    } finally {
      setLoading(false);
    }
  }

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
      setError(error.message || "Error registering with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    setError("Could not sign in with Google");
    console.error("Google Registration Failed:", error);
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
              Create Account
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: "85%", mx: "auto" }}
            >
              Sign up to enjoy all the features of Saborify
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" sx={{ mt: 2 }}>
            <StyledTextField
              fullWidth
              label="Full Name"
              variant="outlined"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineOutlinedIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              fullWidth
              label="Username"
              variant="outlined"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleOutlinedIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
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

            <StyledTextField
              fullWidth
              label="Confirm Password"
              variant="outlined"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmarContraseña}
              onChange={(e) => setConfirmarContraseña(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ?
                        <VisibilityOffOutlinedIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} /> :
                        <VisibilityOutlinedIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                      }
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ position: "relative", mb: 3, mt: 1.5 }}>
              <Divider sx={{ my: 2.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    px: 2,
                    color: "text.secondary",
                    fontWeight: 500
                  }}
                >
                  Or sign up with
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

            <StyledButton
              fullWidth
              variant="contained"
              onClick={handleRegistro}
              disabled={loading}
            >
              {loading ? "Processing..." : "Create account"}
            </StyledButton>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3.5 }}>
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              style={{
                color: "#ff7043",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Log in here
            </Link>
          </Typography>
        </CardContent>
      </StyledCard>
    </Container>
  );
}