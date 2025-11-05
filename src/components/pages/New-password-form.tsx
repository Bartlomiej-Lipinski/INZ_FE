"use client";

import { useState } from 'react';
import { 
  Box, 
  Button, 
} from '@mui/material';
import PasswordInput from '@/components/common/Password-input';
import LoadingSpinner from '@/components/common/Loading-spinner';
import { validatePassword } from '@/lib/zod-schemas';

export default function NewPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [repeatPasswordError, setRepeatPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    
    setNewPasswordError(validatePassword(value));
    if (repeatPassword && value !== repeatPassword) {
      setRepeatPasswordError("Hasła muszą być takie same");
    } else if (repeatPassword && value === repeatPassword) {
      setRepeatPasswordError("");
    }
  };

  const handleRepeatPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepeatPassword(value);
    
    if (value !== newPassword) {
      setRepeatPasswordError("Hasła muszą być takie same");
    } else {
      setRepeatPasswordError("");
    }
  };

  //TO-DO: Replace with actual API call
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPasswordError || repeatPasswordError) {
         return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
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
        gap: 4,
        mt: 3,
        width: '100%',
        maxWidth: 400,
      }}
    >
        <>
          <PasswordInput
            value={newPassword}
            onChange={handleNewPasswordChange}
            label="Nowe hasło"
            error={newPasswordError}
            required
            disabled={isLoading}
            sx={{ width: '80%' }}
          />

          <PasswordInput
            value={repeatPassword}
            onChange={handleRepeatPasswordChange}
            label="Powtórz hasło"
            error={repeatPasswordError}
            required
            disabled={isLoading}
            sx={{ width: '80%' }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !newPassword || !repeatPassword}
            sx={{
              mb: 5,
            }}
          >
            {isLoading ? <LoadingSpinner /> : 'Zmień hasło'}
          </Button>
        </>
    </Box>
  );
}

