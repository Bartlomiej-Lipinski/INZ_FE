export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  surname: string;
  birthDate: Date;
  status: string | null;
  description: string | null;
  photo: string | null;
  role?: 'Member';
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
  name: string | null;
  surname: string | null;
  username: string | null;
  status: string | null;
  description: string | null;
  birthDate: Date | null;
}

