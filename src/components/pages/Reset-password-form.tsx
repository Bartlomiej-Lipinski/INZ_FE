"use client";

import React, {useState} from 'react';
import {Box, Button, CircularProgress, TextField, Typography} from '@mui/material';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import {useRouter} from "next/navigation";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();

  //TO-DO: Add email validation

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
      try {
          const response = await fetchWithAuth(API_ROUTES.RESET_PASSWORD_REQUEST, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({email}),
          });

          if (response.ok) {
              setIsSubmitted(true);
              setIsLoading(false);
          } else {
              console.error('Failed to Send Reset password:', response.status, response.statusText);
          }
      } catch (error) {
          console.error('Error resetting password:', error);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        mt: 3,
        width: '100%',
        maxWidth: 400,
      }}
    >
      {!isSubmitted ? (
        <>
          <TextField
            type="email"
            value={email}
            onChange={handleEmailChange}
            label="E-mail"
            required
            error={!!emailError}
            helperText={emailError}
            fullWidth
            disabled={isLoading}
            autoComplete="email"
            sx={{
                width: '80%',
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !email}
            sx={{
              mb: 5,
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} thickness={4} sx={{ color: 'white' }} />
            ) : (
              'Wyślij link do resetu hasła'
            )}
          </Button>
        </>
      ) : (
          <><Typography
              sx={{
                  color: '#ecd17a',
                  fontSize: '18px',
                  textAlign: 'center',
                  mb: 5,
                  paddingInline: 3,
                  wordBreak: 'break-word',
              }}
          >
              Link do resetowania hasła został wysłany na podany adres e-mail. Sprawdź swoją skrzynkę pocztową.
          </Typography><Button variant="contained" onClick={() => router.back()}>
              OK
          </Button></>
      )}
    </Box>
  );
}

