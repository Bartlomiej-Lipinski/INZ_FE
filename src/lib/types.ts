export type UserRole = 'Admin' | 'Member';

export interface User {
  id: string;
  userName: string;
  email: string;
  name: string;
  surname: string;
  birthDate: Date;
  status: string | null;
  description: string | null;
  photo: string | null;
  role: UserRole;
}
