export interface User {
  id: string;
  username: string | null;
  email: string;
  name: string;
  surname: string;
  birthDate: Date;
  status: string | null;
  description: string | null;
    profilePicture: {
        id: string;
    }
    isTwoFactorEnabled: boolean;
  role?: 'Member';
  isTwoFactorEnabled: boolean;
}


export interface UserCreate{
  name: string;
  surname: string;
  username: string;
  email: string;
  birthDate: string;
  password: string;
}



export interface UserUpdate{
  name: string;
  surname: string;
  username: string | null;
  status: string | null;
  description: string | null;
  birthDate: Date;
}

