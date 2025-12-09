export interface Group {
    id: string;
    name: string;
    color: string;
}

export interface GroupCreate {
    name: string;
    color: string;
}

export interface GroupUpdate {
    name: string | null;
    color: string | null;
}