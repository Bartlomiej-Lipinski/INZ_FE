"use client";
import MembersList from '@/components/pages/Members-list';
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';


export default function MembersPage() {
    const [groupName, setGroupName] = useState<string>('');
    const [groupId, setGroupId] = useState<string | null>(null);
    const [groupColor, setGroupColor] = useState<string>('');

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const storedGroupName = localStorage.getItem('groupName') ?? '';
        const storedGroupId = localStorage.getItem('groupId');
        const storedGroupColor = localStorage.getItem('groupColor') ?? '';

        setGroupId(storedGroupId);
        setGroupColor(storedGroupColor);
        setGroupName(storedGroupName);

    }, []);


    return (
    <Box>   
        <Typography
        sx={{
            color: 'text.white',
            fontSize: '24px',
            fontWeight: 500,
            mb: 7,
            mt: 8,
            textAlign: 'center',
            mx: 'auto',
            width: '80%',
        }}
        >
            {groupName ? `Członkowie grupy ` : 'Lista członków'}
            <span style={{ color: groupColor ? groupColor : 'white', fontWeight: 700 }}>{groupName}</span>
            </Typography>
        <MembersList groupId={groupId ?? null} groupColor={groupColor}/>
    </Box>
    );
}

