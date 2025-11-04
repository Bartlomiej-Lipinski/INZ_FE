'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography,
  TextField,
  Link
} from '@mui/material';
import LoadingSpinner from '@/components/common/Loading-spinner';

export default function VerificationForm() {
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
      inputRefs.current[5]?.focus();
    }
  };


   // TO-DO: Replace with actual API call
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // const codeString = code.join('');
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };


  // TO-DO: Replace with actual API call
  const handleResendCode = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    setIsLoading(false);
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
      {/* Verification code fields */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1, sm: 2 },
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          mb: 1,
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
              width: { xs: '40px', sm: '50px' },
              height: { xs: '40px', sm: '50px' },
              '& .MuiOutlinedInput-root': {
               
                backgroundColor: 'rgba(125, 125, 125, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                height: { xs: '40px', sm: '50px' },
                width: { xs: '40px', sm: '50px' },
                
                '&.Mui-focused fieldset': {
                  border: '2px solid',
                  borderColor: 'primary.main',
                },
              },
              '& .MuiInputBase-input': {
                textAlign: 'center',
                fontSize: { xs: '18px', sm: '20px' },
                fontWeight: 400,
              },
            }}
          />
        ))}
      </Box>

      {/* Link to resend code */}
      <Link
        component="button"
        type="button"
        onClick={handleResendCode}
        disabled={isLoading}
      >
        Wyślij ponownie kod
      </Link>

      {/* Error message */}
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

      {/* Verification button */}
      <Button
        type="submit"
        variant="contained"
        disabled={isLoading || code.some(digit => !digit)}
        sx={{
          mb: 5,
        }}
      >
        {isLoading ? <LoadingSpinner /> : 'Zweryfikuj kod'}
      </Button>
    </Box>
  );
}
