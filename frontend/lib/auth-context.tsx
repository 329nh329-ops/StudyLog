"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import type { User } from "@/types/auth";

const AuthContext = createContext<User | null>(null);

export const AuthProvider = AuthContext.Provider;

export function useAuthUser(): User {
  const user = useContext(AuthContext);
  if (user === null) {
    throw new Error("useAuthUser must be used within an authenticated route");
  }
  return user;
}

export function useLogout(): () => Promise<void> {
  const router = useRouter();

  return async function handleLogout() {
    await logout();
    router.replace("/login");
  };
}
