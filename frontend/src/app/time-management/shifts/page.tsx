"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shift } from "../types/shift";
import { getShifts } from "../api/shifts";
import { useLookupMaps } from "../hooks/useLookupMaps";

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const { shiftTypeMap } = useLookupMaps();

  useEffect(() => {
    getShifts()
      .then(setShifts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading shifts…</p>;

  return (
    <>
      <h1>Shifts</h1>

      <Link href="/time-management/shifts/create">
        Create Shift
      </Link>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Shift Type</th>
            <th>Time</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => {
            const type = shiftTypeMap.get(
              shift.shiftType as unknown as string
            );

            return (
              <tr key={shift._id as unknown as string}>
                <td>{shift.name}</td>
                <td>{type?.name ?? "—"}</td>
                <td>
                  {shift.startTime} – {shift.endTime}
                </td>
                <td>{shift.active ? "Yes" : "No"}</td>
                <td>
                  <Link href={`/time-management/shifts/edit/${shift._id}`}>
                    Edit
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
