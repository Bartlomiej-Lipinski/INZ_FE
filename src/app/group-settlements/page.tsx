"use client";

import React, {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Box, Button, Card, IconButton, Typography,} from '@mui/material';
import {DollarSign, Menu, Plus, Receipt, TrendingDown, TrendingUp,} from 'lucide-react';
import {ExpenseRequestDto, ExpenseResponseDto, SettlementResponseDto} from '@/lib/types/expense';
import {User} from '@/lib/types/user';
import {formatCurrency, optimizeDebts} from '@/lib/utils/settlement-utils';
import ExpenseCard from '@/components/settlements/ExpenseCard';
import ExpenseForm from '@/components/settlements/ExpenseForm';
import ExpenseDetails from '@/components/settlements/ExpenseDetails';
import DebtList from '@/components/settlements/DebtList';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import GroupMenu from "@/components/common/Group-menu";
import {useMembers} from "@/hooks/use-members";


type ViewMode = 'list' | 'addExpense' | 'myDebts' | 'expenseDetails';

export default function SettlementsPage() {
    const searchParams = useSearchParams();
    const {fetchGroupMembers} = useMembers();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [expenses, setExpenses] = useState<ExpenseResponseDto[]>([]);
    const [settlements, setSettlements] = useState<SettlementResponseDto[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [selectedExpense, setSelectedExpense] = useState<ExpenseResponseDto | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ExpenseResponseDto | null>(null);
    const groupData = useMemo(() => {
        const groupId = searchParams?.get('groupId') || '';
        const groupName = searchParams?.get('groupName') || '';
        const groupColor = searchParams?.get('groupColor') || '#9042fb';
        return {
            id: groupId,
            name: decodeURIComponent(groupName),
            color: decodeURIComponent(groupColor),
        };
    }, [searchParams]);
    const [currentUser, setCurrentUser] = useState<{
        id: string;
        email: string;
        username: string;
        name: string;
        surname: string;
        birthDate?: string;
        status?: string;
        description?: string;
        profilePicture?: {
            id: string;
            fileName?: string;
            contentType?: string;
            size?: number;
            url?: string;
        };
        isTwoFactorEnabled?: boolean;
    } | null>(null);

    useEffect(() => {
        const userAuth = localStorage.getItem('auth:user');
        if (userAuth) {
            try {
                const userData = JSON.parse(userAuth);
                setCurrentUser({
                    id: userData.id,
                    email: userData.email,
                    username: userData.username,
                    name: userData.name,
                    surname: userData.surname,
                    birthDate: userData.birthDate,
                    status: userData.status,
                    description: userData.description,
                    profilePicture: userData.profilePicture,
                    isTwoFactorEnabled: userData.isTwoFactorEnabled,
                });
            } catch (error) {
                console.error('Błąd parsowania danych użytkownika:', error);
            }
        }
    }, []);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await fetchWithAuth(`${API_ROUTES.GET_SETTLEMENTS_FOR_GROUP}?groupId=${groupData.id}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    const payload: ExpenseResponseDto[] = data.data
                    setExpenses(payload);
                } else {
                    console.error('Błąd podczas pobierania wydatków');
                }
            } catch (error) {
                console.error('Błąd podczas pobierania wydatków:', error);
            }
        };

        if (groupData.id) {
            fetchExpenses();
        }
    }, [groupData.id]);

    useEffect(() => {
        fetchGroupMembers(groupData.id).then((response) => {
            if (response.success && response.data) {
                setMembers(response.data as User[]);
            }
        });
    }, [groupData.id, fetchGroupMembers]);

    useEffect(() => {
        const fetchSettlements = async () => {
            try {
                const response = await fetchWithAuth(`${API_ROUTES.GET_ALL_SETTLEMENTS_FOR_USER_FOR_GROUP}?groupId=${groupData.id}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setSettlements(data.data || []);
                } else {
                    console.error('Błąd podczas pobierania rozliczeń');
                }
            } catch (error) {
                console.error('Błąd podczas pobierania rozliczeń:', error);
            }
        };

        if (groupData.id) {
            fetchSettlements();
        }
    }, [groupData.id]);


    const myDebts = settlements.map((s) => ({
        id: s.id,
        amount: s.amount,
        toUserId: s.toUser.id,
        toUserName: s.toUser.name,
        fromUserId: currentUser!.id,
        fromUserName: currentUser!.name,
        relatedExpenses: [],
    }));

    const myCredits: optimizeDebts[] = [];


    const myBalance = useMemo(() => {
        let balance = 0;
        myCredits.forEach((c) => (balance += c.amount));
        myDebts.forEach((d) => (balance -= d.amount));
        return balance;
    }, [myCredits, myDebts]);

    const handleSaveExpense = async (expenseData: Omit<ExpenseResponseDto, 'id' | 'groupId' | 'createdAt'>) => {
        if (editingExpense) {
            const request: ExpenseRequestDto = {
                paidByUserId: expenseData.paidByUser.id,
                title: expenseData.title,
                amount: expenseData.amount,
                phoneNumber: expenseData.phoneNumber,
                bankAccount: expenseData.bankAccount,
                isEvenSplit: expenseData.isEvenSplit,
                beneficiaries: expenseData.beneficiaries,
            };
            try {
                const response = await fetchWithAuth(`${API_ROUTES.PUT_SPECIFIC_EXPENSE}?groupId=${groupData.id}&expenseId=${editingExpense.id}`,
                    {
                        method: 'PUT',
                        credentials: 'include',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(request),
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const localExpense: ExpenseResponseDto = {
                        id: data.expenseId,
                        groupId: editingExpense.groupId,
                        paidByUser: expenseData.paidByUser,
                        title: expenseData.title,
                        amount: expenseData.amount,
                        phoneNumber: expenseData.phoneNumber,
                        bankAccount: expenseData.bankAccount,
                        isEvenSplit: expenseData.isEvenSplit,
                        createdAt: editingExpense.createdAt,
                        beneficiaries: expenseData.beneficiaries,
                    };
                    setExpenses(expenses.map(e => e.id === editingExpense.id ? localExpense : e));
                } else {
                    throw new Error('Błąd podczas edytowania wydatku');
                }
            } catch (error) {
                console.error('Błąd podczas edytowania wydatku:', error);
            }
        } else {
            const request: ExpenseRequestDto = {
                paidByUserId: expenseData.paidByUser.id,
                title: expenseData.title,
                amount: expenseData.amount,
                phoneNumber: expenseData.phoneNumber,
                bankAccount: expenseData.bankAccount,
                isEvenSplit: expenseData.isEvenSplit,
                beneficiaries: expenseData.beneficiaries,
            };
            try {
                const response = await fetchWithAuth(`${API_ROUTES.POST_SETTLEMENTS_FOR_GROUP}?groupId=${groupData.id}`,
                    {
                        method: 'POST',
                        credentials: 'include',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(request),
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const localExpense: ExpenseResponseDto = {
                        id: data.message,
                        groupId: groupData.id,
                        paidByUser: expenseData.paidByUser,
                        title: expenseData.title,
                        amount: expenseData.amount,
                        phoneNumber: expenseData.phoneNumber,
                        bankAccount: expenseData.bankAccount,
                        isEvenSplit: expenseData.isEvenSplit,
                        createdAt: new Date().toISOString(),
                        beneficiaries: expenseData.beneficiaries,
                    };
                    setExpenses([localExpense, ...expenses]);
                } else {
                    throw new Error('Błąd podczas dodawania wydatku');
                }
            } catch (error) {
                console.error('Błąd podczas dodawania wydatku:', error);
            }
        }

        setViewMode('list');
        setEditingExpense(null);
    };

    const handleEditExpense = (expense: ExpenseResponseDto) => {
        setEditingExpense(expense);
        setViewMode('addExpense');
    };

    const handleCancelForm = () => {
        setViewMode('list');
        setEditingExpense(null);
    };

    const handleDeleteExpense = async () => {
        if (!selectedExpense) return;

        if (confirm('Czy na pewno chcesz usunąć ten wydatek?')) {
            setExpenses(expenses.filter((e) => e.id !== selectedExpense.id));
            try {
                const response = await fetchWithAuth(`${API_ROUTES.DELETE_SPECIFIC_EXPENSE}?groupId=${groupData.id}&expenseId=${selectedExpense.id}`,
                    {
                        method: 'DELETE',
                        credentials: 'include',
                    }
                );

                if (!response.ok) {
                    throw new Error('Błąd podczas usuwania wydatku');
                }
            } catch (error) {
                console.error('Błąd podczas usuwania wydatku:', error);
            }
            setViewMode('list');
            setSelectedExpense(null);
        }
    };

    const handleMarkAsPaid = async (debt: any) => {
        try {
            const response = await fetchWithAuth(`${API_ROUTES.DELETE_SPECIFIC_SETTLEMENTS_MARK_AS_PAID}?groupId=${groupData.id}&settlementId=${debt.id}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas oznaczania jako opłacone');
            }
            setSettlements(settlements.filter(s => s.id !== debt.id));
        } catch (error) {
            console.error('Błąd podczas oznaczania jako opłacone:', error);
        }
        alert(`Oznaczono jako opłacone: ${formatCurrency(debt.amount)} dla ${debt.toUserName}`);
    };

    // Lista wydatków i saldo
    if (viewMode === 'list') {
        return (
            <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
                <Box sx={{maxWidth: 1200, mx: 'auto'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 4}}>
                        <IconButton
                            onClick={() => setDrawerOpen(true)}
                            sx={{bgcolor: '#8D8C8C', '&:hover': {bgcolor: '#666666'}, mr: 1}}
                        >
                            <Menu/>
                        </IconButton>

                        <Typography
                            variant="h4"
                            sx={{
                                textAlign: 'center',
                                flex: 1,
                                fontWeight: 600,
                                fontSize: {xs: '1.75rem', sm: '2rem'},
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                            }}
                        >
                            <DollarSign size={32}/>
                            Rozliczenia
                        </Typography>
                    </Box>

                    <GroupMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} groupId={groupData.id}
                               groupName={groupData.name}
                               groupColor={groupData.color}/>

                    {/* Saldo użytkownika */}
                    <Card
                        sx={{
                            borderRadius: 3,
                            p: 3,
                            mb: 3,
                            background: myBalance >= 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                        }}
                    >
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Box>
                                <Typography variant="body2" sx={{opacity: 0.9, mb: 0.5}}>
                                    Twoje saldo
                                </Typography>
                                <Typography variant="h3" sx={{fontWeight: 700}}>
                                    {formatCurrency(Math.abs(myBalance))}
                                </Typography>
                                <Typography variant="body2" sx={{opacity: 0.9, mt: 0.5}}>
                                    {myBalance >= 0 ? 'Należy Ci się' : 'Jesteś dłużny/a'}
                                </Typography>
                            </Box>
                            {myBalance >= 0 ? <TrendingUp size={64}/> : <TrendingDown size={64}/>}
                        </Box>
                    </Card>

                    {/* Akcje */}
                    <Box sx={{display: 'flex', gap: 2, mb: 3}}>
                        <Button variant="contained" startIcon={<Plus size={20}/>}
                                onClick={() => setViewMode('addExpense')} fullWidth sx={{bgcolor: groupData.color}}>
                            Dodaj wydatek
                        </Button>
                        <Button startIcon={<Receipt size={20}/>} onClick={() => setViewMode('myDebts')} fullWidth
                                sx={{bgcolor: groupData.color}}>
                            Moje należności ({myDebts.length})
                        </Button>
                    </Box>

                    {/* Lista wydatków */}
                    <Typography variant="h6" sx={{mb: 2, fontWeight: 600}}>
                        Historia wydatków
                    </Typography>

                    {expenses.length === 0 ? (
                        <Card sx={{borderRadius: 3, p: 4, textAlign: 'center'}}>
                            <Receipt size={64} style={{opacity: 0.5, margin: '0 auto 16px'}}/>
                            <Typography variant="h6" sx={{mb: 1}}>
                                Brak wydatków
                            </Typography>
                            <Typography color="text.secondary">Dodaj pierwszy wydatek grupy</Typography>
                        </Card>
                    ) : (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            {expenses.map((expense) => (
                                <ExpenseCard
                                    key={expense.id}
                                    expense={expense}
                                    onClick={async () => {
                                        try {
                                            const response = await fetchWithAuth(`${API_ROUTES.GET_SPECIFIC_EXPENSE}?groupId=${groupData.id}&expenseId=${expense.id}`, {
                                                method: 'GET',
                                                credentials: 'include',
                                            });
                                            if (!response.ok) {
                                                console.error('Błąd podczas pobierania szczegółów wydatku');
                                                return;
                                            }
                                            setSelectedExpense(expense);
                                            setViewMode('expenseDetails');
                                        } catch (error) {
                                            console.error('Błąd podczas pobierania szczegółów wydatku:', error);
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        );
    }

    // Dodawanie/edycja wydatku
    if (viewMode === 'addExpense') {
        return (
            <ExpenseForm
                members={members}
                currentUserId={currentUser!.id}
                groupColor={groupData.color}
                editingExpense={editingExpense}
                onSave={handleSaveExpense}
                onCancel={handleCancelForm}
            />
        );
    }

    // Moje należności
    if (viewMode === 'myDebts') {
        return (
            <DebtList
                myDebts={myDebts}
                myCredits={myCredits}
                groupColor={groupData.color}
                onBack={() => setViewMode('list')}
                onMarkAsPaid={handleMarkAsPaid}
            />
        );
    }

    // Szczegóły wydatku
    if (viewMode === 'expenseDetails' && selectedExpense) {
        return (
            <ExpenseDetails
                expense={selectedExpense}
                groupColor={groupData.color}
                onBack={() => setViewMode('list')}
                onEdit={() => handleEditExpense(selectedExpense)}
                onDelete={handleDeleteExpense}
                currentUserId={currentUser!.id}
            />
        );
    }

    return null;
}

