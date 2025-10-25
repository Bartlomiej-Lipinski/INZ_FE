"use client";

import { useState, useRef } from "react";
import Button from "@/components/common/Button";
import { 
  Box, 
  TextField, 
  Typography, 
  Stack,
  Link 
} from '@mui/material';

export default function VerificationForm() {
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


  //HANDLES
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setError("");

    // Przejście do następnego pola
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Przejście do poprzedniego pola 
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setError("Wprowadź pełny kod weryfikacyjny");
      return;
    }
    
                                                                                    // Dodać logikę weryfikacji kodu
    console.log("Kod weryfikacyjny:", code);
    alert(`Kod weryfikacyjny: ${code} - funkcja weryfikacji jeszcze nie jest dostępna`);
  };

  const handleResendCode = () => {
    setIsResending(true);
   
    setTimeout(() => {
      setIsResending(false);
      alert("Kod weryfikacyjny został wysłany ponownie");                           // Dodać logikę wysłania kodu
    }, 2000);
  };

  const isCodeComplete = verificationCode.every(digit => digit !== "");



  //RENDER
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
        justifyContent: 'center',
        mb: 5,
      }}
    >
      <Stack direction="row" spacing={2} justifyContent="center">
        {verificationCode.map((digit, index) => (
          <TextField
            key={index}
            inputRef={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e as React.KeyboardEvent<HTMLInputElement>)}
            inputProps={{
              maxLength: 1,
              inputMode: "numeric",
              pattern: "[0-9]*",
              style: {
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 600,
              },
            }}
            sx={{
              width: 48,
              height: 48,
              '& .MuiOutlinedInput-root': {
                height: 48,
                borderRadius: 2,
                backgroundColor: 'transparent',
                border: '1px solid #666666',
                color: 'white',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(144, 66, 251, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
              },
            }}
          />
        ))}
      </Stack>

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

      <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
        <Link
          component="button"
          type="button"
          onClick={handleResendCode}
          disabled={isResending}
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
          {isResending ? "Wysyłanie..." : "Wyślij ponownie kod"}
        </Link>

        <Button
          onClick={handleVerifyCode}
          disabled={!isCodeComplete}
          sx={{
            opacity: !isCodeComplete ? 0.5 : 1,
            cursor: !isCodeComplete ? 'not-allowed' : 'pointer',
          }}
        >
          Zweryfikuj kod
        </Button>
      </Stack>
    </Box>
  );
} 