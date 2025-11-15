 "use client";

import { IMAGES } from "@/lib/constants";
import { useState, useEffect } from "react";
import Image from "next/image";
import PasswordInput from "@/components/common/Password-input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  Box,
  TextField,
  Typography, 
  CircularProgress,
  IconButton,
  Button
} from "@mui/material";
import {
  validatePassword,
  validateEmail,
  validateRequiredInput,
  validateBirthDate
} from "@/lib/zod-schemas";
import { ChevronLeft } from "lucide-react";

export default function SignUpForm() {
  const router = useRouter();
  const { register, isLoading, setErrorMessage, error } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errors, setErrors] = useState<{
    email: string;
    name: string;
    surname: string;
    birthDate: string;
    password: string;
    repeatPassword: string;
  }>({
    email: "",
    name: "",
    surname: "",
    birthDate: "",
    password: "",
    repeatPassword: ""
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setErrors(prev => ({ ...prev, email: validateEmail(value) }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setErrors(prev => ({ ...prev, name: validateRequiredInput(value, "Podaj imię") }));
  };

  const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSurname(value);
    setErrors(prev => ({ ...prev, surname: validateRequiredInput(value, "Podaj nazwisko") }));
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthDate(value);
    setErrors(prev => ({ ...prev, birthDate: validateBirthDate(value) }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setErrors(prev => ({ ...prev, password: validatePassword(value) }));

    if (repeatPassword && value !== repeatPassword) {
      setErrors(prev => ({ ...prev, repeatPassword: "Hasła muszą być takie same" }));
    } else if (repeatPassword && value === repeatPassword) {
      setErrors(prev => ({ ...prev, repeatPassword: "" }));
    }
  };

  const handleRepeatPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepeatPassword(value);
    if (value !== password) {
      setErrors(prev => ({ ...prev, repeatPassword: "Hasła muszą być takie same" }));
    } else {
      setErrors(prev => ({ ...prev, repeatPassword: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const hasErrors = Object.values(errors).some(err => err !== "");
    if (hasErrors) {
      setErrorMessage("Popraw błędy!");
      return;
    }

    setErrorMessage("");

    try {
      const response = await register({
        email,
        name,
        surname,
        username: name.trim() + surname.trim(),
        birthDate,
        password
      });

      if (response && (response.success !== false)) {
        console.log("Register successful, response:", response);
        router.push("/");
      } else {
        if (response?.message === "Email already exists.") {
          setErrors(prev => ({ ...prev, email: "Ten adres e-mail jest już zajęty" }));
        }
      }
    } catch (error: unknown) {
      console.log("Register error:", error);
    }
  };

  useEffect(() => {
    const hasErrors = Object.values(errors).some(err => err !== "");
    if (!hasErrors && error) {
      setErrorMessage("");
    }
  }, [errors, error, setErrorMessage]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "100vh",
        position: "relative"
      }}
    >

        <IconButton
          component="a"
          aria-label="back"
          onClick={() => router.back()}
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            color: "#ffffff",
            bgcolor: "transparent",
            "&:hover": { bgcolor: "rgba(255,255,255,0.04)" }
          }}
        >
          <ChevronLeft size={20} />
        </IconButton>


      <Image
        src={IMAGES.MATES_LOGO}
        alt="Logo"
        width={150}
        height={130}
        priority
        style={{ marginTop: 30, marginBottom: 40 }}
      />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          width: "100%",
          maxWidth: 290,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <TextField
          type="email"
          value={email}
          onChange={handleEmailChange}
          label="E-mail"
          required
          error={!!errors.email}
          helperText={errors.email}
          disabled={isLoading}
          fullWidth
        />

        <TextField
          type="text"
          value={name}
          onChange={handleNameChange}
          label="Imię"
          required
          error={!!errors.name}
          helperText={errors.name}
          disabled={isLoading}
          fullWidth
        />

        <TextField
          type="text"
          value={surname}
          onChange={handleSurnameChange}
          label="Nazwisko"
          required
          error={!!errors.surname}
          helperText={errors.surname}
          disabled={isLoading}
          fullWidth
        />

        <TextField
          type="date"
          value={birthDate}
          onChange={handleBirthDateChange}
          label="Data urodzenia"
          required
          error={!!errors.birthDate}
          helperText={errors.birthDate}
          disabled={isLoading}
          fullWidth
          sx={{
            '& input[type="date"]::-webkit-calendar-picker-indicator': {
              filter: "invert(1)",
              opacity: 0.3,
              marginRight: "-18px",
              cursor: "pointer"
            }
          }}
        />

        <PasswordInput
          value={password}
          onChange={handlePasswordChange}
          error={errors.password}
          required
          label="Hasło"
          disabled={isLoading}
        />

        <PasswordInput
          value={repeatPassword}
          onChange={handleRepeatPasswordChange}
          error={errors.repeatPassword}
          required
          label="Powtórz hasło"
          disabled={isLoading}
        />

        {error && (
          <Typography
            sx={{
              color: "error.main",
              fontSize: "14px",
              textAlign: "center",
              mt: -1,
              mb: -1
            }}
          >
            {error}
          </Typography>
        )}

                <Button
                    type="submit"
                    variant="contained"
                    sx={{  mb: 5 }}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <CircularProgress size={20} thickness={4} sx={{ color: 'white' }} />
                    ) : (
                        "Potwierdź"
                    )}
                </Button>
            </Box>
        </Box>
    );
}