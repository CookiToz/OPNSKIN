"use client";

import React, { createContext, useContext } from "react";
import useSWR from "swr";

type User = {
  loggedIn: boolean;
  steamId?: string;
  name?: string;
  avatar?: string;
  profileUrl?: string;
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR<User>("/api/users/me", fetcher, {
    dedupingInterval: 30000, // 30s cache
    revalidateOnFocus: false,
  });

  return (
    <UserContext.Provider
      value={{
        user: data ?? null,
        isLoading,
        isError: !!error,
        refetch: () => mutate(),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
} 