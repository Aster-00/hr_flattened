"use client";

import { useEffect, useState } from "react";
import { ScheduleRule } from "../types/ScheduleRule";
import { getScheduleRules } from "../api/scheduleRules";

export const useScheduleRules = () => {
  const [data, setData] = useState<ScheduleRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScheduleRules()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};
