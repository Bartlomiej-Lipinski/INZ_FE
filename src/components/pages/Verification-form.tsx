'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography,
  TextField,
  Link
} from '@mui/material';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/Loading-spinner';

export default function VerificationForm() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Obsługa zmiany wartości w polach kodu
  const handleCodeChange = (index: number, value: string) => {
    // Pozwól tylko na cyfry
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Automatyczne przejście do następnego pola
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Obsługa klawiatury (backspace, arrow keys)
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Obsługa wklejania kodu
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      setError('');
      // Przenieś focus na ostatnie pole
      inputRefs.current[5]?.focus();
    }
  };

  // Walidacja kodu
  const validateCode = () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      setError('Kod musi składać się z 6 cyfr');
      return false;
    }
    return true;
  };

  // Obsługa wysłania formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCode()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Tutaj będzie logika wysyłania kodu do API
      const codeString = code.join('');
      
      // Symulacja wysyłania (zastąp prawdziwym API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Przykład sprawdzenia kodu (zastąp prawdziwą walidacją)
      if (codeString === '123456') {
        router.push('/'); // Przekierowanie po udanej weryfikacji
      } else {
        setError('Nieprawidłowy kod weryfikacyjny');
      }
    } catch (error) {
      console.error('Błąd podczas weryfikacji:', error);
      setError('Wystąpił błąd podczas weryfikacji');
    } finally {
      setIsLoading(false);
    }
  };

  // Obsługa ponownego wysłania kodu
  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Tutaj będzie logika ponownego wysłania kodu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Wyczyść pola
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      // Tutaj można dodać powiadomienie o wysłaniu nowego kodu
    } catch (error) {
      console.error('Błąd podczas ponownego wysłania kodu:', error);
      setError('Wystąpił błąd podczas ponownego wysłania kodu');
    } finally {
      setIsLoading(false);
    }
  };

  // Automatyczne focus na pierwsze pole po załadowaniu
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        width: '100%',
        maxWidth: 400,
      }}
    >
      {/* Pola kodu weryfikacyjnego */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {code.map((digit, index) => (
          <TextField
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            slotProps={{
              input: {
                style: {
                  textAlign: 'center',
                  fontSize: '24px',
                  padding: 0,
                },
              },
              htmlInput: {
                maxLength: 1,
              },
            }}
            sx={{
              width: '50px',
              height: '50px',
              '& .MuiOutlinedInput-root': {
               
                backgroundColor: 'rgba(125, 125, 125, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                height: '50px',
                width: '50px',
                
                '&.Mui-focused fieldset': {
                  border: '2px solid',
                  borderColor: 'primary.main',
                },
              },
              '& .MuiInputBase-input': {
                padding: 0,
                textAlign: 'center',
                color: '#ffffff',
                fontSize: '20px',
                fontWeight: 400,
              },
            }}
          />
        ))}
      </Box>

      {/* Link do ponownego wysłania kodu */}
      <Link
        component="button"
        type="button"
        onClick={handleResendCode}
        disabled={isLoading}
        sx={{
          color: 'text.secondary',
          fontSize: '14px',
          textDecoration: 'underline',
          cursor: 'pointer',
          '&:hover': {
            color: 'primary.main',
            textDecoration: 'underline',
          },
          '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        }}
      >
        Wyślij ponownie kod
      </Link>

      {/* Komunikat o błędzie */}
      {error && (
        <Typography
          sx={{
            color: 'error.main',
            fontSize: '14px',
            textAlign: 'center',
            mt: -1,
          }}
        >
          {error}
        </Typography>
      )}

      {/* Przycisk weryfikacji */}
      <Button
        type="submit"
        variant="contained"
        disabled={isLoading || code.some(digit => !digit)}
      >
        {isLoading ? <LoadingSpinner /> : 'Zweryfikuj kod'}
      </Button>
    </Box>
  );
}
