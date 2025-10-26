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
  const inputRefs = useRef<(HTMLElement | null)[]>([]);

 

  const handleCodeChange = (index: number, value: string) => {

    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };


  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      } else if (index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

 
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


  // Obsługa wysłania formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
  
    setIsLoading(true);
    setError('');

    try {
      
      const codeString = code.join('');
      
      // Symulacja wysyłania (zastąp prawdziwym API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Zastapic prawdziwą walidacją
      if (codeString === '123456') {
        router.push('/'); 
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
      // Tutaj logika ponownego wysłania kodu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
    } catch (error) {
      console.error('Błąd podczas ponownego wysłania kodu:', error);
      setError('Wystąpił błąd podczas ponownego wysłania kodu');
    } finally {
      setIsLoading(false);
    }
  };

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
            inputRef={(el) => { inputRefs.current[index] = el; }}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            slotProps={{
              input: {
                style: {
                  padding: 0,
                  paddingTop: '2px',
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
                textAlign: 'center',
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
