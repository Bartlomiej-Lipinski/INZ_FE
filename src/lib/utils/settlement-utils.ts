import {ExpenseResponseDto} from '@/lib/types/expense';

interface OptimizedDebt {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    amount: number;
    relatedExpenses: string[];
}

export function optimizeDebts(expenses: ExpenseResponseDto[]): OptimizedDebt[] {
    const balances: Record<string, { name: string; amount: number }> = {};

    // Oblicz salda dla każdego użytkownika
    expenses.forEach((expense) => {
        // Osoba która zapłaciła dostaje zwrot
        const payerId = expense.paidByUser.id;
        const payerName = `${expense.paidByUser.name} ${expense.paidByUser.surname}`.trim();

        if (!balances[payerId]) {
            balances[payerId] = {name: payerName, amount: 0};
        }
        balances[payerId].amount += expense.amount;

        // Uczestnicy są dłużni
        expense.beneficiaries.forEach((beneficiary) => {
            const userName = beneficiary.user
                ? `${beneficiary.user.name} ${beneficiary.user.surname}`.trim()
                : 'Nieznany użytkownik';

            if (!balances[beneficiary.userId]) {
                balances[beneficiary.userId] = {name: userName, amount: 0};
            }
            balances[beneficiary.userId].amount -= (beneficiary.share || 0);
        });
    });

    // Podziel na dłużników i wierzycieli
    const debtors: Array<{ userId: string; name: string; amount: number }> = [];
    const creditors: Array<{ userId: string; name: string; amount: number }> = [];

    Object.entries(balances).forEach(([userId, {name, amount}]) => {
        if (amount < -0.01) {
            debtors.push({userId, name, amount: -amount});
        } else if (amount > 0.01) {
            creditors.push({userId, name, amount});
        }
    });

    // Optymalizuj transakcje
    const optimized: OptimizedDebt[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debt = Math.min(debtors[i].amount, creditors[j].amount);

        if (debt > 0.01) {
            optimized.push({
                fromUserId: debtors[i].userId,
                fromUserName: debtors[i].name,
                toUserId: creditors[j].userId,
                toUserName: creditors[j].name,
                amount: Math.round(debt * 100) / 100,
                relatedExpenses: expenses
                    .filter(
                        (e) =>
                            e.paidByUser.id === creditors[j].userId &&
                            e.beneficiaries.some((p) => p.userId === debtors[i].userId)
                    )
                    .map((e) => e.id),
            });
        }

        debtors[i].amount -= debt;
        creditors[j].amount -= debt;

        if (debtors[i].amount < 0.01) i++;
        if (creditors[j].amount < 0.01) j++;
    }

    return optimized;
}

export function formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} zł`;
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

