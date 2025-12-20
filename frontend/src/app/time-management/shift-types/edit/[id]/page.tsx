"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShiftTypeForm } from "../../../components/forms/ShiftTypeForm";
import { updateShiftType, getShiftTypes } from "../../../api/shiftTypes";
import { ShiftType } from "../../../types/shiftType";

export default function EditShiftTypePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [shiftType, setShiftType] = useState<ShiftType | null>(null);

  useEffect(() => {
    getShiftTypes().then((types) => {
      const found = types.find(
        (t) => (t._id as unknown as string) === id
      );
      setShiftType(found ?? null);
    });
  }, [id]);

  if (!shiftType) return <p>Loading…</p>;

  return (
    <>
      <h1>Edit Shift Type</h1>

      <ShiftTypeForm
        initialData={shiftType}
        onSubmit={async (data) => {
          await updateShiftType(id, data);
          router.push("/time-management/shift-types");
        }}
      />
    </>
  );
}
