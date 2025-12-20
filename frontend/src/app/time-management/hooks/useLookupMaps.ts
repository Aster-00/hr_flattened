"use client";

import { useEffect, useState } from "react";
import { Shift } from "../types/shift";
import { ShiftType } from "../types/shiftType";
import { getShifts } from "../api/shifts";
import { getShiftTypes } from "../api/shiftTypes";

export const useLookupMaps = () => {
  const [shiftMap, setShiftMap] = useState<Map<string, Shift>>(new Map());
  const [shiftTypeMap, setShiftTypeMap] = useState<Map<string, ShiftType>>(new Map());

  useEffect(() => {
    Promise.all([getShifts(), getShiftTypes()]).then(
      ([shifts, shiftTypes]) => {
        setShiftMap(new Map(shifts.map(s => [s._id as unknown as string, s])));
        setShiftTypeMap(new Map(shiftTypes.map(t => [t._id as unknown as string, t])));
      }
    );
  }, []);

  return { shiftMap, shiftTypeMap };
};
