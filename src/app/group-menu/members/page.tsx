"use client";
import MembersList from '@/components/pages/Members-list';
import { Box, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';


export default function MembersPage() {
    const searchParams = useSearchParams();
    const groupId = searchParams?.get('groupId');
    const groupNameParam = searchParams?.get('groupName') ?? '';
    const groupColorParam = searchParams?.get('groupColor') ?? '';

    const groupName = groupNameParam ? decodeURIComponent(groupNameParam) : '';
    const groupColor = groupColorParam ? decodeURIComponent(groupColorParam) : '';


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
        <MembersList groupId={groupId ?? null} groupName={groupName} groupColor={groupColor}/>
    </Box>
    );
}
