export interface Permission {
  id: string;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  team_name: string;
  permissions: Permission[];
}

export interface Team {
  id: string;
  name: string;
}


export type ActionType = 'view' | 'edit' | 'delete';