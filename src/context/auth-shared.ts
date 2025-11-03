import React from 'react';

export type User = {
  name: string;
  email: string;
  avatar?: string | null;
  role?: string;
  session?: string;
  playerType?: string;
  semester?: string;
  paymentMethod?: string;
  paymentNumber?: string;
  transactionId?: string;
};

export type Credentials = { email: string; password: string };

export type AuthContextValue = {
  user: User | null;
  login: (c: Credentials) => Promise<User>;
  register: (u: { name: string; email: string; password: string; avatar?: string; playerType?: string; semester?: string; paymentMethod?: string; paymentNumber?: string; transactionId?: string; session?: string }) => Promise<User>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
};

export const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);
