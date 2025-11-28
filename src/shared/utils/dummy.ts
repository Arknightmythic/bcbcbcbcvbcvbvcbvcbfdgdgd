import type { Chat } from "../types/types";

export const DummyChats: {
  queue: Chat[];
  active: Chat[];
  history: Chat[];
  pending: Chat[];
} = {
  queue: [
    {
      id: "q1",
      user_name: "Antrian User 1",
      last_message: "",
      timestamp: new Date().toISOString(),
      channel: "web",
    },
    {
      id: "q2",
      user_name: "Antrian User 2",
      last_message: "",
      timestamp: new Date().toISOString(),
      channel: "whatsapp",
    },
  ],
  active: [
    {
      id: "a1",
      user_name: "User Aktif",
      last_message: "",
      timestamp: new Date().toISOString(),
      channel: "web",
    },
  ],
  history: [
    {
      id: "h1",
      user_name: "User Riwayat",
      last_message: "",
      timestamp: new Date().toISOString(),
      channel: "email",
    },
  ],
  pending: [],
};