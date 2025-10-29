export type AccountType = 'credential' | 'google' | 'microsoft';
export type ActionType = 'edit' | 'delete';

export interface User {
  id: number;
  name: string;
  email: string;
  account_type: AccountType;
  team?: string; // Tim sekarang opsional
  role?: string; // Role sekarang opsional
}

export interface Team {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  team_id: string;
}