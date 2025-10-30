import { useMutation } from "@tanstack/react-query";
import type { SignInValues } from "../utils/schema";
import { signIn } from "../api/signIn";

export const useSignIn = () => {
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (data: SignInValues) => signIn(data),
  });

  return {
    mutate,
    isPending,
    isError,
    error,
  };
};