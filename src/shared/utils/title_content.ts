import { BotIcon, Database, Dock, Headset, History, LayoutDashboard, SearchSlash, Shield, User2, Users } from "lucide-react";
import type { MenuItem } from "../types/types";

export const SidebarMenu: MenuItem[] = [
  {
    path: "/dashboard",
    title: "Dasbor",
    icon: LayoutDashboard,
    identifier: "dashboard",
  },
  {
    path: "/knowledge-base",
    title: "Basis Pengetahuan",
    icon: Database,
    identifier: "knowledge-base",
  },
  {
    path: "/document-management",
    title: "Manajemen Dokumen",
    icon: Dock,
    identifier: "document-management",
  },
  {
    path: "/public-service",
    title: "Layanan Publik",
    icon: BotIcon,
    identifier: "public-service",
  },
  {
    path: "/validation-history",
    title: "Riwayat Validasi",
    icon: History,
    identifier: "validation-history",
  },
  {
    path: "/guide",
    title: "Panduan",
    icon: SearchSlash,
    identifier: "guide",
  },
  {
    path: "/user-management",
    title: "Manajemen Pengguna",
    icon: User2,
    identifier: "user-management",
  },
  {
    path: "/team-management",
    title: "Manajemen Tim",
    icon: Users,
    identifier: "team-management",
  },
  {
    path: "/role-management",
    title: "Manajemen Peran",
    icon: Shield,
    identifier: "role-management",
  },
  {
    path: "/helpdesk",
    title: "Layanan Bantuan",
    icon: Headset,
    identifier: "helpdesk",
  },
];
