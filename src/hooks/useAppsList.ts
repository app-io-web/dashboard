import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AppDetails } from "../pages/details/types";

export function useAppsList() {
  const [data, setData] = useState<AppDetails[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get("/apps")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
