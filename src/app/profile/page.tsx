"use client";

import {Suspense, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Alert, Box, Button, CircularProgress, Divider, IconButton, Typography,} from "@mui/material";
import {ArrowLeftIcon,} from 'lucide-react';
import {useTheme} from "@mui/material/styles";
import type {GroupMember} from "@/lib/types/user";
import {formatDate} from "@/lib/utils/date";
import {getStatusLabel, STORAGE_KEYS} from "@/lib/constants";
import {useAuthContext} from "@/contexts/AuthContext";
import {useMembers} from "@/hooks/use-members";
import {useRouter, useSearchParams} from "next/navigation";

function MemberProfilePageContent() {
    const router = useRouter();
    const theme = useTheme();
    const {user} = useAuthContext();
    const searchParams = useSearchParams();
    const [storedMember, setStoredMember] = useState<GroupMember | null>(null);
    const [memberLoadError, setMemberLoadError] = useState<string | null>(null);
    const [isMemberLoaded, setIsMemberLoaded] = useState(false);
    const hasSkippedStrictCleanupRef = useRef(false);
    const {
        grantAdminPrivileges,
        removeGroupMember,
        error: membersError,
        setErrorMessage,
    } = useMembers();
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);
    const [isGrantingAdmin, setIsGrantingAdmin] = useState(false);
    const [isRemovingMember, setIsRemovingMember] = useState(false);
    const [showGrantAdminConfirm, setShowGrantAdminConfirm] = useState(false);
    const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState(false);
    const groupData = useMemo(() => {
        const groupId = searchParams?.get('groupId') || '';
        const groupName = searchParams?.get('groupName') || '';
        const groupColor = searchParams?.get('groupColor') || '#9042fb';
        return {
            id: groupId,
            name: decodeURIComponent(groupName),
            color: decodeURIComponent(groupColor),
        };
    }, [searchParams]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

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
            isAwaitingApproval: Boolean(storedMember.isAwaitingApproval),
        };
    }, [storedMember]);


    const canManageMember = user?.role === "Admin" && Boolean(normalizedMember) && normalizedMember?.id !== user?.id;

    const handleGrantAdmin = useCallback(async () => {
        if (!groupData.id || !normalizedMember?.id) {
            setErrorMessage("Brak danych grupy lub użytkownika potrzebnych do wykonania akcji.");
            return;
        }

        setIsGrantingAdmin(true);
        setActionSuccess(null);
        setErrorMessage(null);

        try {
            const response = await grantAdminPrivileges(groupData.id, normalizedMember.id);
            if (response.success) {
                setActionSuccess("Uprawnienia administratora zostały nadane.");
            }
        } catch (error) {
            console.error("Grant admin privileges action error:", error);
        } finally {
            setIsGrantingAdmin(false);
        }
    }, [
        grantAdminPrivileges,
        groupData.id,
        normalizedMember?.id,
        setErrorMessage,
    ]);

    const handleRemoveMember = useCallback(async () => {
        if (!groupData.id || !normalizedMember?.id) {
            setErrorMessage("Brak danych grupy lub użytkownika potrzebnych do wykonania akcji.");
            return;
        }

        setIsRemovingMember(true);
        setActionSuccess(null);
        setErrorMessage(null);

        try {
            const response = await removeGroupMember(groupData.id, normalizedMember.id);
            if (response.success) {
                setActionSuccess("Użytkownik został usunięty z grupy.");
            }
        } catch (error) {
            console.error("Remove group member action error:", error);
        } finally {
            setIsRemovingMember(false);
        }
    }, [
        groupData.id,
        normalizedMember?.id,
        removeGroupMember,
        setErrorMessage,
    ]);


    const renderLoader = () => (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                py: 4,
            }}
        >
            <CircularProgress size={36}/>
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

                    <Box textAlign="center" width="100%">
                        <Typography variant="h3" fontWeight={700}>
                            {`${normalizedMember.name} ${normalizedMember.surname}`.trim() || "Nieznany członek"}
                        </Typography>

                        <Typography variant="h5" color="grey.500" mt={1.5}>
                            {normalizedMember.username ? `@${normalizedMember.username}` : "Brak pseudonimu"}
                        </Typography>

                        {groupData.name && (
                            <Typography color="text.secondary" mt={2}>
                                {normalizedMember.isAwaitingApproval ? "Czeka na akceptację do grupy" : "Członek grupy"}{" "}
                                <Box
                                    component="span"
                                    sx={{
                                        color: groupData.color || theme.palette.primary.light,
                                        fontWeight: 600,
                                    }}
                                >
                                    {groupData.name}
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
                    flexDirection={{xs: "column", sm: "row"}}
                    alignItems={{xs: "center", sm: "stretch"}}
                >
                    <Box
                        flex={1}
                        display="flex"
                        flexDirection="column"
                        gap={3}
                        pr={{xs: 0, sm: 3}}
                        alignItems="center"
                        textAlign="center"
                        width="100%"
                        sx={{minWidth: 0, maxWidth: "100%"}}
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
                            display: {xs: "block", sm: "block"},
                            borderColor: "rgba(255,255,255,0.2)",
                        }}
                    />

                    <Box
                        flex={1}
                        display="flex"
                        flexDirection="column"
                        pl={{xs: 0, sm: 3}}
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
                                    paddingLeft: "10px",
                                    paddingBottom: "10px",
                                    scrollbarWidth: "thin",
                                    scrollbarColor: `${groupData.color} transparent`,
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

        if (!groupData.id) {
            return (
                <Typography color="text.secondary" textAlign="center">
                    Brak kontekstu grupy. Wróć do listy członków i wybierz grupę ponownie.
                </Typography>
            );
        }

        if (memberLoadError) {
            return (
                <Alert severity="error" sx={{width: "100%"}}>
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

    const renderAdminActions = () => {
        if (!canManageMember) {
            return null;
        }

        const isAwaitingApproval = normalizedMember?.isAwaitingApproval;

        return (
            <Box
                width="100%"
                mt={3}
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={3}
            >
                {isAwaitingApproval && (
                    <Alert
                        severity="info"
                        sx={{
                            width: "100%",
                            mt: 1,
                        }}
                    >
                        Ten użytkownik wciąż czeka na akceptację do grupy. Akcje administracyjne będą dostępne po
                        zatwierdzeniu prośby.
                    </Alert>
                )}

                {(membersError || actionSuccess) && (
                    <Alert
                        severity={membersError ? "error" : "success"}
                        sx={{width: "100%"}}
                    >
                        {membersError ?? actionSuccess}
                    </Alert>
                )}

                <Divider
                    sx={{
                        width: "100%",
                        borderColor: "rgba(255,255,255,0.2)",
                    }}
                />

                <Box width="100%" display="flex" flexDirection="column" alignItems="center" gap={2}>
                    {!showGrantAdminConfirm && (
                        <Button
                            sx={{
                                width: "80%",
                                backgroundColor: groupData.color || theme.palette.primary.main,
                                color: theme.palette.getContrastText(groupData.color || theme.palette.primary.main),
                            }}
                            disabled={isAwaitingApproval || isGrantingAdmin}
                            onClick={() => setShowGrantAdminConfirm(true)}
                            startIcon={
                                isGrantingAdmin ? (
                                    <CircularProgress size={20} color="inherit"/>
                                ) : undefined
                            }
                        >
                            Nadaj prawa administratora grupy
                        </Button>
                    )}

                    {showGrantAdminConfirm && (
                        <Box
                            sx={{
                                width: "100%",
                                maxWidth: "90%",
                                boxSizing: "border-box",
                                p: {xs: 2.5, sm: 3},
                                borderRadius: 2,
                                border: `1px solid ${groupData.color || theme.palette.primary.light}`,
                                bgcolor: "rgba(255, 255, 255, 0.05)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                                alignItems: "center",
                            }}
                        >
                            <Typography fontWeight={600} textAlign="center" mb={1.5}>
                                Czy na pewno chcesz nadać temu użytkownikowi prawa administratora?
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: {xs: "column", sm: "row"},
                                    justifyContent: "center",
                                    alignItems: "stretch",
                                    gap: {xs: 1.5, sm: 3},
                                    width: "100%",
                                }}
                            >
                                <Button
                                    fullWidth
                                    sx={{
                                        minWidth: {xs: "auto", sm: 120},
                                        backgroundColor: theme.palette.grey[800],
                                    }}
                                    disabled={isGrantingAdmin}
                                    onClick={async () => {
                                        setShowGrantAdminConfirm(false);
                                        await handleGrantAdmin();
                                    }}
                                >
                                    {isGrantingAdmin ? (
                                        <CircularProgress size={18}/>
                                    ) : (
                                        "Tak"
                                    )}
                                </Button>

                                <Button
                                    fullWidth
                                    sx={{
                                        minWidth: {xs: "auto", sm: 120},
                                        backgroundColor: groupData.color || theme.palette.primary.main,
                                        color: theme.palette.getContrastText(groupData.color || theme.palette.primary.main)
                                    }}
                                    onClick={() => setShowGrantAdminConfirm(false)}
                                >
                                    Nie
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>

                <Divider
                    sx={{
                        width: "100%",
                        borderColor: "rgba(255,255,255,0.2)",
                    }}
                />

                <Box width="100%" display="flex" flexDirection="column" alignItems="center" gap={2}>
                    {!showRemoveMemberConfirm && (
                        <Button
                            sx={{width: "60%", backgroundColor: theme.palette.error.main}}
                            disabled={isAwaitingApproval || isRemovingMember}
                            onClick={() => setShowRemoveMemberConfirm(true)}
                            startIcon={
                                isRemovingMember ? (
                                    <CircularProgress size={20} sx={{color: 'text.disabled'}}/>
                                ) : undefined
                            }
                        >
                            Usuń członka z grupy
                        </Button>
                    )}

                    {showRemoveMemberConfirm && (
                        <Box
                            sx={{
                                width: "100%",
                                maxWidth: "90%",
                                boxSizing: "border-box",
                                p: {xs: 2.5, sm: 3},
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.error.main}`,
                                bgcolor: "rgba(255, 0, 0, 0.08)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                                alignItems: "center",
                            }}
                        >
                            <Typography fontWeight={600} textAlign="center" mb={1.5}>
                                Czy na pewno chcesz usunąć tego użytkownika z grupy?
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: {xs: "column", sm: "row"},
                                    justifyContent: "center",
                                    alignItems: "stretch",
                                    gap: {xs: 1.5, sm: 3},
                                    width: "100%",
                                }}
                            >
                                <Button
                                    fullWidth
                                    sx={{
                                        minWidth: {xs: "auto", sm: 120},
                                        backgroundColor: theme.palette.grey[800],
                                    }}
                                    disabled={isRemovingMember}
                                    onClick={async () => {
                                        setShowRemoveMemberConfirm(false);
                                        await handleRemoveMember();
                                    }}
                                >
                                    {isRemovingMember ? (
                                        <CircularProgress size={18} sx={{color: 'white'}}/>
                                    ) : (
                                        "Tak"
                                    )}
                                </Button>

                                <Button
                                    fullWidth
                                    sx={{
                                        minWidth: {xs: "auto", sm: 120},
                                        backgroundColor: groupData.color || theme.palette.primary.main,
                                        color: theme.palette.getContrastText(groupData.color || theme.palette.primary.main)
                                    }}
                                    onClick={() => setShowRemoveMemberConfirm(false)}
                                >
                                    Nie
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    };

    return (
        <Box
            component="section"
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                width: "100%",
                minHeight: "60vh",
                py: 3,
            }}
        >
            <Box
                sx={{
                    width: "80%",
                    maxWidth: 530,
                    px: {xs: 5, sm: 6},
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
                <Box sx={{alignSelf: 'flex-start', mb: 2}}>
                    <IconButton onClick={() => router.back()} sx={{color: 'text.primary'}}>
                        <ArrowLeftIcon/>
                    </IconButton>
                </Box>
                {renderContent()}
                {renderAdminActions()}
            </Box>
        </Box>
    );
}

export default function MemberProfilePage() {
    return (
        <Suspense fallback={<div>Ładowanie...</div>}>
            <MemberProfilePageContent />
        </Suspense>
    );
}
