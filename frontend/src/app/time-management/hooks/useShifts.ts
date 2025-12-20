import { useEffect, useState } from "react";
import { Shift } from "../types/shift";
import { getShifts } from "../api/shifts";

export const useShifts = () => {
  const [data, setData] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShifts().then(setData).finally(() => setLoading(false));
  }, []);

  return { data, loading };
};
