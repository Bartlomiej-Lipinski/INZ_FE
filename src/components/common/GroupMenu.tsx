import {Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {
    Bell,
    CalendarDays,
    CheckSquare,
    ChevronRight,
    Coffee,
    DollarSign,
    Gamepad2,
    Images,
    MessageCircle,
    Notebook,
    PieChart,
    Settings,
    Star,
    Users
} from 'lucide-react';
import {useRouter} from 'next/navigation';

const MENU_ITEMS = [
    {key: 'news', label: 'NOWOŚCI', icon: Bell, path: '/group-board'},
    {key: 'chat', label: 'CZAT', icon: MessageCircle, path: '/group-chat'},
    {key: 'events', label: 'WYDARZENIA', icon: Coffee, path: '/group-events'},
    {key: 'calendar', label: 'KALENDARZ', icon: CalendarDays, path: '/group-calendar'},
    {key: 'settlements', label: 'ROZLICZENIA', icon: DollarSign, path: '/group-settlements'},
    {key: 'recommendations', label: 'REKOMENDACJE', icon: Star, path: '/group-recommendations'},
    {key: 'tasks', label: 'ZADANIA', icon: CheckSquare, path: '/group-tasks'},
    {key: 'albums', label: 'ALBUM', icon: Images, path: '/group-albums'},
    {key: 'games', label: 'GRY', icon: Gamepad2, path: '/group-games'},
    {key: 'study', label: 'NAUKA', icon: Notebook, path: '/group-study'},
    {key: 'polls', label: 'ANKIETY', icon: PieChart, path: '/ankiety'},
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

    return (
        <Drawer anchor="left" open={open} onClose={onClose}>
            <Box sx={{width: 300, p: 2}} role="presentation">
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
            </Box>
        </Drawer>
    );
}