import {Avatar, Box, Button, Card, CardContent, Typography} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {ArrowLeft, Check} from 'lucide-react';

interface OptimizedDebt {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    amount: number;
    relatedExpenses: string[];
}

interface DebtListProps {
    myDebts: OptimizedDebt[];
    myCredits: OptimizedDebt[];
    groupColor: string;
    onBack: () => void;
    onMarkAsPaid: (debt: OptimizedDebt) => void;
}

function formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} zł`;
}

export default function DebtList({myDebts, myCredits, groupColor, onBack, onMarkAsPaid}: DebtListProps) {
    return (
        <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
            <Box sx={{maxWidth: 800, mx: 'auto'}}>
                <Button startIcon={<ArrowLeft/>} onClick={onBack} sx={{mb: 3, bgcolor: groupColor}}>
                    Powrót
                </Button>

                <Typography variant="h4" sx={{mb: 4, fontWeight: 600}}>
                    Moje należności
                </Typography>

                {myDebts.length === 0 ? (
                    <Card sx={{borderRadius: 3, p: 4, textAlign: 'center'}}>
                        <Check size={64} style={{color: '#10b981', margin: '0 auto 16px'}}/>
                        <Typography variant="h6" sx={{mb: 1}}>
                            Wszystko opłacone!
                        </Typography>
                        <Typography color="text.secondary">Nie masz żadnych zaległych należności</Typography>
                    </Card>
                ) : (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        {myDebts.map((debt, index) => (
                            <Card key={index} sx={{borderRadius: 3}}>
                                <CardContent>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <Avatar sx={{width: 48, height: 48}}>{debt.toUserName}</Avatar>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Przelej dla
                                                </Typography>
                                                <Typography variant="h6" sx={{fontWeight: 600}}>
                                                    {debt.toUserName}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography variant="h5" sx={{fontWeight: 700, color: '#ef4444'}}>
                                            {formatCurrency(debt.amount)}
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                        Z {debt.relatedExpenses.length} {debt.relatedExpenses.length === 1 ? 'wydatku' : 'wydatków'}
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => onMarkAsPaid(debt)}
                                        sx={{bgcolor: '#10b981', '&:hover': {bgcolor: '#059669'}}}
                                    >
                                        Oznacz jako opłacone
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}

                {myCredits.length > 0 && (
                    <>
                        <Typography variant="h6" sx={{mt: 4, mb: 2, fontWeight: 600}}>
                            Należności od innych
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            {myCredits.map((credit, index) => (
                                <Card key={index} sx={{borderRadius: 3, bgcolor: alpha('#10b981', 0.1)}}>
                                    <CardContent>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <Avatar sx={{width: 48, height: 48}}>{credit.fromUserName[0]}</Avatar>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Czeka na wpłatę od
                                                    </Typography>
                                                    <Typography variant="h6" sx={{fontWeight: 600}}>
                                                        {credit.fromUserName}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Typography variant="h5" sx={{fontWeight: 700, color: '#10b981'}}>
                                                +{formatCurrency(credit.amount)}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}

