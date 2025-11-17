// src/pages/config/users/types.ts (opcional) 
export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | string;
  isSuperUser: boolean;
  createdAt?: string;
  updatedAt?: string;
};
