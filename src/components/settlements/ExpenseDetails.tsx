import {Avatar, Box, Button, Card, CardContent, Chip, Typography} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {ArrowLeft, CreditCard, Edit2, Smartphone, Trash2} from 'lucide-react';
import {ExpenseResponseDto} from '@/lib/types/expense';
import {useImageUrl} from "@/hooks/useImageUrl";

interface ExpenseDetailsProps {
    expense: ExpenseResponseDto;
    groupColor: string;
    currentUserId: string;
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => void;
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

export default function ExpenseDetails({
                                           expense,
                                           groupColor,
                                           onBack,
                                           onEdit,
                                           onDelete,
                                           currentUserId
                                       }: ExpenseDetailsProps) {
    return (
        <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
            <Box sx={{maxWidth: 800, mx: 'auto'}}>
                <Button startIcon={<ArrowLeft/>} onClick={onBack} sx={{mb: 3, bgcolor: groupColor}}>
                    Powrót
                </Button>

                <Card sx={{borderRadius: 3, mb: 3}}>
                    <CardContent sx={{p: 3}}>
                        <Typography variant="h4" sx={{fontWeight: 600, mb: 1}}>
                            {expense.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                            {formatDate(expense.createdAt)}
                        </Typography>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3,
                            p: 2,
                            bgcolor: alpha('#2196f3', 0.1),
                            borderRadius: 2
                        }}>
                            <Typography variant="h6">Całkowita kwota</Typography>
                            <Typography variant="h4" sx={{fontWeight: 700, color: '#2196f3'}}>
                                {formatCurrency(expense.amount)}
                            </Typography>
                        </Box>

                        <Typography variant="h6" sx={{mb: 2}}>
                            Zapłacił/a
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 3,
                            p: 2,
                            bgcolor: alpha('#10b981', 0.1),
                            borderRadius: 2
                        }}>
                            <UserAvatar user={expense.paidByUser} size={24}/>
                            <Box sx={{flex: 1}}>
                                <Typography variant="h6" sx={{fontWeight: 600}}>
                                    {expense.paidByUser.name} {expense.paidByUser.surname}
                                </Typography>
                                {expense.phoneNumber && (
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 0.5}}>
                                        <Smartphone size={16}/>
                                        <Typography variant="body2" color="text.secondary">
                                            {expense.phoneNumber}
                                        </Typography>
                                    </Box>
                                )}
                                {expense.bankAccount && (
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 0.5}}>
                                        <CreditCard size={16}/>
                                        <Typography variant="body2" color="text.secondary"
                                                    sx={{fontFamily: 'monospace'}}>
                                            {expense.bankAccount}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        <Typography variant="h6" sx={{mb: 2}}>
                            Uczestnicy ({expense.beneficiaries.length})
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                            {expense.beneficiaries.map((beneficiary) => (
                                <Box
                                    key={beneficiary.userId}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        bgcolor: alpha('#000', 0.03),
                                        borderRadius: 2,
                                    }}
                                >
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                        <UserAvatar user={beneficiary.user} size={24}/>
                                        <Typography variant="body1">
                                            {beneficiary.user ? `${beneficiary.user.name} ${beneficiary.user.surname}`.trim() : 'Nieznany użytkownik'}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{fontWeight: 600}}>
                                        {formatCurrency(beneficiary.share || 0)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        <Chip label={expense.isEvenSplit ? 'Podział równy' : 'Podział niestandardowy'} sx={{mt: 3}}/>
                    </CardContent>
                </Card>

                {expense.paidByUser.id === currentUserId && (
                <Box sx={{display: 'flex', gap: 2}}>
                    <Button
                        startIcon={<Edit2 size={20}/>}
                        fullWidth
                        onClick={onEdit}
                        sx={{bgcolor: groupColor}}
                    >
                        Edytuj
                    </Button>
                    <Button
                        color="error"
                        startIcon={<Trash2 size={20}/>}
                        fullWidth
                        sx={{bgcolor: 'error.main'}}
                        onClick={onDelete}
                    >
                        Usuń
                    </Button>
                </Box>
                )}
            </Box>
        </Box>
    );
}

 