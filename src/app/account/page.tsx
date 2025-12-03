"use client";

import AccountGroupsNav from "@/components/layout/Account-groups-nav";
import {useAuthContext} from "@/contexts/AuthContext";
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
import {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {ChevronRight, Settings} from "lucide-react";
import {useRouter} from "next/navigation";
import {formatDate, formatDateForInput} from "@/lib/utils/date";
import {getStatusLabel, STATUS_OPTIONS} from "@/lib/constants";
import {useUser} from "@/hooks/use-user";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {validateBirthDate, validateRequiredInput, validateUsername} from "@/lib/zod-schemas";
import useGetUserProfilePicture from "@/hooks/use-getUserProfilePicture";

export default function AccountPage() {
  const { user, isLoading, setUser } = useAuthContext();
  const { updateProfile, isLoading: isUpdatingProfile, error: updateError, setErrorMessage } = useUser();
  const theme = useTheme();
  const router = useRouter();
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<{
    name: string;
    surname: string;
    username: string;
    birthDate: string;
  }>({
    name: "",
    surname: "",
    username: "",
    birthDate: "",
  });

    const {src: avatarSrc, loading: avatarLoading} = useGetUserProfilePicture(user?.profilePicture?.id);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMediumScreen(window.innerWidth >= theme.breakpoints.values.sm);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [theme.breakpoints.values.sm]);
  
  const descriptionMinRows = useMemo(() => (isMediumScreen ? 8 : 6), [isMediumScreen]);
  const [formValues, setFormValues] = useState({
    name: "",
    surname: "",
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

  const populateFormFromUser = useCallback(() => {
    if (!user) return;

    setFormValues({
      name: user.name ?? "",
      surname: user.surname ?? "",
      username: user.username ?? "",
      birthDate: formatDateForInput(user.birthDate),
      status: user.status ?? "",
      description: user.description ?? "",
    });
  }, [user]);

  useEffect(() => {
    if (!isEditing) {
      populateFormFromUser();
    }
  }, [populateFormFromUser, isEditing]);

  const handleStartEditing = () => {
    setErrorMessage("");
    setErrors({
      name: "",
      surname: "",
      username: "",
      birthDate: "",
    });
    populateFormFromUser();
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setErrorMessage("");
    populateFormFromUser();
  };

  const validators: Record<keyof typeof errors, (value: string) => string> = {
    name: (value) => validateRequiredInput(value, "Podaj imię"),
    surname: (value) => validateRequiredInput(value, "Podaj nazwisko"),
    username: (value) => validateUsername(value),
    birthDate: (value) => validateBirthDate(value),
  };

  const handleFieldChange = (field: keyof typeof formValues, value: string) => {
    if (field in validators) {
      const error = validators[field as keyof typeof validators](value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }

    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) {
      return;
    }

    const validationErrors = Object.keys(validators).reduce((acc, key) => {
      const field = key as keyof typeof validators;
      acc[field] = validators[field](formValues[field]);
      return acc;
    }, {} as typeof errors);

    setErrors(validationErrors);

    const hasErrors = Object.values(validationErrors).some(err => err !== "");
    if (hasErrors) {
      setErrorMessage("Popraw błędy w polach!");
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      surname: formValues.surname.trim(),
      username: formValues.username.trim() || null,
      status: formValues.status.trim() === "" ? null : formValues.status.trim(),
      description: formValues.description.trim() || null,
      birthDate: new Date(formValues.birthDate),
    };

    const result = await updateProfile(payload);

    if (result.success) {
      setIsEditing(false);
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
              <Box sx={{position: "relative", display: "inline-flex"}}>
                  <Avatar
                      alt={`${user.name} ${user.surname}`.trim() || undefined}
                      src={avatarSrc ?? undefined}
                      sx={{
                          width: {xs: 80, sm: 90},
                          height: {xs: 80, sm: 90},
                          bgcolor: theme.palette.grey[700],
                          border: `3px solid ${theme.palette.primary.main}`,
                          color: theme.palette.primary.contrastText,
                          fontSize: {xs: 24, sm: 28},
                          fontWeight: 600,
                      }}
                  >
                      {initials}
                  </Avatar>
                  {avatarLoading && (
                      <Box
                          sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "rgba(0,0,0,0.25)",
                              borderRadius: "50%",
                          }}
                      >
                          <CircularProgress size={28}/>
                      </Box>
                  )}
              </Box>

  
              {isEditing ? (
                <>
                  <Typography variant="h6" fontWeight={700} textAlign="center" color="text.secondary">
                    Tryb edycji profilu 
                  </Typography>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    mt: 1,
                  }}
                >

                  {/* name */}
                  <TextField
                    label="Imię"
                    value={formValues.name}
                    onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      handleFieldChange("name", event.target.value)
                    }
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name}
                  />

                  {/* surname */}
                  <TextField
                    label="Nazwisko"
                    value={formValues.surname}
                    onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      handleFieldChange("surname", event.target.value)
                    }
                    fullWidth
                    error={!!errors.surname}
                    helperText={errors.surname}
                  />
                </Box>
                </>
              ) : (
                <Typography variant="h5" fontWeight={700} textAlign="center">
                  {`${user.name} ${user.surname}`}
                </Typography>
              )}
              
              {!isEditing && (
                <Button onClick={handleLogout}>
                    Wyloguj się
                    </Button>
              )}

            <Divider flexItem sx={{ width: "100%", borderColor: "rgba(255,255,255,0.2)" }} />

            <Box
              width="100%"
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "center", sm: "stretch" }}
            >

              <Box
                flex={1}
                display="flex"
                flexDirection="column"
                gap={3}
                pr={{ xs: 0, sm: 3 }}
                alignItems="center"
                textAlign="center"
                width="100%"
                sx={{
                  minWidth: 0,
                  maxWidth: "100%",
                }}
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
                      error={!!errors.username}
                      helperText={errors.username}
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
                <Box width="100%">
                  {isEditing ? (
                    <TextField
                      type="date"
                      label="Data urodzenia"
                      value={formValues.birthDate}
                      onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        handleFieldChange("birthDate", event.target.value)
                      }
                      error={!!errors.birthDate}
                      helperText={errors.birthDate}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& input[type="date"]::-webkit-calendar-picker-indicator': {
                          opacity: 0.6,
                          marginRight: "-18px",
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
                textAlign={isEditing ? "left" : "center"}
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
                      sx={{
                        "& .MuiSelect-select": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          paddingLeft: "12px",
                        },
                      }}
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
                        {getStatusLabel(user.status)}
                      </Typography>
                    </>
                  )}
                </Box>


               
              </Box>

              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  display: { xs: "block", sm: "block" },
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              />

              <Box
                flex={1}
                display="flex"
                flexDirection="column"
                pl={{ xs: 0, sm: 3 }}
                alignItems={"center"}
                textAlign={"center"}
                width="100%"
              >

                {/* description */}
                <Box
                justifyItems="center"
                width="100%"
                >
                  {isEditing ? (
                    <Box width="100%">
                      <TextField
                        label="Opis"
                        value={formValues.description}
                        onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                          handleFieldChange("description", event.target.value)
                        }
                        fullWidth
                        multiline
                        minRows={descriptionMinRows}
                        maxRows={8}
                        inputProps={{ maxLength: 250 }}
                        sx={{
                          scrollbarWidth: "thin",
                          scrollbarColor: `${theme.palette.primary.main} transparent`,
                          "& .MuiInputBase-input": {
                            paddingTop: "2.5px",
                            paddingInline: "15px",
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: "right",
                          marginRight: "5px",
                          color: theme.palette.grey[400],
                          mt: 0.5,
                        }}
                      >
                        {formValues.description.length}/250
                      </Typography>
                    </Box>
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
                          maxHeight: "190px",
                          overflowY: "auto",
                          marginLeft: "10px",
                          paddingRight: "10px",
                          paddingBottom: "10px",
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
              
              {updateError && (
              <Typography color="error" textAlign="center">
                {updateError}
              </Typography>
            )}

            {isEditing ? (
              <Box
                sx={{
                  mt: 0.5,
                  width: "80%",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2.5,
                  justifyContent: "center",
                }}
              >


                <Button
                  sx={{
                    backgroundColor: theme.palette.grey[800],
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.grey[700]}`,
                  }}
                  fullWidth
                  onClick={handleCancelEditing}
                  disabled={isUpdatingProfile}
                >
                  Anuluj
                </Button>
                <Button
                  fullWidth
                  onClick={handleSave}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Zapisywanie..." : "Zapisz"}
                </Button>
              </Box>
            ) : (
              <Button sx={{ mt: 1 }} onClick={handleStartEditing}>
                Edytuj profil
              </Button>
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


