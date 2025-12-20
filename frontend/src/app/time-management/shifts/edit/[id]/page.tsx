"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ShiftForm } from "../../../components/forms/ShiftForm";
import { getShiftById, updateShift } from "../../../api/shifts";
import { Shift } from "../../../types/shift";

export default function EditShiftPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [shift, setShift] = useState<Shift | null>(null);

  useEffect(() => {
    if (!id) return;
    getShiftById(id).then(setShift);
  }, [id]);

  if (!shift) return <p>Loading…</p>;

  return (
    <div className="time-management">
      <div>
        <h1>Edit Shift</h1>

        <ShiftForm
          initialData={shift}
          onSubmit={async (data) => {
            await updateShift(id, data);
            router.push("/time-management/shifts");
          }}
        />
      </div>
    </div>
  );
}
