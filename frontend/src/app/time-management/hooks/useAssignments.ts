"use client";

import { useEffect, useState } from "react";
import { ShiftAssignment } from "../types/ShiftAssignment";
import { getShiftAssignments } from "../api/shiftAssignments";


export const useAssignments = () => {
  const [data, setData] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShiftAssignments()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};
