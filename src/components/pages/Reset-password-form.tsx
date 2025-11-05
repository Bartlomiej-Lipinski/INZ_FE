"use client";

import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField,
  Typography
} from '@mui/material';
import LoadingSpinner from '@/components/common/Loading-spinner';

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  //TO-DO: Add email validation
 
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
  };

  //TO-DO: Replace with actual API call
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsLoading(false);

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
            {isLoading ? <LoadingSpinner /> : 'Wyślij link do resetu hasła'}
          </Button>
        </>
      ) : (
        <Typography
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
        </Typography>
      )}
    </Box>
  );
}

