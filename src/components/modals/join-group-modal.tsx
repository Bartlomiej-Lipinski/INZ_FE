import {useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    CircularProgress
} from '@mui/material';

interface JoinGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoin: (code: string) => Promise<boolean>;
}

export default function JoinGroupModal({isOpen, onClose, onJoin}: Readonly<JoinGroupModalProps>) {
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleaned = e.target.value.replaceAll(/\D/g, '').slice(0, 5);
        setJoinCode(cleaned);
        if (joinError) setJoinError(null);
    };

    const handleSubmit = async () => {
        if (joinCode.length !== 5) {
            setJoinError('Kod musi składać się z 5 cyfr');
            return;
        }
        setJoining(true);
        try {
            const ok = await onJoin(joinCode);
            if (ok) {
                setJoinCode('');
                setJoinError(null);
                onClose();
            } else {
                setJoinError('Nie udało się dołączyć. Sprawdź kod.');
            }
        } catch (err) {
            console.error('Join error:', err);
            setJoinError('Błąd sieciowy');
        } finally {
            setJoining(false);
        }
    };

    const handleCancel = () => {
        if (!joining) {
            setJoinCode('');
            setJoinError(null);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onClose={handleCancel}>
            <DialogTitle>Dołącz do grupy</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Kod dołączenia (5 cyfr)"
                    value={joinCode}
                    onChange={handleChange}
                    slotProps={{input: {inputProps: {inputMode: 'numeric', pattern: String.raw`\d*`, maxLength: 5}}}}
                    fullWidth
                    helperText={joinError ?? 'Wpisz 5-cyfrowy kod otrzymany od administratora grupy.'}
                    error={Boolean(joinError)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} disabled={joining} color={"secondary"} sx={{
                    borderColor: '#ef4444',
                    color: '#fff',
                    border: '2px solid #ef4444',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ef4444',
                    '&:hover': {
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(234,7,7,0.6)',
                        boxShadow: `0 0 12px #ef4444`,
                    },
                }}>
                    Anuluj
                </Button>
                <Button onClick={handleSubmit} disabled={joining || joinCode.length !== 5} variant="contained">
                    {joining ? <CircularProgress size={18}/> : 'Dołącz'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}