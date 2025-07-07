"use client";

import React, { createContext, useContext } from "react";
import useSWR from "swr";

type FloatData = {
  float: number | null;
  paintSeed?: number;
  paintIndex?: number;
  [key: string]: any;
};

type FloatContextType = {
  getFloat: (assetId?: string) => {
    float: number | null;
    data?: FloatData;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
    errorMsg?: string;
  };
};

const FloatContext = createContext<FloatContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(res => res.json());

function useFloatInternal(assetId?: string) {
  const shouldFetch = !!assetId;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ["/api/float", assetId] : null,
    () => fetcher(`/api/float?assetId=${assetId}`),
    {
      dedupingInterval: 60000, // 1min cache
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );
  return {
    float: data?.float ?? null,
    data,
    isLoading: !!shouldFetch && isLoading,
    isError: !!shouldFetch && !!error,
    refetch: () => mutate(),
    errorMsg: data?.error || (error ? String(error) : undefined),
  };
}

export function FloatProvider({ children }: { children: React.ReactNode }) {
  const getFloat = (assetId?: string) => useFloatInternal(assetId);
  return (
    <FloatContext.Provider value={{ getFloat }}>
      {children}
    </FloatContext.Provider>
  );
}

export function useFloat(assetId?: string) {
  const ctx = useContext(FloatContext);
  if (!ctx) throw new Error("useFloat must be used within a FloatProvider");
  return ctx.getFloat(assetId);
} 