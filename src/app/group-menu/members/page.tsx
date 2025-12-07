"use client";
import MembersList from '@/components/pages/Members-list';
import { Box, IconButton } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import GroupMenuHeader from '@/components/layout/Group-menu-header';
import { Users } from 'lucide-react';


export default function MembersPage() {
    const searchParams = useSearchParams();
    const theme = useTheme();
    const groupId = searchParams?.get('groupId') ?? '';
    const groupNameParam = searchParams?.get('groupName') ?? '';
    const groupColorParam = searchParams?.get('groupColor') ?? '#9042fb';

    const groupName = groupNameParam ? decodeURIComponent(groupNameParam) : '?';
    const groupColor = groupColorParam ? decodeURIComponent(groupColorParam) : theme.palette.primary.main;

    return (
        <Box sx={{ width: '100%', minHeight: '100vh' }}>
            <GroupMenuHeader
                title={
                    <>
                        {groupName ? `Członkowie grupy ` : 'Lista członków'}
                        <span style={{ color: groupColor || 'white', fontWeight: 700 }}>{groupName}</span>
                    </>
                }
                groupId={groupId}
                groupName={groupName}
                groupColor={groupColor}
                leftIcon={<IconButton>
                    <Users size={35} color="white" />
                </IconButton>}
            />

            <Box sx={{ maxWidth: 900, width: '100%', mx: 'auto', px: 2, pb: 6 }}>
                <MembersList groupId={groupId || null} groupName={groupName} groupColor={groupColor} />
            </Box>
        </Box>
    );
}
