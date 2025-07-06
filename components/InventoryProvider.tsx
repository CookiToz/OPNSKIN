"use client";
import React, { createContext, useContext } from "react";
import useSWR from "swr";

export type InventoryItem = {
  id: string;
  name: string;
  icon: string;
  marketPrice?: number;
  [key: string]: any;
};

type InventoryContextType = {
  getInventory: (appid?: string) => {
    items: InventoryItem[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
    errorMsg?: string;
  };
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(res => res.json());

function useInventoryInternal(appid?: string) {
  const shouldFetch = !!appid;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ["/api/inventory", appid] : null,
    () => fetcher(`/api/inventory?appid=${appid}`),
    {
      dedupingInterval: 30000, // 30s cache
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );
  return {
    items: data?.items || [],
    isLoading: !!shouldFetch && isLoading,
    isError: !!shouldFetch && !!error,
    refetch: () => mutate(),
    errorMsg: data?.error || (error ? String(error) : undefined),
  };
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  // Le provider expose un getter pour chaque appid
  const getInventory = (appid?: string) => useInventoryInternal(appid);
  return (
    <InventoryContext.Provider value={{ getInventory }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory(appid?: string) {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within an InventoryProvider");
  return ctx.getInventory(appid);
} 