'use client';

import React from 'react';
import {Box, Button, Dialog, DialogContent, Typography} from '@mui/material';
import {AlertTriangle, CheckCircle, Info, XCircle} from 'lucide-react';

export type PopupType = 'error' | 'success' | 'warning' | 'info';

interface PopupProps {
    type?: PopupType;
    title?: string;
    message: string;
    onClose: () => void;
    confirmText?: string;
}

const popupStyles = {
    error: {
        color: '#ef4444',
        bgColor: '#fee2e2',
        buttonColor: '#ef4444',
        icon: XCircle,
    },
    success: {
        color: '#22c55e',
        bgColor: '#dcfce7',
        buttonColor: '#22c55e',
        icon: CheckCircle,
    },
    warning: {
        color: '#f59e0b',
        bgColor: '#fef3c7',
        buttonColor: '#f59e0b',
        icon: AlertTriangle,
    },
    info: {
        color: '#3b82f6',
        bgColor: '#dbeafe',
        buttonColor: '#3b82f6',
        icon: Info,
    },
};

const defaultTitles = {
    error: 'Błąd',
    success: 'Sukces',
    warning: 'Ostrzeżenie',
    info: 'Informacja',
};

export default function Popup({
                                  type = 'error',
                                  title,
                                  message,
                                  onClose,
                                  confirmText = 'Zamknij',
                              }: PopupProps) {
    const style = popupStyles[type];
    const displayTitle = title ?? defaultTitles[type];
    const IconComponent = style.icon;

    return (
        <Dialog
            open={true}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    p: 2,
                },
            }}
        >
            <DialogContent>
                <Box sx={{textAlign: 'center'}}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: style.bgColor,
                            mb: 2,
                        }}
                    >
                        <IconComponent size={32} color={style.color}/>
                    </Box>

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: '#ffffff',
                            mb: 1,
                        }}
                    >
                        {displayTitle}
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: '#ffffff',
                            mb: 3,
                        }}
                    >
                        {message}
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={onClose}
                        fullWidth
                        sx={{
                            bgcolor: style.buttonColor,
                            '&:hover': {
                                bgcolor: style.buttonColor,
                                filter: 'brightness(0.9)',
                            },
                            textTransform: 'none',
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 500,
                        }}
                    >
                        {confirmText}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}