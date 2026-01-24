import {useState} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import {ArrowLeft, CreditCard, Smartphone} from 'lucide-react';
import {ExpenseBeneficiaryDto, ExpenseResponseDto} from '@/lib/types/expense';
import {User} from '@/lib/types/user';

interface ExpenseFormProps {
    members: User[];
    currentUserId: string;
    groupColor: string;
    editingExpense?: ExpenseResponseDto | null;
    onSave: (expense: Omit<ExpenseResponseDto, 'id' | 'groupId' | 'createdAt'>) => void;
    onCancel: () => void;
}

function formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} zł`;
}

export default function ExpenseFormComponent({
                                        members,
                                        currentUserId,
                                        groupColor,
                                        editingExpense,
                                        onSave,
                                        onCancel,
                                    }: ExpenseFormProps) {
    const [title, setTitle] = useState(editingExpense?.title || '');
    const [amount, setAmount] = useState(editingExpense?.amount.toString() || '');
    const [paidBy, setPaidBy] = useState(editingExpense?.paidByUser.id || currentUserId);
    const [phoneNumber, setPhoneNumber] = useState(editingExpense?.phoneNumber || '');
    const [bankAccount, setBankAccount] = useState(editingExpense?.bankAccount || '');
    const [isEvenSplit, setIsEvenSplit] = useState(editingExpense?.isEvenSplit ?? true);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>(() => {
        if (editingExpense?.beneficiaries) {
            return editingExpense.beneficiaries
                .map(b => b.UserId)
                .filter(id => id && id.trim() !== '');
        }
        return [currentUserId];
    });
    const [customShares, setCustomShares] = useState<Record<string, string>>(() => {
        if (editingExpense && !editingExpense.isEvenSplit) {
            const shares: Record<string, string> = {};
            editingExpense.beneficiaries.forEach(b => {
                shares[b.UserId] = (b.Share || 0).toString();
            });
            return shares;
        }
        return {};
    });

    const handleToggleParticipant = (userId: string) => {
        if (selectedParticipants.includes(userId)) {
            setSelectedParticipants(selectedParticipants.filter((id) => id !== userId));
        } else {
            setSelectedParticipants([...selectedParticipants, userId]);
        }
    };

    const handleSubmit = () => {
        const amountNum = parseFloat(amount);
        if (!title.trim() || !amountNum || selectedParticipants.length === 0) return;

        const validParticipants = selectedParticipants.filter(id => id && id.trim() !== '');

        if (validParticipants.length === 0) return;

        let beneficiaries: ExpenseBeneficiaryDto[];

        if (isEvenSplit) {
            const perPerson = amountNum / validParticipants.length;
            beneficiaries = validParticipants.map((userId) => {
                const member = members.find((m) => m.id === userId);
                if (!member) return null;
                return {
                    UserId: userId,
                    User: member,
                    Share: Math.round(perPerson * 100) / 100,
                };
            }).filter(Boolean) as ExpenseBeneficiaryDto[];
        } else {
            beneficiaries = validParticipants.map((userId) => {
                const member = members.find((m) => m.id === userId);
                if (!member) return null;
                return {
                    UserId: userId,
                    User: member,
                    Share: parseFloat(customShares[userId] || '0'),
                };
            }).filter(Boolean) as ExpenseBeneficiaryDto[];
        }

        const paidByMember = members.find((m) => m.id === paidBy);

        if (!paidByMember) return;

        onSave({
            title,
            amount: amountNum,
            paidByUser: paidByMember,
            phoneNumber: phoneNumber || undefined,
            bankAccount: bankAccount || undefined,
            isEvenSplit,
            beneficiaries,
        });
    };

    const totalCustom = Object.values(customShares).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const isCustomValid = !isEvenSplit ? Math.abs(totalCustom - parseFloat(amount || '0')) < 0.01 : true;

    return (
        <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
            <Box sx={{maxWidth: 800, mx: 'auto'}}>
                <Button startIcon={<ArrowLeft/>} onClick={onCancel} sx={{mb: 3, bgcolor: groupColor}}>
                    Powrót
                </Button>

                <Typography variant="h4" sx={{mb: 4, fontWeight: 600}}>
                    {editingExpense ? 'Edytuj wydatek' : 'Nowy wydatek'}
                </Typography>

                <Card sx={{borderRadius: 3, p: 3, mb: 3}}>
                    <TextField fullWidth label="Tytuł wydatku" value={title} onChange={(e) => setTitle(e.target.value)}
                               sx={{
                                   mb: 2,
                                   '& .MuiOutlinedInput-root': {
                                       borderRadius: 3,
                                       '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                           borderColor: groupColor,
                                       },
                                       '&:hover .MuiOutlinedInput-notchedOutline': {
                                           borderColor: groupColor,
                                       },
                                   }
                               }}/>

                    <TextField
                        fullWidth
                        label="Kwota"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        InputProps={{
                            endAdornment: <Typography sx={{ml: 1}}>zł</Typography>,
                        }}
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: groupColor,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: groupColor,
                                },
                            }
                        }}
                    />

                    <FormControl fullWidth sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: groupColor,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: groupColor,
                            },
                        }
                    }}>
                        <InputLabel>Kto zapłacił?</InputLabel>
                        <Select value={paidBy} label="Kto zapłacił?" onChange={(e) => setPaidBy(e.target.value)}>
                            {members.map((member) => (
                                <MenuItem key={member.id} value={member.id}>
                                    {member.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Numer telefonu (opcjonalnie)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        InputProps={{
                            startAdornment: <Smartphone size={20} style={{marginRight: 8}}/>,
                        }}
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: groupColor,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: groupColor,
                                },
                            }
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Numer konta (opcjonalnie)"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        InputProps={{
                            startAdornment: <CreditCard size={20} style={{marginRight: 8}}/>,
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: groupColor,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: groupColor,
                                },
                            }
                        }}
                    />
                </Card>

                <Card sx={{borderRadius: 3, p: 3, mb: 3}}>
                    <Typography variant="h6" sx={{mb: 2}}>
                        Uczestnicy
                    </Typography>

                    {members.map((member) => (
                        <Box key={member.id} sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                            <Checkbox
                                checked={selectedParticipants.includes(member.id)}
                                onChange={() => handleToggleParticipant(member.id)}
                                sx={{'&.Mui-checked': {color: groupColor}}}
                            />
                            <Avatar sx={{width: 32, height: 32, mr: 1}}>{member.name[0]}</Avatar>
                            <Typography>{member.name}</Typography>
                        </Box>
                    ))}
                </Card>

                <Card sx={{borderRadius: 3, p: 3, mb: 3}}>
                    <Typography variant="h6" sx={{mb: 2}}>
                        Podział kwoty
                    </Typography>

                    <RadioGroup value={isEvenSplit ? 'Equal' : 'Custom'}
                                onChange={(e) => setIsEvenSplit(e.target.value === 'Equal')}>
                        <FormControlLabel
                            value="Equal"
                            control={<Radio sx={{'&.Mui-checked': {color: groupColor}}}/>}
                            label="Równo między wszystkich"
                        />
                        <FormControlLabel
                            value="Custom"
                            control={<Radio sx={{'&.Mui-checked': {color: groupColor}}}/>}
                            label="Własne kwoty"
                        />
                    </RadioGroup>

                    {isEvenSplit && selectedParticipants.length > 0 && amount && (
                        <Alert severity="info" sx={{mt: 2}}>
                            Każda osoba: {formatCurrency(parseFloat(amount) / selectedParticipants.length)}
                        </Alert>
                    )}

                    {!isEvenSplit && (
                        <Box sx={{mt: 2}}>
                            {selectedParticipants.map((userId) => {
                                const member = members.find((m) => m.id === userId);
                                return (
                                    <TextField
                                        key={userId}
                                        fullWidth
                                        label={member?.name}
                                        type="number"
                                        value={customShares[userId] || ''}
                                        onChange={(e) => setCustomShares({...customShares, [userId]: e.target.value})}
                                        InputProps={{
                                            endAdornment: <Typography sx={{ml: 1}}>zł</Typography>,
                                        }}
                                        sx={{
                                            mb: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: groupColor,
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: groupColor,
                                                },
                                            }
                                        }}
                                    />
                                );
                            })}
                            {!isCustomValid && (
                                <Alert severity="error" sx={{mt: 1}}>
                                    Suma kwot ({formatCurrency(totalCustom)}) nie zgadza się z całkowitą kwotą
                                    ({formatCurrency(parseFloat(amount || '0'))})
                                </Alert>
                            )}
                        </Box>
                    )}
                </Card>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={!title.trim() || !amount || selectedParticipants.length === 0 || !isCustomValid}
                    sx={{bgcolor: groupColor}}
                >
                    {editingExpense ? 'Zapisz zmiany' : 'Dodaj wydatek'}
                </Button>
            </Box>
        </Box>
    );
}

