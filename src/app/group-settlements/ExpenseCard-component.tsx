import {Avatar, Box, Card, CardContent, Chip, Typography} from '@mui/material';
import {ExpenseResponseDto} from '@/lib/types/expense';
import {useImageUrl} from "@/hooks/useImageUrl";

interface ExpenseCardProps {
    expense: ExpenseResponseDto;
    onClick: () => void;
}

function formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} zł`;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function UserAvatar({user, size, groupColor}: { user: any; size: number; groupColor?: string }) {
    const avatarUrl = useImageUrl(user.profilePicture?.id);
    const displayName = `${user.name} ${user.surname}`.trim() || user.username;

    return (
        <Avatar
            src={avatarUrl || undefined}
            title={displayName}
            sx={{
                width: size,
                height: size,
                bgcolor: groupColor || 'grey.500'
            }}
        >
            {user.name?.[0]?.toUpperCase() || '?'}
        </Avatar>
    );
}

export default function ExpenseCardComponent({expense, onClick}: ExpenseCardProps) {
    return (
        <Card
            sx={{
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {transform: 'translateY(-2px)'},
            }}
            onClick={onClick}
        >
            <CardContent>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2}}>
                    <Box sx={{flex: 1}}>
                        <Typography variant="h6" sx={{fontWeight: 600, mb: 0.5}}>
                            {expense.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {formatDate(expense.createdAt)}
                        </Typography>
                    </Box>
                    <Typography variant="h5" sx={{fontWeight: 700, color: '#2196f3'}}>
                        {formatCurrency(expense.amount)}
                    </Typography>
                </Box>

                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <UserAvatar user={expense.paidByUser} size={24}/>
                        <Typography variant="body2">
                            Zapłacił/a: {expense.paidByUser.name} {expense.paidByUser.surname}
                        </Typography>
                    </Box>

                    <Chip label={`${expense.beneficiaries.length} osób`} size="small"/>
                </Box>
            </CardContent>
        </Card>
    );
}

