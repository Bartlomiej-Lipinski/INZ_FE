export type UserRole = 'Admin' | 'Member';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  surname: string;
  birthDate: Date;
  status: string;
  description: string;
  photo: string;
  role: UserRole;
}
