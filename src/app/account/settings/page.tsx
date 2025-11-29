"use client";

import { useState } from "react";
import { Box, Button, Divider, IconButton, Typography, Switch, FormControlLabel, Alert } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import AccountGroupsNav from "@/components/layout/Account-groups-nav";
import NewPasswordForm from "@/components/pages/New-password-form";
import { use2FA } from "@/hooks/use-2FA";

export default function AccountSettingsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { isEnabled, isLoading, error, successMessage, toggle2FA, setErrorMessage } = use2FA();

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

        <Divider flexItem sx={{ width: "100%", borderColor: "rgba(255,255,255,0.2)" }} />

        {/* 2FA Toggle */}
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography  fontWeight={500}>
                Dwuetapowa weryfikacja (2FA)
              </Typography>
              <Typography  sx={{ color: theme.palette.text.secondary, fontSize: "14px" , width: "90%"}}>
                2FA działa przez e-mail z kodem weryfikacyjnym
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={isEnabled}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => toggle2FA(e.target.checked as boolean)}
                  disabled={isLoading}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: theme.palette.primary.main,
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: theme.palette.primary.main,
                    },
                  }}
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          </Box>

          {error && (
            <Alert 
              severity="error" 
              onClose={() => setErrorMessage(null)}
              sx={{ mt: 1 }}
            >
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert 
              severity="success"
              sx={{ mt: 1 }}
            >
              {successMessage}
            </Alert>
          )}
        </Box>

        <Divider flexItem sx={{ width: "100%", borderColor: "rgba(255,255,255,0.2)" }} />

        {/* change password */}
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