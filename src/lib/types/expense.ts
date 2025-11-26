export interface ExpenseCreate {
    paidByUserId: string;
    title: string;
    amount: number;
    phoneNumber: string;
    bankAccount: string;
    isEvenSplit: boolean;
    beneficiaries: [{
        userId: string;
        share: number;
    }];
}