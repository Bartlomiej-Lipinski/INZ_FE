"use client";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography,
} from '@mui/material';
import {ArrowLeft, Trash2} from 'lucide-react';
import {useRouter, useSearchParams} from 'next/navigation';
import {useEffect, useMemo, useState} from 'react';
import {useIsAdmin} from "@/hooks/use-isAdmin";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";

export default function GroupSettingsPage() {
    const router = useRouter();
    const {verifyIsUserAdmin} = useIsAdmin();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedColor, setSelectedColor] = useState('#9042fb');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

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
        const checkAdmin = async () => {
            const result = await verifyIsUserAdmin(groupData.id);
            if (result.success && result.data) {
                setIsUserAdmin(true);
                setGroupName(groupData.name);
                setSelectedColor(groupData.color);
            } else {
                router.push(`/group-menu?groupId=${groupData.id}&groupName=${encodeURIComponent(groupData.name)}&groupColor=${encodeURIComponent(groupData.color)}`);
            }
            setLoading(false);
        };
        checkAdmin();
    }, [groupData, verifyIsUserAdmin, router]);

    const handleSaveSettings = async () => {
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const response = await fetchWithAuth(`${API_ROUTES.UPDATE_GROUP}?groupId=${groupData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: groupName,
                    color: selectedColor,
                }),
            });

            if (!response.ok) throw new Error('Nie udało się zapisać zmian');

            setSuccess('Ustawienia grupy zostały zaktualizowane');
            setTimeout(() => setSuccess(''), 3000);

            const params = new URLSearchParams({
                groupId: groupData.id,
                groupName: encodeURIComponent(groupName),
                groupColor: encodeURIComponent(selectedColor),
            });
            router.replace(`/group-settings?${params.toString()}`, {scroll: false});
        } catch (err) {
            setError('Błąd podczas zapisywania ustawień');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGroup = async () => {
        try {
            const response = await fetchWithAuth(`${API_ROUTES.DELETE_GROUP}?groupId=${groupData.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Nie udało się usunąć grupy');
            localStorage.removeItem('currentGroupId');
            router.push('/');
        } catch (err) {
            setError('Błąd podczas usuwania grupy');
            console.error(err);
            setDeleteDialogOpen(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (!isUserAdmin) {
        return null;
    }

    return (
        <Container maxWidth="md" sx={{py: 4}}>
            <Button
                startIcon={<ArrowLeft size={20}/>}
                onClick={() => router.back()}
                sx={{mb: 3}}
            >
                Powrót
            </Button>

            <Typography variant="h4" sx={{mb: 3, fontWeight: 600}}>
                Ustawienia grupy
            </Typography>

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
            {success && <Alert severity="success" sx={{mb: 2}}>{success}</Alert>}

            <Card sx={{borderRadius: 3, mb: 3}}>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 2}}>
                        Nazwa grupy
                    </Typography>
                    <TextField
                        fullWidth
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Wprowadź nazwę grupy"
                        sx={{mb: 3}}
                    />

                    <Typography variant="h6" sx={{mb: 2}}>
                        Kolor grupy
                    </Typography>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                        <input
                            type="color"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            style={{
                                width: '80px',
                                height: '48px',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                            }}
                        />
                        <TextField
                            value={selectedColor}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^#[0-9A-F]{0,6}$/i.test(value)) {
                                    setSelectedColor(value);
                                }
                            }}
                            placeholder="#9042fb"
                            sx={{flex: 1}}
                            inputProps={{
                                maxLength: 7,
                            }}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        onClick={handleSaveSettings}
                        disabled={saving || !groupName.trim()}
                        fullWidth
                        sx={{
                            borderRadius: 2,
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                        }}
                    >
                        {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                    </Button>
                </CardContent>
            </Card>

            <Card sx={{borderRadius: 3, border: '1px solid #f44336'}}>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1, color: 'error.main'}}>
                        Strefa niebezpieczna
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                        Usunięcie grupy jest nieodwracalne. Wszystkie wydarzenia i dane zostaną trwale usunięte.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Trash2 size={20}/>}
                        onClick={() => setDeleteDialogOpen(true)}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                        }}
                    >
                        Usuń grupę
                    </Button>
                </CardContent>
            </Card>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Usunąć grupę?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Czy na pewno chcesz usunąć grupę &ldquo;{groupData.name}&rdquo;? Ta operacja jest nieodwracalna.
                        Wszystkie wydarzenia i dane grupy zostaną trwale usunięte.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Anuluj
                    </Button>
                    <Button onClick={handleDeleteGroup} color="error" variant="contained">
                        Usuń grupę
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}