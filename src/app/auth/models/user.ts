import { Role } from './role';

export class User {
  id: number;
  employeenumber: number;
  email: string; 
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: Role;
  token?: string;
}
