"use client";

import AccountGroupsNav from "@/components/layout/Account-groups-nav";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { ChevronRight, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils/date";
import { API_ROUTES } from "@/lib/api/api-routes-endpoints";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";
import { STATUS_OPTIONS } from "@/lib/constants";



export default function AccountPage() {
  const { user, isLoading, setUser } = useAuthContext();
  const theme = useTheme();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    username: "",
    birthDate: "",
    status: "",
    description: "",
  });
  const initials = useMemo(() => {
    if (!user) return "?";

    const nameInitial = user.name?.charAt(0) ?? "";
    const surnameInitial = user.surname?.charAt(0) ?? "";

    const combined = `${nameInitial}${surnameInitial}`.trim();
    return combined.toUpperCase();
  }, [user]);

  const formatDateForInput = useCallback((date: Date | string | null | undefined) => {
    if (!date) return "";
    const dateObj = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(dateObj.getTime())) return "";
    return dateObj.toISOString().split("T")[0];
  }, []);

  const populateFormFromUser = useCallback(() => {
    if (!user) return;

    setFormValues({
      username: user.username ?? "",
      birthDate: formatDateForInput(user.birthDate),
      status: user.status ?? "",
      description: user.description ?? "",
    });
  }, [formatDateForInput, user]);

  useEffect(() => {
    if (!isEditing) {
      populateFormFromUser();
    }
  }, [populateFormFromUser, isEditing]);

  const handleStartEditing = () => {
    setSaveError(null);
    populateFormFromUser();
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setSaveError(null);
    populateFormFromUser();
  };

  const handleFieldChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveError(null);

    const payload = {
      username: formValues.username.trim(),
      status: formValues.status.trim() || null,
      description: formValues.description.trim() || null,
      birthDate: formValues.birthDate || null,
    };

    try {
      const response = await fetchWithAuth(API_ROUTES.USER_BY_ID, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setSaveError("Nie udało się zapisać zmian. Spróbuj ponownie.");
        return;
      }

      try {
        const updatedUser = await response.json();
        setUser(updatedUser);
      } catch {
        setUser({
          ...user,
          username: payload.username,
          status: payload.status,
          description: payload.description,
          birthDate: payload.birthDate
            ? new Date(payload.birthDate)
            : (user.birthDate as Date),
        });
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Błąd podczas zapisywania danych profilu:", error);
      setSaveError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
    } finally {
      setIsSaving(false);
    }
  };


  const handleLogout = async () => {
    try {
        const response = await fetchWithAuth(`${API_ROUTES.LOGOUT}`, { method: 'POST' });
        if (response.ok) {
            setUser(null);
            router.push('/');
        } else {
            console.error('Logout failed:', response.status, response.statusText);
        }
    } catch (e) {
        console.error('Logout error:', e);
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
        }}
      >
        {isLoading ? (
          <CircularProgress size={36} />
        ) : user ? (
          <>
            <Avatar
              alt={`${user.name} ${user.surname}`.trim() || undefined}
              src={user.photo?.toString() || undefined}
              sx={ {
                width: { xs: 80, sm: 90 },
                height: { xs: 80, sm: 90 },
                bgcolor: theme.palette.grey[700],
                border: `3px solid ${theme.palette.primary.main}`,
                color: theme.palette.primary.contrastText,
                fontSize: { xs: 24, sm: 28 },
                fontWeight: 600,
              }}
            >
              {initials}
            </Avatar>

  
              <Typography variant="h5" fontWeight={700} textAlign="center">
                {`${user.name} ${user.surname}`}
              </Typography>
              

              <Button onClick={handleLogout}>
                  Wyloguj się
                  </Button>

            <Divider flexItem sx={{ width: "100%", borderColor: "rgba(255,255,255,0.2)" }} />

            <Box
              width="100%"
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              alignItems={{ xs: "center", md: "stretch" }}
            >

              <Box
                flex={1}
                display="flex"
                flexDirection="column"
                gap={3}
                pr={{ md: 3 }}
                alignItems="center"
                textAlign="center"
                width="100%"
              >
                
                {/* user name */}
                <Box width="100%">
                  {isEditing ? (
                    <TextField
                      label="Pseudonim"
                      value={formValues.username}
                      onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        handleFieldChange("username", event.target.value)
                      }
                      fullWidth
                    />
                  ) : (
                    <>
                      <Typography color="text.secondary" >
                        Pseudonim
                      </Typography>
                      <Typography >
                        {user.username?.trim() || "Brak pseudonimu"}
                      </Typography>
                    </>
                  )}
                </Box>


                {/* birth date */}
                <Box >
                  {isEditing ? (
                    <TextField
                      type="date"
                      label="Data urodzenia"
                      value={formValues.birthDate}
                      onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        handleFieldChange("birthDate", event.target.value)
                      }
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& input[type="date"]::-webkit-calendar-picker-indicator': {
                          filter: "invert(1)",
                        },
                      }}
                    />
                  ) : (
                    <>
                      <Typography  color="text.secondary" >
                        Data urodzenia
                      </Typography>
                      <Typography>
                        {formatDate(user.birthDate)}
                      </Typography>
                    </>
                  )}
                </Box>


                {/* status */}
                <Box
                mb={3}
                justifyItems={"center"}
                width="100%"
                >
                  {isEditing ? (
                    <TextField
                      select
                      label="Status"
                      value={formValues.status}
                      onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        handleFieldChange("status", event.target.value)
                      }
                      fullWidth
                      SelectProps={{
                        displayEmpty: true,
                        MenuProps: {
                          PaperProps: {
                            sx: {
                              backgroundColor: theme.palette.grey[800],
                              border: `2px solid ${theme.palette.grey[700]}`,
                              height: "196px",
                              overflowY: "auto",
                              scrollbarWidth: "thin",
                              scrollbarColor: `${theme.palette.primary.main} transparent`,
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Brak statusu</em>
                      </MenuItem>
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <>
                      <Typography color="text.secondary" >
                        Status
                      </Typography>
                      <Typography
                      sx={{
                        width: "95%",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          whiteSpace: "pre-line",
                          maxHeight: "50px",
                          overflowY: "auto",
                          marginLeft: "10px",
                          paddingRight: "10px",
                          scrollbarWidth: "thin",
                          scrollbarColor: `${theme.palette.primary.main} transparent`,     
                      }}
                      >
                        {user.status?.trim() || "Brak statusu"}
                      </Typography>
                    </>
                  )}
                </Box>


               
              </Box>

              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  display: { xs: "block", md: "block" },
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              />

              <Box
                flex={1}
                display="flex"
                flexDirection="column"
                pl={{ md: 3 }}
                alignItems={"center"}
                textAlign={"center"}
              >

                {/* description */}
                <Box
                justifyItems="center"
                width="100%"
                >
                  {isEditing ? (
                    <TextField
                      label="Opis"
                      value={formValues.description}
                      onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        handleFieldChange("description", event.target.value)
                      }
                      fullWidth
                      multiline
                      minRows={4}
                    />
                  ) : (
                    <>
                      <Typography color="text.secondary" >
                        Opis
                      </Typography>
                      <Typography
                        sx={{
                          width: "90%",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          whiteSpace: "pre-line",
                          textAlign: user.description ? "left" : "center",
                          maxHeight: "200px",
                          overflowY: "auto",
                          marginLeft: "10px",
                          paddingRight: "10px",
                          scrollbarWidth: "thin",
                          scrollbarColor: `${theme.palette.primary.main} transparent`
                        }}
                      >
                        {user.description?.trim() || "Brak opisu"}
                      </Typography>
                    </>
                  )}
                  </Box>
                
                </Box>
              </Box>
              
            {isEditing ? (
              <Box
                sx={{
                  mt: 1,
                  width: "100%",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  onClick={handleCancelEditing}
                  disabled={isSaving}
                >
                  Anuluj
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Zapisywanie..." : "Zapisz"}
                </Button>
              </Box>
            ) : (
              <Button sx={{ mt: 1 }} onClick={handleStartEditing}>
                Edytuj profil
              </Button>
            )}

            {saveError && (
              <Typography color="error" textAlign="center">
                {saveError}
              </Typography>
            )}

                <ButtonBase
                  sx={{
                    width: "100%",
                    mt: 0.5,
                    px: 3,
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    bgcolor: "rgba(125, 125, 125, 0.9)",
                    border: `2px solid ${theme.palette.grey[700]}`,
                    color: theme.palette.text.primary,
                    textAlign: "left",
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(125, 125, 125, 0.6)",
                    },
                  }}
                  onClick={() => router.push("/account/settings")}
                >
                  <Settings
                    size={28}
                    color={theme.palette.text.primary}
                  />
                  <Typography flex={1} fontWeight={500}>
                    Zarządzanie kontem
                  </Typography>
                  <ChevronRight
                    size={28}
                    color={theme.palette.text.primary}
                  />
                </ButtonBase>      
          </>
        ) : (
          <Typography color="text.secondary" textAlign="center">
            Nie udało się załadować danych użytkownika.
          </Typography>
        )}
      </Box>
    </Box>
  );
}


