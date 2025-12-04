import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email({ message: "format email tidak valid" }),
  password: z.string().min(1, { message: "Sandi di perlukan" }),
});

export type SignInValues = z.infer<typeof signInSchema>;