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
  Link, 
  CircularProgress, 
} from '@mui/material';
import Image from "next/image";
import { IMAGES } from "@/lib/constants";
import PasswordInput from "@/components/common/Password-input";
import { useAuth } from "@/hooks/use-auth";



export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login, isLoading: hookIsLoading, error, setErrorMessage } = useAuth();

  // HANDLERS
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setErrorMessage("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (error) setErrorMessage("");

    try {
      const response = await login({
        email,
        password
      });

        if (response.success && response.data === 'Verification code sent to your email') {
            localStorage.setItem("pendingVerificationEmail", email);
            router.push('/verification');
        }else if(response.success) {
            router.push('/');
        }
      
    } catch (error: unknown) {
      console.log('Login error:', error);
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
        <Image 
        src={IMAGES.MATES_LOGO} 
        alt="Logo" 
        width={220} 
        height={200} 
        priority 
        style={{ marginTop: 10, marginBottom: 20 }} />
        
      {/* Email */}
        <TextField
          type="email"
          value={email}
          onChange={handleEmailChange}
          label="E-mail"
          autoComplete="email"
          required
          disabled={hookIsLoading}
          fullWidth
          sx={{ mt: 3, mb: 3 }}
        />


        {/* Password */}
        <PasswordInput
          value={password}
          onChange={handlePasswordChange}
          required
          label="Hasło"
          disabled={hookIsLoading}
          sx={{ width: '100%' }}
        />


        {/* Forgot password and register */}
        <Stack
          direction="row"
          sx={{ mt: 2, mb: 1 }}
          divider={<Divider orientation="vertical" flexItem />}
          spacing={1}
        >
          <Link
            component="button"
            type="button"
            onClick={() => router.push('/reset')}
            disabled={hookIsLoading}
          >
            Zapomniałeś hasła?
          </Link>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Link
              component="button"
              type="button"
              onClick={() => router.push('/sign-up')}
              disabled={hookIsLoading}
            >
              Rejestracja
            </Link>
            <Typography sx={{ color: 'text.secondary', fontSize: '18px' }}>
              {'\u2B60'}
            </Typography>
          </Stack>
        </Stack>


        {/* Error message */}
        {error && (
          <Typography
            sx={{
              color: 'error.main',
              fontSize: '14px',
              textAlign: 'center',
              mb: 1,
            }}
          >
            {error}
          </Typography>
        )}

        <MuiButton
          type="submit"
          variant="contained"
          sx={{ mt: 1, mb: 5 }}
          disabled={hookIsLoading}
        >
          {hookIsLoading ? (
            <CircularProgress size={20} thickness={4} sx={{ color: 'white' }} />
          ) : (
            "Zaloguj się"
          )}
        </MuiButton>
      </Box>
    </Box>
  );
} 