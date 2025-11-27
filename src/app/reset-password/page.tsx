'use client';

import React, {useState} from 'react';
import {Box, Button, CircularProgress, TextField, Typography} from '@mui/material';
import {useRouter, useSearchParams} from 'next/navigation';
import {API_ROUTES} from '@/lib/api/api-routes-endpoints';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';

    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token) {
            setError('Brak tokenu resetującego.');
            return;
        }
        if (password !== passwordConfirm) {
            setError('Hasła muszą być identyczne.');
            return;
        }

        setError('');
        setIsSubmitting(true);
        try {
            const response = await fetch(API_ROUTES.RESET_PASSWORD, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token, password}),
            });
            if (!response.ok) {
                throw new Error('Nie udało się zresetować hasła.');
            }

            setIsSuccess(true);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                maxWidth: 400,
                mx: 'auto',
                mt: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                alignItems: 'center',
            }}
        >
            <Typography variant="h5" textAlign="center">
                Ustaw nowe hasło
            </Typography>

            {!token && (
                <Typography color="error" textAlign="center">
                    Brak tokenu w adresie URL.
                </Typography>
            )}

            {!isSuccess ? (
                <>
                    <TextField
                        label="Nowe hasło"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        required
                        disabled={!token || isSubmitting}
                    />
                    <TextField
                        label="Powtórz hasło"
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        fullWidth
                        required
                        disabled={!token || isSubmitting}
                    />
                    {error && (
                        <Typography color="error" textAlign="center">
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!token || isSubmitting}
                        sx={{minWidth: 180}}
                    >
                        {isSubmitting ? (
                            <CircularProgress size={20} thickness={4} sx={{color: 'white'}}/>
                        ) : (
                            'Zresetuj hasło'
                        )}
                    </Button>
                </>
            ) : (
                <>
                    <Typography textAlign="center" color="success.main">
                        Hasło zostało pomyślnie zmienione. Możesz się teraz zalogować.
                    </Typography>
                    <Button variant="contained" onClick={() => router.push('/')}>
                        OK
                    </Button>
                </>
            )}
        </Box>
    );
}