"use client";

import { useRouter } from "next/navigation";
import { ShiftForm } from "../../components/forms/ShiftForm";
import { createShift } from "../../api/shifts";

export default function CreateShiftPage() {
  const router = useRouter();

  return (
    <div className="time-management">
      <div>
        <h1>Create Shift</h1>

        <ShiftForm
          onSubmit={async (data) => {
            await createShift(data);
            router.push("/time-management/shifts");
          }}
        />
      </div>
    </div>
  );
}
