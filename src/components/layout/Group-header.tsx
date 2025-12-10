"use client";

import { ReactNode, useState } from 'react';
import GroupMenu from '@/components/common/Group-menu-drawer';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { HomeIcon, Menu as MenuIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
    
type GroupHeaderProps = {
    title: ReactNode;
    wrapperSx?: SxProps<Theme>;
    titleSx?: SxProps<Theme>;
    iconButtonSx?: SxProps<Theme>;
    leftIcon?: ReactNode;
    leftIconWrapperSx?: SxProps<Theme>;
};

export default function GroupHeader({
    title,
    wrapperSx,
    titleSx,
    iconButtonSx,
    leftIcon,
    leftIconWrapperSx,
}: GroupHeaderProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const groupId = searchParams?.get('groupId') ?? '';
    const groupNameParam = searchParams?.get('groupName') ?? '';
    const groupColorParam = searchParams?.get('groupColor') ?? '';
    const groupName = groupNameParam ? decodeURIComponent(groupNameParam) : '';
    const groupColor = groupColorParam ? decodeURIComponent(groupColorParam) : theme.palette.primary.main;

    return (
        <Box
            sx={{
                width: '100%',
                position: 'relative',
                minHeight: 160,
                pt: 6,
                pb: 7,
                ...wrapperSx,
            }}
        >
            <Tooltip title="Menu" placement="right" slotProps={{tooltip: {sx: {fontSize: '14px', padding: '8px 12px'}}}}>
                <IconButton
                    onClick={() => setDrawerOpen(true)}
                    sx={{
                        position: 'absolute',
                        top: { xs: 16, sm: 32 },
                        left: { xs: 16, sm: 32 },
                        bgcolor: 'grey.400',
                        '&:hover': { bgcolor: 'grey.600' },
                        ...iconButtonSx,
                    }}
                >
                    <MenuIcon />
                </IconButton>
            </Tooltip>

            <Box
                sx={{
                    maxWidth: 900,
                    width: '100%',
                    mx: 'auto',
                    px: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: 3,
                }}
            >
                <Box
                    sx={{
                        display: {'xs': 'flex', 'sm': 'inline-flex'},
                        flexDirection: {'xs': 'column', 'sm': 'row'},
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: {'xs': 1, 'sm': 2},
                    }}
                >
                    {leftIcon ? (
                        <Box
                            sx={{
                                ...leftIconWrapperSx,
                            }}
                        >
                            {leftIcon}
                        </Box>
                    ) : null}

                    <Typography
                        variant="h2"
                        sx={{
                            color: 'text.white',
                            textAlign: 'center',
                            ...titleSx,
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
            </Box>


            <Tooltip title="Moje grupy" placement="left" slotProps={{tooltip: {sx: {fontSize: '14px', padding: '8px 12px'}}}}>
                <IconButton
                    onClick={() => router.push('/')}
                    sx={{
                        position: 'absolute',
                        top: { xs: 16, sm: 32 },
                        right: { xs: 16, sm: 32 },
                        bgcolor: 'grey.400',
                        '&:hover': { bgcolor: 'grey.600' },
                        ...iconButtonSx,
                    }}
                >
                    <HomeIcon />
                </IconButton>
            </Tooltip>

            <GroupMenu
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                groupId={groupId || ''}
                groupName={groupName}
                groupColor={groupColor}
            />
        </Box>
    );
}

