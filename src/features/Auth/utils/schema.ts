import { z } from 'zod';

// Skema validasi untuk form login
export const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Mengekstrak tipe TypeScript dari skema Zod
export type SignInValues = z.infer<typeof signInSchema>;