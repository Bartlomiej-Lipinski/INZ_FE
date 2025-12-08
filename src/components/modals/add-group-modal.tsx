"use client";

import React, {useEffect, useState} from 'react';
import {Box, Button, Dialog, DialogContent, DialogTitle, IconButton, TextField, Typography,} from '@mui/material';
import {X} from 'lucide-react';

interface AddGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, color: string) => void;
    mode?: 'add' | 'update';
    initialGroupName?: string;
    initialColor?: string;
}

export function AddGroupModal({
    isOpen,
    onClose,
    onAdd,
    mode = 'add',
    initialGroupName,
    initialColor,
}: AddGroupModalProps) {
    const [groupName, setGroupName] = useState('');
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(100);
    const [lightness, setLightness] = useState(50);
    const isUpdateMode = mode === 'update';

    const hslToHex = (h: number, s: number, l: number): string => {
        const hDecimal = h / 360;
        const sDecimal = s / 100;
        const lDecimal = l / 100;

        let r, g, b;
        if (s === 0) {
            r = g = b = lDecimal;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = lDecimal < 0.5 ? lDecimal * (1 + sDecimal) : lDecimal + sDecimal - lDecimal * sDecimal;
            const p = 2 * lDecimal - q;
            r = hue2rgb(p, q, hDecimal + 1/3);
            g = hue2rgb(p, q, hDecimal);
            b = hue2rgb(p, q, hDecimal - 1/3);
        }

        const toHex = (x: number) => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const hexToHsl = (hexColor: string) => {
        const normalized = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
        if (!/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(normalized)) {
            return null;
        }

        const hex = normalized.length === 3
            ? normalized.split('').map((char) => char + char).join('')
            : normalized;

        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (delta !== 0) {
            s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / delta + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / delta + 2;
                    break;
                case b:
                    h = (r - g) / delta + 4;
                    break;
            }

            h *= 60;
        }

        return {
            h: h % 360,
            s: s * 100,
            l: l * 100,
        };
    };

    const selectedColor = hslToHex(hue, saturation, lightness);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (groupName.trim()) {
            onAdd(groupName, selectedColor);
            setGroupName('');
            setHue(0);
            setSaturation(70);
            setLightness(50);
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

    useEffect(() => {
        if (!isUpdateMode || !isOpen) {
            return;
        }

        setGroupName(initialGroupName ?? '');

        if (initialColor) {
            const hsl = hexToHsl(initialColor);
            if (hsl) {
                setHue(hsl.h);
                setSaturation(hsl.s);
                setLightness(hsl.l);
            }
        }
    }, [initialColor, initialGroupName, isOpen, isUpdateMode]);

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

                <DialogTitle sx={{ pb: 2 }}>
                    {isUpdateMode ? 'Zmiana danych grupy' : 'Nowa grupa'}
                </DialogTitle>

                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Nazwa grupy"
                            value={groupName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
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
                                {isUpdateMode ? 'Zapisz' : 'Dodaj grupę'}
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Box>
        </Dialog>
    );
}