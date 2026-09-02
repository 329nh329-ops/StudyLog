"use client";

import { createContext, useContext } from "react";
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
