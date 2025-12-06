import { ProfilePicture } from "./profile-picture";

export interface User {
  id: string;
  username: string | null;
  email: string;
  name: string;
  surname: string;
  birthDate: Date;
  status: string | null;
  description: string | null;
  profilePicture: ProfilePicture | null;
  isTwoFactorEnabled: boolean;
  role?: 'Member' | 'Admin';
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
  profilePictureId?: string | null;
}


export interface GroupMember {
  id: string;
  email: string;
  username: string;
  name: string;
  surname: string;
  birthDate: Date;
  status: string | null;
  description: string | null;
  profilePicture: ProfilePicture | null;
}
