import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AppDetails } from "./types";

export function useAppDetails(id?: string) {
  const [data, setData] = useState<AppDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/apps/${id}`)
      .then((res) => setData(res.data as AppDetails))
      .catch((err) => setError(err?.response?.data?.error ?? err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}
