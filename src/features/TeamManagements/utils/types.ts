export interface Team {
  id: number;
  name: string;
  user_count: number;
  access: string[];
}

export type ActionType = 'edit' | 'delete';