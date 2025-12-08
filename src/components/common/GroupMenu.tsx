import {Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {
    Bell,
    CheckSquare,
    ChevronRight,
    Coffee,
    DollarSign,
    Images,
    LogOut,
    MessageCircle,
    Notebook,
    PieChart,
    Settings,
    Star,
    Users
} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";

const MENU_ITEMS = [
    {key: 'news', label: 'NOWOŚCI', icon: Bell, path: '/group-menu'},
    {key: 'chat', label: 'CZAT', icon: MessageCircle, path: '/chat'},
    {key: 'events', label: 'WYDARZENIA', icon: Coffee, path: '/group-events'},
    {key: 'settlements', label: 'ROZLICZENIA', icon: DollarSign, path: '/group-settlements'},
    {key: 'recommendations', label: 'REKOMENDACJE', icon: Star, path: '/group-recommendations'},
    {key: 'challenges', label: 'WYZWANIA', icon: CheckSquare, path: '/group-challanges'},
    {key: 'albums', label: 'ALBUM', icon: Images, path: '/group-albums'},
    {key: 'study', label: 'NAUKA', icon: Notebook, path: '/group-study'},
    {key: 'polls', label: 'ANKIETY', icon: PieChart, path: '/ankiety'},
    {key: 'quizzes', label: 'QUIZY', icon: Coffee, path: '/group-quiz'},
    {key: 'members', label: 'CZŁONKOWIE', icon: Users, path: '/group-members'},
    {key: 'settings', label: 'OPCJE GRUPY', icon: Settings, path: '/group-settings'},
] as const;

interface GroupMenuProps {
    open: boolean;
    onClose: () => void;
    groupId: string;
    groupName: string;
    groupColor: string;
}

export default function GroupMenu({open, onClose, groupId, groupName, groupColor}: GroupMenuProps) {
    const router = useRouter();

    const handleMenuClick = (item: typeof MENU_ITEMS[number]) => {
        const params = new URLSearchParams({
            groupId,
            groupName,
            groupColor,
        });
        router.push(`${item.path}?${params.toString()}`);
        onClose();
    };

    const handleLogout = async () => {
        try {
            const response = await fetchWithAuth(API_ROUTES.LOGOUT, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
            });

            if (response.ok) {
                router.push('/');
            }

        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            router.push('/');
        }
        onClose();
    }

    return (
        <Drawer anchor="left" open={open} onClose={onClose}>
            <Box sx={{width: 300, p: 2, display: 'flex', flexDirection: 'column', height: '100%'}} role="presentation">
                <Typography variant="h6" sx={{mb: 2, fontWeight: 600}}>
                    Menu grupy - {groupName}
                </Typography>
                <List>
                    {MENU_ITEMS.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                            <ListItem key={item.key} disablePadding>
                                <ListItemButton
                                    onClick={() => handleMenuClick(item)}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        '&:hover': {
                                            bgcolor: alpha(groupColor, 0.1),
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        <ItemIcon size={22}/>
                                    </ListItemIcon>
                                    <ListItemText primary={item.label}/>
                                    <ChevronRight size={20}/>
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
                <Box sx={{mt: 'auto', pt: 2, borderTop: 1, borderColor: 'divider'}}>
                    <ListItemButton
                        onClick={() => {
                            handleLogout()
                        }}
                        sx={{
                            borderRadius: 1,
                            color: 'error.main',
                            '&:hover': {
                                bgcolor: alpha('#d32f2f', 0.1),
                            },
                        }}
                    >
                        <ListItemIcon>
                            <LogOut size={22} color="#d32f2f"/>
                        </ListItemIcon>
                        <ListItemText primary="WYLOGUJ"/>
                    </ListItemButton>
                </Box>
            </Box>
        </Drawer>
    );
}