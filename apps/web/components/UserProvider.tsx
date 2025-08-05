"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import useSWR from "swr";

type User = {
  id?: string;
  loggedIn: boolean;
  steamId?: string;
  name?: string;
  avatar?: string;
  profileUrl?: string;
  tradeUrl?: string;
  walletBalance?: number;
  offersCount?: number;
  transactionsCount?: number;
  unreadNotificationsCount?: number;
  isAdmin?: boolean;
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
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { data, error, isLoading, mutate } = useSWR<any>("/api/users/me", fetcher, {
    dedupingInterval: 30000, // 30s cache
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0, // Pas de retry automatique
  });

  // Correction : on prend data.user si loggedIn, sinon null
  const user: User | null = data && data.loggedIn && data.user ? { loggedIn: true, ...data.user } : null;

  // Marquer comme initialisé après le premier rendu
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Ne pas afficher de loading si c'est la première fois
  const shouldShowLoading = isLoading && isInitialized;

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading: shouldShowLoading,
        isError: !!error && isInitialized,
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