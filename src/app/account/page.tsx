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
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import { ChevronRight, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

function formatBirthDate(birthDate: Date) {
  if (!birthDate) return "Brak danych";

  const date = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (Number.isNaN(date.getTime())) return "Brak danych";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());

  return `${day}.${month}.${year}`;
}

export default function AccountPage() {
  const { user, isLoading } = useAuthContext();
  const theme = useTheme();
  const router = useRouter();
  const initials = useMemo(() => {
    if (!user) return "?";

    const nameInitial = user.name?.charAt(0) ?? "";
    const surnameInitial = user.surname?.charAt(0) ?? "";

    const combined = `${nameInitial}${surnameInitial}`.trim();
    return combined.toUpperCase();
  }, [user]);

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
        sx={ {
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
              

              {/* TODO: Add logic for logout button */}
              <Button>
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
                alignItems={ "center"}
                textAlign={ "center"}
                width="100%"
              >
                
                {/* user name */}
                <Box width="100%">
                  <Typography color="text.secondary" >
                    Pseudonim
                  </Typography>
                  <Typography >
                    {user.userName?.trim() || "Brak pseudonimu"}
                  </Typography>
                </Box>


                {/* birth date */}
                <Box >
                  <Typography  color="text.secondary" >
                    Data urodzenia
                  </Typography>
                  <Typography>
                    {formatBirthDate(user.birthDate)}
                  </Typography>
                </Box>


                {/* status */}
                <Box
                mb={3}
                justifyItems={"center"}
                >
                  <Typography color="text.secondary" >
                    Status
                  </Typography>
                  <Typography
                  sx={ {
                    width: "90%",
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
                alignItems={ "center"}
                textAlign={ "center"}
              >

                {/* description */}
                <Box
                justifyItems="center"
                >
                  <Typography color="text.secondary" >
                    Opis
                  </Typography>
                  <Typography
                    sx={ {
                      width: "90%",
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                      whiteSpace: "pre-line",
                      textAlign: "left",
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
                  </Box>
                
                </Box>
              </Box>
              
            {/* TODO: Add logic for edit profile button */}
              <Button sx={{ mt: 1 }}>
                Edytuj profil
              </Button>

                <ButtonBase
                  sx={ {
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


