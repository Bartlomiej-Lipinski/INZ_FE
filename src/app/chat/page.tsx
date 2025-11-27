'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {HubConnection, HubConnectionBuilder, LogLevel} from '@microsoft/signalr';
import {Box, Button, List, ListItem, ListItemText, Paper, TextField, Typography} from '@mui/material';
import {useSearchParams} from 'next/navigation';

type ChatMessage = {
    id: string;
    user: string;
    content: string;
    timestamp: string;
};

const HUB_URL = process.env.NEXT_PUBLIC_SIGNALR_URL ?? '';

export default function ChatPage() {
    const searchParams = useSearchParams();
    const groupId = searchParams.get('groupId');
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState('');
    const [userName] = useState(() => `user-${Math.floor(Math.random() * 10000)}`);

    useEffect(() => {
        if (!HUB_URL) {
            console.error('Brak adresu SignalR (NEXT_PUBLIC_SIGNALR_URL).');
            return;
        }

        const hubConnection = new HubConnectionBuilder()
            .withUrl(groupId ? `${HUB_URL}?groupId=${encodeURIComponent(groupId)}` : HUB_URL)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        hubConnection.on('ReceiveMessage', (payload: ChatMessage) => {
            setMessages((prev) => [...prev, payload]);
        });

        hubConnection
            .start()
            .then(() => {
                setConnection(hubConnection);
                if (groupId) {
                    hubConnection.invoke('JoinGroup', groupId).catch(console.error);
                }
            })
            .catch(console.error);

        return () => {
            hubConnection.stop().catch(console.error);
        };
    }, [groupId]);

    const sortedMessages = useMemo(
        () => [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
        [messages],
    );

    const handleSend = async () => {
        if (!connection || !message.trim()) return;
        try {
            await connection.invoke('SendMessage', {
                groupId,
                content: message.trim(),
                user: userName,
            });
            setMessage('');
        } catch (err) {
            console.error('SendMessage error:', err);
        }
    };

    return (
        <Box sx={{maxWidth: 600, mx: 'auto', mt: 4, display: 'flex', flexDirection: 'column', gap: 2}}>
            <Typography variant="h5" textAlign="center">
                chat grupowy
            </Typography>

            <Paper sx={{flex: 1, maxHeight: 480, overflowY: 'auto', p: 2}}>
                {sortedMessages.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Brak wiadomości.
                    </Typography>
                ) : (
                    <List dense>
                        {sortedMessages.map((msg) => (
                            <ListItem key={msg.id}>
                                <ListItemText
                                    primary={`${msg.user}: ${msg.content}`}
                                    secondary={new Date(msg.timestamp).toLocaleTimeString()}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>

            <Box component="form" onSubmit={(e) => {
                e.preventDefault();
                handleSend();
            }} sx={{display: 'flex', gap: 2}}>
                <TextField
                    fullWidth
                    placeholder="Wpisz wiadomość..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={!connection}
                />
                <Button variant="contained" onClick={handleSend} disabled={!connection || !message.trim()}>
                    Wyślij
                </Button>
            </Box>
        </Box>
    );
}