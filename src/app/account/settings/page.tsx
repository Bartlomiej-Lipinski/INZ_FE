"use client";

import { useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import AccountGroupsNav from "@/components/layout/Account-groups-nav";
import NewPasswordForm from "@/components/pages/New-password-form";

export default function AccountSettingsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  return (
    <Box
      component="section"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        width: "100%",
        pb: 3,
      }}
    >
      <AccountGroupsNav />

      <Box
        sx={{
          width: "80%",
          maxWidth: 530,
          px: { xs: 5, sm: 6 },
          py: 4,
          bgcolor: "rgba(125, 125, 125, 0.25)",
          borderRadius: 4,
          border: `1px solid ${theme.palette.grey[700]}`,
          boxShadow: `0 16px 45px rgba(0, 0, 0, 0.35)`,
          color: theme.palette.text.primary,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          position: "relative",
        }}
      >
        <IconButton
          aria-label="powrót"
          onClick={() => router.push("/account")}
          sx={{
            position: "absolute",
            top: 24.5,
            left: 12,
            color: theme.palette.text.primary,
            "&:hover": {
              bgcolor: "rgba(125, 125, 125, 0.5)",
            },
          }}
        >
          <ChevronLeft size={23} />
        </IconButton>
        <Typography variant="h5" fontWeight={700} textAlign="center">
          Zarządzanie kontem
        </Typography>

        {!isChangingPassword ? (
          <Button
            onClick={() => setIsChangingPassword(true)}
            sx={{ mt: 1 }}
          >
            Zmiana hasła
          </Button>
        ) : (
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <NewPasswordForm />
            <Button
              onClick={() => setIsChangingPassword(false)}
              sx={{
                backgroundColor: theme.palette.grey[800],
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.grey[700]}`,
                width: "120px",
              }}
            >
              Anuluj
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}