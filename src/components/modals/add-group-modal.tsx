"use client";

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    Box,
    IconButton,
    Typography,
} from '@mui/material';
import { X } from 'lucide-react';

interface AddGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, color: string) => void;
}

export function AddGroupModal({ isOpen, onClose, onAdd }: AddGroupModalProps) {
    const [groupName, setGroupName] = useState('');
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(100);
    const lightness = 50;

    const selectedColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (groupName.trim()) {
            onAdd(groupName, selectedColor);
            setGroupName('');
            setHue(0);
            setSaturation(100);
            onClose();
        }
    };

    const handleColorWheelClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = e.clientX - rect.left - centerX;
        const y = e.clientY - rect.top - centerY;

        const distance = Math.sqrt(x * x + y * y);
        const maxRadius = centerX;

        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle = (angle + 90 + 360) % 360;

        const sat = Math.min(100, (distance / maxRadius) * 100);

        setHue(angle);
        setSaturation(sat);
    };

    const markerRadius = (saturation / 100) * 110;
    const markerAngle = (hue - 90) * (Math.PI / 180);
    const markerX = Math.cos(markerAngle) * markerRadius;
    const markerY = Math.sin(markerAngle) * markerRadius;

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    },
                },
            }}
        >
            <Box sx={{ borderTop: `4px solid ${selectedColor}`, position: 'relative' }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'text.secondary',
                        '&:hover': { color: 'text.primary' },
                    }}
                >
                    <X size={20} />
                </IconButton>

                <DialogTitle sx={{ pb: 2 }}>Dodaj nową grupę</DialogTitle>

                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Nazwa grupy"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Wpisz nazwę grupy"
                            required
                            sx={{ mb: 3 }}
                        />

                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Wybierz kolor
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                            <Box
                                onClick={handleColorWheelClick}
                                sx={{
                                    width: 240,
                                    height: 240,
                                    borderRadius: '50%',
                                    background: `
                                        radial-gradient(circle, white 0%, transparent 50%),
                                        conic-gradient(
                                            hsl(0, 100%, 50%),
                                            hsl(60, 100%, 50%),
                                            hsl(120, 100%, 50%),
                                            hsl(180, 100%, 50%),
                                            hsl(240, 100%, 50%),
                                            hsl(300, 100%, 50%),
                                            hsl(360, 100%, 50%)
                                        )
                                    `,
                                    cursor: 'pointer',
                                    position: 'relative',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        backgroundColor: selectedColor,
                                        border: '3px solid white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                        top: '50%',
                                        left: '50%',
                                        transform: `translate(-50%, -50%) translate(${markerX}px, ${markerY}px)`,
                                        pointerEvents: 'none',
                                    }}
                                />
                            </Box>

                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    backgroundColor: selectedColor,
                                    mt: 3,
                                    border: '3px solid',
                                    borderColor: 'divider',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={onClose}
                                sx={{
                                    borderColor: '#ef4444',
                                    color: '#fff',
                                    border: '2px solid #ef4444',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: 'transparent',
                                    '&:hover': {
                                        borderColor: '#ef4444',
                                        backgroundColor: 'rgba(234,7,7,0.6)',
                                        boxShadow: `0 0 12px #ef4444`,
                                    },
                                }}
                            >
                                Anuluj
                            </Button>

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                sx={{
                                    backgroundColor: 'transparent',
                                    color: '#fff',
                                    border: '2px solid transparent',
                                    borderColor: selectedColor,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: selectedColor,
                                        filter: 'brightness(1.1)',
                                        borderColor: selectedColor,
                                        boxShadow: `0 0 12px ${selectedColor}`,
                                    },
                                }}
                            >
                                Dodaj grupę
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Box>
        </Dialog>
    );
}