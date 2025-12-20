"use client";

import { useEffect, useState } from "react";
import { ShiftType } from "../types/shiftType";
import { getShiftTypes } from "../api/shiftTypes";

export const useShiftTypes = () => {
  const [data, setData] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getShiftTypes()
      .then(setData)
      .catch(() => setError("Failed to load shift types"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
