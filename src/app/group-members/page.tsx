"use client";
import {Suspense} from 'react';
import MembersListComponent from '@/app/group-members/Members-list-component';
import {Box} from '@mui/material';
import {useSearchParams} from 'next/navigation';
import {useTheme} from '@mui/material/styles';
import GroupHeader from '@/components/layout/Group-header';
import {Users} from 'lucide-react';


function MembersPageContent() {
    const searchParams = useSearchParams();
    const theme = useTheme();
    const groupId = searchParams?.get('groupId') ?? '';
    const groupNameParam = searchParams?.get('groupName') ?? '';
    const groupColorParam = searchParams?.get('groupColor') ?? '#9042fb';

    const groupName = groupNameParam ? decodeURIComponent(groupNameParam) : '?';
    const groupColor = groupColorParam ? decodeURIComponent(groupColorParam) : theme.palette.primary.main;

    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <GroupHeader
                title={
                    <>
                        {groupName ? `Członkowie grupy ` : 'Lista członków'}
                        <span style={{color: groupColor || 'white', fontWeight: 700}}>{groupName}</span>
                    </>
                }
                leftIcon={<Users size={35} color="white"/>}
            />

            <Box sx={{maxWidth: 1000, width: '100%'}}>
                <MembersListComponent groupId={groupId} groupName={groupName} groupColor={groupColor}/>
            </Box>
        </Box>
    );
}

export default function MembersPage() {
    return (
        <Suspense fallback={<div>Ładowanie...</div>}>
            <MembersPageContent />
        </Suspense>
    );
}

