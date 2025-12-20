"use client";

import { useRouter } from "next/navigation";
import { createShiftType } from "../../api/shiftTypes";
import { ShiftTypeForm } from "../../components/forms/ShiftTypeForm";

export default function CreateShiftTypePage() {
  const router = useRouter();

  return (
    <ShiftTypeForm
      onSubmit={async (data) => {
        await createShiftType(data);
        router.push("/time-management/shift-types");
      }}
    />
  );
}
