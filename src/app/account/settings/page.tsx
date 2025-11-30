"use client";

import { useState } from "react";
import { Box, Button, Divider, IconButton, Typography, Switch, FormControlLabel, Alert, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import AccountGroupsNav from "@/components/layout/Account-groups-nav";
import { use2FA } from "@/hooks/use-2FA";
import { useAuthContext } from "@/contexts/AuthContext";
import { API_ROUTES } from "@/lib/api/api-routes-endpoints";

export default function AccountSettingsPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();
  const { isEnabled, isLoading, error, successMessage, toggle2FA, setErrorMessage } = use2FA();
  const [isResetLinkLoading, setIsResetLinkLoading] = useState(false);
  const [resetLinkError, setResetLinkError] = useState<string | null>(null);
  const [resetLinkSuccess, setResetLinkSuccess] = useState<string | null>(null);

  const handleSendPasswordReset = async () => {
    if (isResetLinkLoading) {
      return;
    }

    if (!user?.email) {
      setResetLinkError("Brak przypisanego adresu e-mail. Spróbuj ponownie po zalogowaniu.");
      return;
    }

    setResetLinkError(null);
    setResetLinkSuccess(null);
    setIsResetLinkLoading(true);

    try {
      const response = await fetch(API_ROUTES.RESET_PASSWORD_REQUEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: user.email,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        setResetLinkSuccess("Link resetujący został wysłany na Twój e-mail.");
      } else if (response.status === 500) {
        setResetLinkError("Nie udało się wysłać linku resetującego. Błąd połączenia z serwerem.");
      } else {
        setResetLinkError("Nie udało się wysłać linku resetującego. Spróbuj ponownie.");
      }

    } catch (sendError) {
      console.error("Send reset link error:", sendError);
      setResetLinkError(sendError instanceof Error ? sendError.message : "Wystąpił błąd podczas wysyłania linku.");
    } finally {
      setIsResetLinkLoading(false);
    }
  };

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

        <Divider flexItem sx={{ width: "100%", borderColor: "rgba(255,255,255,0.2)" , marginBlock: 1}} />

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

        <Divider flexItem sx={{ width: "100%", borderColor: "rgba(255,255,255,0.2)" , marginBlock: 1}} />

        {/* password reset link */}
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
    
          <Button
            onClick={handleSendPasswordReset}
            disabled={isResetLinkLoading || !user?.email}
          >
            {isResetLinkLoading ? (
              <CircularProgress size={20} thickness={4} sx={{ color: "white" }} />
            ) : (
              "Wyślij link do resetu hasła"
            )}
          </Button>

          {resetLinkSuccess && (
            <Alert 
              severity="success" 
              onClose={() => setResetLinkSuccess(null)}
              sx={{ width: "100%", mt: 1 }}
            >
              {resetLinkSuccess}
            </Alert>
          )}

          {resetLinkError && (
            <Alert 
              severity="error" 
              onClose={() => setResetLinkError(null)}
              sx={{ width: "100%" , mt: 1}}
            >
              {resetLinkError}
            </Alert>
          )}

        </Box>
        
        
        <Divider flexItem sx={{ width: "100%", borderColor: "rgba(255,255,255,0.2)" , marginBlock: 1}} />

        <Button
          sx={{
            backgroundColor: theme.palette.error.main,
            width: "130px",
          }}
        >
          Usuń konto
        </Button>
      </Box>
    </Box>
  );
}