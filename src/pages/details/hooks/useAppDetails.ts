// src/pages/details/hooks/useAppDetails.ts
import useSWR from 'swr';
import { api } from "@/lib/api";
import type { AppDetails } from "../types";

export function useAppDetails(id?: string) {
  const { data, error, mutate, isLoading } = useSWR<AppDetails>(
    id ? `/apps/${encodeURIComponent(id)}` : null,
    (url) => api.get(url).then(res => res.data),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      // fallbackData: undefined,
    }
  );

  return {
    data,
    loading: isLoading,
    error: error?.response?.data?.error ?? error?.message ?? null,
    mutate, // ESSA É A CHAVE: permite otimista + revalidação
  };
}