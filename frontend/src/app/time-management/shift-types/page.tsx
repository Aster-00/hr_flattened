"use client";

import Link from "next/link";
import { useShiftTypes } from "../hooks/useShiftTypes";
import { ShiftTypeTable } from "../components/tables/ShiftTypeTable";

export default function ShiftTypesPage() {
  const { data, loading } = useShiftTypes();

  if (loading) return <p>Loading shift types…</p>;

  return (
    <>
      <h1>Shift Types</h1>

      <Link href="/time-management/shift-types/create">
        Create Shift Type
      </Link>

      <ShiftTypeTable data={data} />
    </>
  );
}
