import { User } from './schema/user.schema';
import { UserRole } from './enum/user-role.enum';

export const isAdmin = (user: User) => user.role === UserRole.ADMIN;
export const isNotAdmin = (user: User) => !isAdmin(user);
