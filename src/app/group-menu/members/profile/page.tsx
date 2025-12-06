"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import type { GroupMember } from "@/lib/types/user";
import { formatDate } from "@/lib/utils/date";
import { getStatusLabel, STORAGE_KEYS } from "@/lib/constants";
import { Group } from "@/lib/types/group";

export default function MemberProfilePage() {
  const theme = useTheme();

  const [groupContext, setGroupContext] = useState<Group>({
    id: "",
    name: "",
    color: "",
  });
  const [storedMember, setStoredMember] = useState<GroupMember | null>(null);
  const [memberLoadError, setMemberLoadError] = useState<string | null>(null);
  const [isMemberLoaded, setIsMemberLoaded] = useState(false);
  const hasSkippedStrictCleanupRef = useRef(false);

useEffect(() => {
  if (typeof window === "undefined") {
    return;
  }

  setGroupContext({
    id: localStorage.getItem("groupId") ?? "",
    name: localStorage.getItem("groupName") ?? "",
    color: localStorage.getItem("groupColor") ?? "",
  });

  try {
    const rawMember = localStorage.getItem(STORAGE_KEYS.SELECTED_GROUP_MEMBER);
    if (rawMember) {
      const parsedMember = JSON.parse(rawMember) as GroupMember;
      setStoredMember(parsedMember);
    } else {
      setStoredMember(null);
    }
    setMemberLoadError(null);
  } catch (storageError) {
    console.error("Nie udało się odczytać członka grupy:", storageError);
    setStoredMember(null);
    setMemberLoadError("Nie udało się odczytać danych członka. Wróć do listy członków i wybierz osobę ponownie.");
  } finally {
    setIsMemberLoaded(true);
  }

  return () => {
    if (typeof window === "undefined") {
      return;
    }

    const isDev = process.env.NODE_ENV !== "production";
    if (isDev && !hasSkippedStrictCleanupRef.current) {
      hasSkippedStrictCleanupRef.current = true;
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_MEMBER);
    } catch (storageError) {
      console.error("Nie udało się usunąć danych członka z localStorage:", storageError);
    }
  };
}, []);

  const normalizedMember = useMemo(() => {
    if (!storedMember) {
      return null;
    }

    const birthDateValue = storedMember.birthDate ? new Date(storedMember.birthDate) : null;

    return {
      id: storedMember.id,
      name: storedMember.name?.trim() ?? "",
      surname: storedMember.surname?.trim() ?? "",
      username: storedMember.username?.trim() ?? "",
      status: storedMember.status?.trim() ?? null,
      description: storedMember.description?.trim() ?? "",
      birthDate: birthDateValue,
      profilePictureUrl: storedMember.profilePicture?.url ?? null,
    };
  }, [storedMember]);

  const initials = useMemo(() => {
    if (!normalizedMember) {
      return "?";
    }

    const first = normalizedMember.name.charAt(0);
    const last = normalizedMember.surname.charAt(0);
    const fallback = normalizedMember.username.charAt(0) || "?";
    const combined = `${first}${last}`.trim() || fallback;
    return combined.toUpperCase();
  }, [normalizedMember]);

  const renderLoader = () => (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        py: 4,
      }}
    >
      <CircularProgress size={36} />
    </Box>
  );

  const renderMemberDetails = () => {
    if (!normalizedMember) {
      return (
        <Typography color="text.secondary" textAlign="center">
          Nie znaleziono wskazanego członka w tej grupie.
        </Typography>
      );
    }

    return (
      <>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Avatar
            alt={`${normalizedMember.name} ${normalizedMember.surname}`.trim() || undefined}
            src={normalizedMember.profilePictureUrl ?? undefined}
            sx={{
              width: { xs: 80, sm: 90 },
              height: { xs: 80, sm: 90 },
              bgcolor: theme.palette.grey[700],
              border: `3px solid ${groupContext.color || theme.palette.primary.main}`,
              color: theme.palette.primary.contrastText,
              fontSize: { xs: 24, sm: 28 },
              fontWeight: 600,
            }}
          >
            {!normalizedMember.profilePictureUrl && initials}
          </Avatar>

          <Box textAlign="center" width="100%">
            <Typography variant="h5" fontWeight={700} mt={1.5}>
              {`${normalizedMember.name} ${normalizedMember.surname}`.trim() || "Nieznany członek"}
            </Typography>
            <Typography color="grey.400" mt={1.5}>
              {normalizedMember.username ? `@${normalizedMember.username}` : "Brak pseudonimu"}
            </Typography>
            {groupContext.name && (
              <Typography color="text.secondary" mt={2}>
                Członek grupy{" "}
                <Box
                  component="span"
                  sx={{
                    color: groupContext.color || theme.palette.primary.light,
                    fontWeight: 600,
                  }}
                >
                  {groupContext.name}
                </Box>
              </Typography>
            )}
          </Box>
        </Box>

        <Divider
          flexItem
          sx={{
            width: "100%",
            borderColor: "rgba(255,255,255,0.2)",
            my: 3,
          }}
        />

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
            sx={{ minWidth: 0, maxWidth: "100%" }}
          >

            <Box width="100%">
              <Typography color="text.secondary">Data urodzenia</Typography>
              <Typography>{formatDate(normalizedMember.birthDate)}</Typography>
            </Box>

            <Box width="100%">
              <Typography color="text.secondary">Status</Typography>
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
                  mb: 3,
                  scrollbarColor: `${theme.palette.primary.main} transparent`,
                }}
              >
                {getStatusLabel(normalizedMember.status)}
              </Typography>
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
            alignItems="center"
            textAlign="center"
            width="100%"
          >
            <Box width="100%">
              <Typography color="text.secondary">Opis</Typography>
              <Typography
                sx={{
                  width: "90%",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "pre-line",
                  textAlign: normalizedMember.description ? "left" : "center",
                  maxHeight: "190px",
                  overflowY: "auto",
                  marginLeft: "10px",
                  paddingRight: "10px",
                  paddingBottom: "10px",
                  scrollbarWidth: "thin",
                  scrollbarColor: `${theme.palette.primary.main} transparent`,
                }}
              >
                {normalizedMember.description || "Brak opisu"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </>
    );
  };

  const renderContent = () => {
    if (!isMemberLoaded) {
      return renderLoader();
    }

    if (!groupContext.id) {
      return (
        <Typography color="text.secondary" textAlign="center">
          Brak kontekstu grupy. Wróć do listy członków i wybierz grupę ponownie.
        </Typography>
      );
    }

    if (memberLoadError) {
      return (
        <Alert severity="error" sx={{ width: "100%" }}>
          {memberLoadError}
        </Alert>
      );
    }

    if (!normalizedMember) {
      return (
        <Typography color="text.secondary" textAlign="center">
          Brak zapisanych danych członka. Wróć do listy i wybierz osobę, aby zobaczyć profil.
        </Typography>
      );
    }

    return renderMemberDetails();
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
        pt: 10,
      }}
    >
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
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
}

