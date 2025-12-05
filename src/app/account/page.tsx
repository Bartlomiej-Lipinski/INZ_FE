"use client";

import AccountGroupsNav from "@/components/layout/Account-groups-nav";
import {useAuthContext} from "@/contexts/AuthContext";
import {
    Avatar,
    Box,
    Button,
    ButtonBase,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    MenuItem,
    Slider,
    TextField,
    Typography,
} from "@mui/material";
import {ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {Camera, ChevronRight, Settings} from "lucide-react";
import {useRouter} from "next/navigation";
import {formatDate, formatDateForInput} from "@/lib/utils/date";
import {getCroppedFile} from "@/lib/utils/image";
import {
    getStatusLabel,
    STATUS_OPTIONS,
    MAX_PROFILE_PHOTO_SIZE,
    ALLOWED_PROFILE_PHOTO_TYPES,
    SAFE_AVATAR_URL_PATTERN
} from "@/lib/constants";
import {useUser, type ProfilePhotoResponseData} from "@/hooks/use-user";
import {useImage, clearProfilePictureCache} from "@/hooks/use-image";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {validateBirthDate, validateRequiredInput, validateUsername} from "@/lib/zod-schemas";
import Cropper, {Area} from "react-easy-crop";

const getSafeProfilePictureUrl = (url?: string | null) =>
  typeof url === "string" && SAFE_AVATAR_URL_PATTERN.test(url) ? url : null;

export default function AccountPage() {
  const { user, isLoading, setUser } = useAuthContext();
  const {
    updateProfile,
    uploadProfilePicture,
    fetchAuthenticatedUser,
    isLoading: isUpdatingProfile,
    error: updateError,
    setErrorMessage
  } = useUser();
  type UpdatePayload = Parameters<typeof updateProfile>[0];
  type UpdatePayloadWithAvatar = UpdatePayload & { profilePictureId?: string | null };
  const buildOptimisticUserState = useCallback(
    (
      baseUser: typeof user,
      {
        payload,
        uploadedPhoto,
        removeAvatar,
      }: {
        payload: UpdatePayloadWithAvatar | null;
        uploadedPhoto: ProfilePhotoResponseData | null;
        removeAvatar: boolean;
      },
    ) => {
      if (!baseUser) {
        return null;
      }

      const mergedUser = payload
        ? {
            ...baseUser,
            name: payload.name,
            surname: payload.surname,
            username: payload.username,
            status: payload.status,
            description: payload.description,
            birthDate: payload.birthDate,
          }
        : baseUser;

      if (removeAvatar) {
        return {
          ...mergedUser,
          profilePicture: null,
        };
      }

      if (uploadedPhoto) {
        return {
          ...mergedUser,
          profilePicture: {
            id: uploadedPhoto.id ?? baseUser.profilePicture?.id ?? "",
            fileName: uploadedPhoto.fileName,
            contentType: uploadedPhoto.contentType,
            size: uploadedPhoto.size,
            url: uploadedPhoto.url,
          },
        };
      }

      return mergedUser;
    },
    [],
  );
  const { fetchProfilePicture, getProfilePictureFromCache, deleteProfilePicture, restoreProfilePictureCache } = useImage();
  const theme = useTheme();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarObjectUrlRef = useRef<string | null>(null);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(() => {
    if (!user?.profilePicture) {
      return null;
    }

    if (user.profilePicture.id) {
      return null;
    }

    return getSafeProfilePictureUrl(user.profilePicture.url);
  });
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null);
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isAvatarFileLoading, setIsAvatarFileLoading] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isPreparingCrop, setIsPreparingCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isAvatarDragActive, setIsAvatarDragActive] = useState(false);
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
  const isSaving = isUpdatingProfile || isUploadingPhoto;

  const setAvatarPreviewUrl = useCallback((url: string | null, options: { isObjectUrl?: boolean } = {}) => {
    if (avatarObjectUrlRef.current && avatarObjectUrlRef.current !== url) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }

    if (options.isObjectUrl && url) {
      avatarObjectUrlRef.current = url;
    }

    setAvatarPreview(url);
  }, []);

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
        avatarObjectUrlRef.current = null;
      }
    };
  }, []);

  
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

  const normalizedFormValues = useMemo(() => ({
    name: formValues.name.trim(),
    surname: formValues.surname.trim(),
    username: formValues.username.trim(),
    status: formValues.status.trim(),
    description: formValues.description.trim(),
    birthDate: formValues.birthDate,
  }), [formValues]);

  const normalizedUserValues = useMemo(() => {
    if (!user) {
      return null;
    }

    return {
      name: user.name?.trim() ?? "",
      surname: user.surname?.trim() ?? "",
      username: user.username?.trim() ?? "",
      status: user.status?.trim() ?? "",
      description: user.description?.trim() ?? "",
      birthDate: formatDateForInput(user.birthDate),
    };
  }, [user]);

  const hasProfileDataChanged = useMemo(() => {
    if (!normalizedUserValues) {
      return false;
    }

    return (
      normalizedFormValues.name !== normalizedUserValues.name ||
      normalizedFormValues.surname !== normalizedUserValues.surname ||
      normalizedFormValues.username !== normalizedUserValues.username ||
      normalizedFormValues.status !== normalizedUserValues.status ||
      normalizedFormValues.description !== normalizedUserValues.description ||
      normalizedFormValues.birthDate !== normalizedUserValues.birthDate
    );
  }, [normalizedFormValues, normalizedUserValues]);

  const shouldUploadAvatar = !!selectedAvatarFile;
  const shouldUpdateProfile = hasProfileDataChanged || shouldRemoveAvatar;
  const hasPendingChanges = shouldUpdateProfile || shouldUploadAvatar;
  const shouldLoadRemoteAvatar = !shouldRemoveAvatar && !selectedAvatarFile;

  const profilePictureSource = useMemo(() => {
    if (!user?.profilePicture) {
      return null;
    }

    return {
      id: user.profilePicture.id ?? null,
      url: user.profilePicture.url,
    };
  }, [user?.profilePicture?.id, user?.profilePicture?.url]);

  useEffect(() => {
    if (!shouldRemoveAvatar) {
      return;
    }

    setAvatarPreviewUrl(null);
    setIsAvatarFileLoading(false);
  }, [setAvatarPreviewUrl, shouldRemoveAvatar]);

  useEffect(() => {
    if (!shouldLoadRemoteAvatar) {
      return;
    }

    if (!profilePictureSource) {
      setAvatarPreviewUrl(null);
      setIsAvatarFileLoading(false);
      return;
    }

    if (!profilePictureSource.id) {
      setAvatarPreviewUrl(getSafeProfilePictureUrl(profilePictureSource.url));
      setIsAvatarFileLoading(false);
      return;
    }

    const cachedBlob = getProfilePictureFromCache(profilePictureSource.id);
    if (cachedBlob) {
      const objectUrl = URL.createObjectURL(cachedBlob);
      setAvatarPreviewUrl(objectUrl, { isObjectUrl: true });
      setIsAvatarFileLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsAvatarFileLoading(true);

    const loadProfilePicture = async () => {
      const blob = await fetchProfilePicture(profilePictureSource.id ?? "", controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      if (!blob) {
        setAvatarPreviewUrl(getSafeProfilePictureUrl(profilePictureSource.url));
      } else {
        const objectUrl = URL.createObjectURL(blob);
        setAvatarPreviewUrl(objectUrl, { isObjectUrl: true });
      }

      if (!controller.signal.aborted) {
        setIsAvatarFileLoading(false);
      }
    };

    loadProfilePicture().catch((error) => {
      if ((error as Error)?.name === "AbortError") {
        return;
      }
      console.error("Profile photo download error:", error);
      setAvatarPreviewUrl(getSafeProfilePictureUrl(profilePictureSource.url));
      setIsAvatarFileLoading(false);
    });

    return () => {
      controller.abort();
    };
  }, [
    fetchProfilePicture,
    getProfilePictureFromCache,
    profilePictureSource,
    setAvatarPreviewUrl,
    setIsAvatarFileLoading,
    shouldLoadRemoteAvatar,
  ]);

  useEffect(() => {
    if (!selectedAvatarFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedAvatarFile);
    setAvatarPreviewUrl(objectUrl, { isObjectUrl: true });
    setIsAvatarFileLoading(false);

    return () => {
      URL.revokeObjectURL(objectUrl);
      if (avatarObjectUrlRef.current === objectUrl) {
        avatarObjectUrlRef.current = null;
      }
    };
  }, [selectedAvatarFile, setAvatarPreviewUrl, setIsAvatarFileLoading]);

  useEffect(() => {
    if (!pendingAvatarFile) {
      setPendingAvatarPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(pendingAvatarFile);
    setPendingAvatarPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [pendingAvatarFile]);

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

  const resetAvatarSelection = useCallback(() => {
    setSelectedAvatarFile(null);
    setPendingAvatarFile(null);
    setPendingAvatarPreview(null);
    setIsCropperOpen(false);
    setIsPreparingCrop(false);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setIsAvatarDragActive(false);
    setShouldRemoveAvatar(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [fileInputRef]);

  const handleStartEditing = () => {
    setErrorMessage("");
    setErrors({
      name: "",
      surname: "",
      username: "",
      birthDate: "",
    });
    resetAvatarSelection();
    populateFormFromUser();
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setErrorMessage("");
    populateFormFromUser();
    resetAvatarSelection();
  };

  const validators: Record<keyof typeof errors, (value: string) => string> = {
    name: (value) => validateRequiredInput(value, "Podaj imię"),
    surname: (value) => validateRequiredInput(value, "Podaj nazwisko"),
    username: (value) => validateUsername(value),
    birthDate: (value) => validateBirthDate(value),
  };

  const validateAvatarFile = (file: File): string | null => {
    const isAllowedType = ALLOWED_PROFILE_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PROFILE_PHOTO_TYPES)[number]);
    if (!isAllowedType) {
      return "Obsługiwane formaty zdjęć to JPG, PNG lub WEBP.";
    }

    if (file.size > MAX_PROFILE_PHOTO_SIZE) {
      return "Maksymalny rozmiar zdjęcia to 2 MB.";
    }

    return null;
  };

  const handleAvatarFileSelection = useCallback((file: File) => {
    const validationError = validateAvatarFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");
    setIsAvatarDragActive(false);
    setShouldRemoveAvatar(false);
    setPendingAvatarFile(file);
    setIsCropperOpen(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [setErrorMessage, setShouldRemoveAvatar]);

  const handleRemoveCurrentAvatar = useCallback(() => {
    if (!user?.profilePicture && !avatarPreview) {
      return;
    }

    setSelectedAvatarFile(null);
    setPendingAvatarFile(null);
    setPendingAvatarPreview(null);
    setIsCropperOpen(false);
    setIsPreparingCrop(false);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setIsAvatarDragActive(false);
    setShouldRemoveAvatar(true);
    setAvatarPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [avatarPreview, setAvatarPreviewUrl, user?.profilePicture, fileInputRef]);

  const handleRestoreRemovedAvatar = useCallback(() => {
    if (!user?.profilePicture) {
      setShouldRemoveAvatar(false);
      return;
    }

    setShouldRemoveAvatar(false);
    setErrorMessage("");

    if (user.profilePicture.id) {
      setIsAvatarFileLoading(true);
    } else {
      setAvatarPreviewUrl(getSafeProfilePictureUrl(user.profilePicture.url));
      setIsAvatarFileLoading(false);
    }
  }, [setAvatarPreviewUrl, setErrorMessage, user, setIsAvatarFileLoading]);

  const handleAvatarInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarFileSelection(file);
    }
    event.target.value = "";
  };

  const handleAvatarDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsAvatarDragActive(true);
  };

  const handleAvatarDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    event.preventDefault();
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }
    setIsAvatarDragActive(false);
  };

  const handleAvatarDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    event.preventDefault();
    setIsAvatarDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleAvatarFileSelection(file);
    }
  };

  const handleAvatarButtonClick = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  const handleAvatarCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleCancelAvatarCrop = () => {
    if (isPreparingCrop) {
      return;
    }

    setIsCropperOpen(false);
    setPendingAvatarFile(null);
    setPendingAvatarPreview(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleConfirmAvatarCrop = async () => {
    if (!pendingAvatarPreview || !pendingAvatarFile || !croppedAreaPixels) {
      setErrorMessage("Najpierw wybierz kadr zdjęcia.");
      return;
    }

    setIsPreparingCrop(true);
    try {
      const croppedFile = await getCroppedFile(pendingAvatarPreview, croppedAreaPixels, pendingAvatarFile);

      if (croppedFile.size > MAX_PROFILE_PHOTO_SIZE) {
        setErrorMessage("Przycięte zdjęcie jest większe niż 2 MB. Spróbuj zmniejszyć kadr.");
        setIsPreparingCrop(false);
        return;
      }

      setSelectedAvatarFile(croppedFile);
      setIsCropperOpen(false);
      setPendingAvatarFile(null);
      setPendingAvatarPreview(null);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error("Avatar crop error:", error);
      setErrorMessage("Nie udało się przyciąć zdjęcia.");
    } finally {
      setIsPreparingCrop(false);
    }
  };

  const handleCropDialogClose = (_event: object, reason: "backdropClick" | "escapeKeyDown") => {
    if (isPreparingCrop) {
      return;
    }

    handleCancelAvatarCrop();
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

    if (!hasPendingChanges) {
      return;
    }

    const previousProfilePictureId = user.profilePicture?.id ?? null;
    let payload: UpdatePayloadWithAvatar | null = null;

    if (shouldUpdateProfile) {
      const validationErrors = Object.keys(validators).reduce((acc, key) => {
        const field = key as keyof typeof validators;
        acc[field] = validators[field](formValues[field]);
        return acc;
      }, {} as typeof errors);

      setErrors(validationErrors);

      const hasErrors = Object.values(validationErrors).some((err) => err !== "");
      if (hasErrors) {
        setErrorMessage("Popraw błędy w polach!");
        return;
      }

      payload = {
        name: normalizedFormValues.name,
        surname: normalizedFormValues.surname,
        username: normalizedFormValues.username || null,
        status: normalizedFormValues.status === "" ? null : normalizedFormValues.status,
        description: normalizedFormValues.description || null,
        birthDate: new Date(formValues.birthDate),
        ...(shouldRemoveAvatar ? { profilePictureId: null } : {}),
      };

      setErrorMessage("");

      const result = await updateProfile(payload);

      if (!result.success) {
        return;
      }

      if (shouldRemoveAvatar) {
        const deleteSuccess = await deleteProfilePicture(previousProfilePictureId);
        if (!deleteSuccess) {
          setErrorMessage("Nie udało się usunąć zdjęcia profilowego.");
          return;
        }
      }
    } else if (shouldUploadAvatar) {
      setErrorMessage("");
    }

    let uploadedPhotoData: ProfilePhotoResponseData | null = null;

    if (shouldUploadAvatar && selectedAvatarFile) {
      setIsUploadingPhoto(true);
      try {
        uploadedPhotoData = await uploadProfilePicture(selectedAvatarFile);
      } finally {
        setIsUploadingPhoto(false);
      }
      if (!uploadedPhotoData) {
        await restoreProfilePictureCache(previousProfilePictureId);
        return;
      }
    }

    if (shouldRemoveAvatar || shouldUploadAvatar) {
      const cacheKeysToInvalidate = new Set<string>();
      if (previousProfilePictureId && (shouldRemoveAvatar || uploadedPhotoData?.id)) {
        cacheKeysToInvalidate.add(previousProfilePictureId);
      }
      if (uploadedPhotoData?.id) {
        cacheKeysToInvalidate.add(uploadedPhotoData.id);
      }
      cacheKeysToInvalidate.forEach((cacheKey) => clearProfilePictureCache(cacheKey));
    }

    const optimisticUser = buildOptimisticUserState(user, {
      payload,
      uploadedPhoto: uploadedPhotoData,
      removeAvatar: shouldRemoveAvatar,
    });

    const refreshedUser = await fetchAuthenticatedUser(user?.id);

    if (refreshedUser) {
      setUser({
        ...refreshedUser,
        profilePicture: shouldRemoveAvatar ? null : refreshedUser.profilePicture,
      });
    } else if (optimisticUser) {
      setUser(optimisticUser);
    }

    setIsEditing(false);
    resetAvatarSelection();
  };


  const handleLogout = async () => {
    try {
        const response = await fetchWithAuth(`${API_ROUTES.LOGOUT}`, { method: 'POST' });
        if (response.ok) {
            setUser(null);
            clearProfilePictureCache();
            router.push('/');
        } else {
            console.error('Logout failed:', response.status, response.statusText);
        }
    } catch (e) {
        console.error('Logout error:', e);
    }
};

  return (
    <>
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
              <Box
                sx={{position: "relative", display: "inline-flex"}}
                onDragOver={handleAvatarDragOver}
                onDragEnter={handleAvatarDragOver}
                onDragLeave={handleAvatarDragLeave}
                onDrop={handleAvatarDrop}
                onClick={isEditing ? handleAvatarButtonClick : undefined}
              >
                  <Avatar
                      alt={`${user.name} ${user.surname}`.trim() || undefined}
                      src={avatarPreview ?? undefined}
                      sx={{
                          width: {xs: 80, sm: 90},
                          height: {xs: 80, sm: 90},
                          bgcolor: theme.palette.grey[700],
                          border: `3px solid ${isAvatarDragActive ? theme.palette.primary.light : theme.palette.primary.main}`,
                          color: theme.palette.primary.contrastText,
                          fontSize: {xs: 24, sm: 28},
                          fontWeight: 600,
                          cursor: isEditing ? "pointer" : "default",
                          transition: "border-color 0.2s ease",
                      }}
                  >
                      {!avatarPreview && initials}
                  </Avatar>
                  {isEditing && (
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAvatarButtonClick();
                      }}
                      sx={{
                        position: "absolute",
                        bottom: -8,
                        right: -8,
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        border: `2px solid ${theme.palette.background.paper}`,
                        "&:hover": {
                          bgcolor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      <Camera size={18} />
                    </IconButton>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_PROFILE_PHOTO_TYPES.join(",")}
                    style={{display: "none"}}
                    onChange={handleAvatarInputChange}
                    disabled={!isEditing}
                  />
                  {(isUploadingPhoto || isAvatarFileLoading) && (
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
                        bgcolor: "rgba(0,0,0,0.35)",
                        borderRadius: "50%",
                      }}
                    >
                      <CircularProgress size={28}/>
                    </Box>
                  )}
              </Box>
              {isEditing && !selectedAvatarFile && !shouldRemoveAvatar && (
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Obsługiwane formaty: JPG, PNG, WEBP (max 2 MB). Możesz przeciągnąć zdjęcie na avatara.
                </Typography>
              )}
              {isEditing && selectedAvatarFile && (
                <Button
                  onClick={resetAvatarSelection}
                  sx={{mb: 1, backgroundColor: theme.palette.primary.dark}}
                >
                  Usuń wybrane zdjęcie
                </Button>
              )}
              {isEditing && !selectedAvatarFile && user?.profilePicture && !shouldRemoveAvatar && (
                <Button
                  onClick={handleRemoveCurrentAvatar}
                  sx={{ mb: 1, mt: -2, backgroundColor: theme.palette.error.main}}
                >
                  Usuń aktualne zdjęcie
                </Button>
              )}
              {isEditing && shouldRemoveAvatar && (
                <Box
                  sx={{
                    mt: -1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="caption" color="warning.light" textAlign="center">
                    Zdjęcie zostanie usunięte po zapisaniu zmian.
                  </Typography>
                  <Button
                    onClick={handleRestoreRemovedAvatar}
                    sx={{backgroundColor: theme.palette.primary.dark, mt:1}}
                  >
                    Cofnij
                  </Button>
                </Box>
              )}

  
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
                          marginRight: "-17px",
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
                  disabled={isSaving}
                >
                  Anuluj
                </Button>
                <Button
                  fullWidth
                  onClick={handleSave}
                  disabled={isSaving || !hasPendingChanges}
                >
                  {isSaving ? "Zapisywanie..." : "Zapisz"}
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
    <Dialog
      open={isCropperOpen}
      onClose={handleCropDialogClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Przytnij zdjęcie profilowe</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: 260, sm: 320 },
            bgcolor: "rgba(0,0,0,0.35)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {pendingAvatarPreview ? (
            <Cropper
              image={pendingAvatarPreview}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleAvatarCropComplete}
            />
          ) : (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography color="text.secondary">Ładuję podgląd...</Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
            Powiększenie
          </Typography>
          <Slider
            value={zoom}
            onChange={(_event, value) => setZoom(value as number)}
            min={1}
            max={3}
            step={0.1}
            aria-label="Skala przybliżenia"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancelAvatarCrop} disabled={isPreparingCrop}>
          Anuluj
        </Button>
        <Button
          onClick={handleConfirmAvatarCrop}
          disabled={isPreparingCrop || !croppedAreaPixels || !pendingAvatarPreview}
        >
          {isPreparingCrop ? "Przetwarzanie..." : "Zastosuj"}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}


