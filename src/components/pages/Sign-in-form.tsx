"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button as MuiButton } from '@mui/material';
import { 
  Stack, 
  Divider, 
  TextField, 
  Box, 
  Typography, 
  Link 
} from '@mui/material';
import Image from "next/image";
import { IMAGES, API_ENDPOINTS } from "@/lib/constants";
import PasswordInput from "@/components/common/Password-input";
import LoadingSpinner from "@/components/common/Loading-spinner";



export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  // HANDLERS
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: email.trim(),
          Password: password
        }),
        credentials: 'include'
      });


      if (response.ok) {
        const loginResponse = await response.json(); 
        console.log('Backend response:', loginResponse);
        
        // Sprawdź czy odpowiedź ma strukturę ApiResponse
        const userId = loginResponse.data;
        console.log('User ID:', userId);
        
        router.push('/verification');
        return;
      } else if (response.status === 401 || response.status === 403) {
        setError("Nieprawidłowy e-mail lub hasło");
      } else {
        setError("Wystąpił błąd podczas logowania. Spróbuj ponownie.");
      }

    } catch (error) {
      console.error('Błąd logowania:', error);
      setError("Wystąpił błąd połączenia");
    } finally {
      setIsLoading(false);
    }
  };


  //RENDER
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: 300,
          alignItems: 'center',
          justifyContent: 'center',
          gap:0.5
        }}
      >
        <Image src={IMAGES.MATES_LOGO} alt="Logo" width={220} height={200} style={{ marginTop: 10}} />
        
        <TextField
          type="email"
          value={email}
          onChange={handleEmailChange}
          label="E-mail"
          autoComplete="email"
          required
          disabled={isLoading}
          fullWidth
          sx={{ mt: 3, mb: 3 }}
        />

        <PasswordInput
          value={password}
          onChange={handlePasswordChange}
          required
          label="Hasło"
          disabled={isLoading}
          sx={{ width: '100%' }}
        />

        <Stack
          direction="row"
          sx={{ mt: 2, mb: 1 }}
          divider={<Divider orientation="vertical" flexItem />}
          spacing={1}
        >
          <Link
            component="button"
            type="button"
            onClick={() => alert('Funkcja resetowania hasła jeszcze nie jest dostępna. (SignInForm.tsx)')}
            disabled={isLoading}
            sx={{
              color: 'text.secondary',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              '&:disabled': {
                opacity: 0.5,
                cursor: 'not-allowed',
              },
            }}
          >
            Zapomniałeś hasła?
          </Link>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Link
              component="button"
              type="button"
              onClick={() => router.push('/sign-up')}
              disabled={isLoading}
              sx={{
                color: 'text.secondary',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                '&:disabled': {
                  opacity: 0.5,
                  cursor: 'not-allowed',
                },
              }}
            >
              Rejestracja
            </Link>
            <Typography sx={{ color: 'text.secondary', fontSize: '18px' }}>
              {'\u2B60'}
            </Typography>
          </Stack>
        </Stack>

        {error && (
          <Typography
            sx={{
              color: 'error.main',
              fontSize: '14px',
              textAlign: 'center',
              mt: 1,
            }}
          >
            {error}
          </Typography>
        )}

        <MuiButton
          type="submit"
          variant="contained"
          sx={{ mt: 1, mb: 5 }}
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner /> : "Zaloguj się"}
        </MuiButton>
      </Box>
    </Box>
  );
} 