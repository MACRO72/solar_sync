// src/hooks/useFirebaseData.ts
import { useEffect, useState } from "react";
import { DataSnapshot } from "firebase/database";
import { subscribeData } from "@/lib/firebaseHelpers";
import type { RowData } from "@/lib/firebaseHelpers";

type UseFirebaseResult = {
  data: { id: string; value: RowData }[] | null;
  loading: boolean;
  error?: string;
};

export function useFirebaseData(path = "/data"): UseFirebaseResult {
  const [data, setData] = useState<{ id: string; value: RowData }[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeData(path, (snap: DataSnapshot) => {
      try {
        const val = snap.val();
        if (!val) {
          setData([]);
        } else {
          const items = Object.entries(val).map(([key, value]) => ({
            id: key,
            value: value as RowData,
          }));
          setData(items);
        }
        setLoading(false);
      } catch (err: any) {
        setError(err?.message || "Unknown error");
        setLoading(false);
      }
    });
    // cleanup
    return () => {
      unsubscribe();
    };
  }, [path]);

  return { data, loading, error };
}