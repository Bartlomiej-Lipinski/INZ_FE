import {User} from './user';

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

export interface ExpenseBeneficiaryDto {
    userId: string;
    user?: User;
    share?: number;
}

export interface ExpenseRequestDto {
    paidByUserId: string;
    title: string;
    amount: number;
    phoneNumber?: string;
    bankAccount?: string;
    isEvenSplit: boolean;
    beneficiaries: ExpenseBeneficiaryDto[];
}

export interface ExpenseResponseDto {
    id: string;
    groupId: string;
    paidByUser: User;
    title: string;
    amount: number;
    phoneNumber?: string;
    bankAccount?: string;
    isEvenSplit: boolean;
    createdAt: string;
    beneficiaries: ExpenseBeneficiaryDto[];
}

export interface SettlementResponseDto {
    id: string;
    groupId: string;
    toUser: User;
    amount: number;
}

export interface CreditResponseDto {
    amount: number;
}