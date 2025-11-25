export interface ChallangeCreate {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    goalUnit: string;
    goalValue: number;
    isCompleted: boolean;
}