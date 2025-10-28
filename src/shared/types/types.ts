import type { LucideIcon } from "lucide-react";

export interface MenuItem {
  path: string;
  title: string;
  icon: LucideIcon | string;
  identifier: string;
}

export interface Chat {
  id: string;
  user_name: string;
  last_message: string;
  timestamp: string;
}

export type DocumentCategory = "panduan" | "uraian" | "peraturan";
