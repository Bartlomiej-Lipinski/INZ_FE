"use client";

import Image from "next/image";
import { IMAGES } from "@/lib/constants";
import ResetPasswordForm from "../../components/pages/Reset-password-form";
import { Box, Typography } from '@mui/material';

export default function ResetPasswordPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        marginTop: -4,
        width: '100%',
      }}
    >
      <Image 
        src={IMAGES.MATES_LOGO} 
        alt="Logo" 
        width={200} 
        height={180} 
        priority 
        style={{ marginTop: 30, marginBottom: 20 }} 
      />
      
      <Typography
        variant="h4"
        sx={{
          textAlign: 'center',
          mb: 2,
        }}
      >
        Resetowanie hasła
      </Typography>

      <ResetPasswordForm />
    </Box>
  );
}

