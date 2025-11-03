export interface Group {
    id: string;
    name: string;
    color: string;
    // photo: string | null; // TODO: add photo
}

export interface GroupCreate {
    name: string;
    color: string;
    // photo: string | null; // TODO: add photo
}

export interface GroupUpdate {
    name: string | null;
    color: string | null;
    // photo: string | null; // TODO: add photo
}