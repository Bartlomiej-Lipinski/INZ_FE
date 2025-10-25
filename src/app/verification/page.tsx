"use client";

import Image from "next/image";
import { IMAGES } from "@/lib/constants";
import VerificationForm from "../../components/pages/Verification-form";
import { Box, Typography } from '@mui/material';

export default function VerificationPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Image src={IMAGES.MATES_LOGO} alt="Logo" width={280} height={250} />
      
      <Typography
        variant="h4"
        sx={{
          color: 'white',
          textAlign: 'center',
          pb: 1,
          pt: 1,
          fontWeight: 600,
        }}
      >
        Weryfikacja dwuetapowa
      </Typography>

      <Typography
        sx={{
          color: 'text.secondary',
          textAlign: 'center',
          fontSize: '14px',
          pb: 3,
          px: 2,
          wordBreak: 'break-word',
        }}
      >
        Wprowadź kod weryfikacyjny wysłany na Twój adres e-mail
      </Typography>

      <VerificationForm />
    </Box>
  );
}
