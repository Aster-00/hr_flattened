"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ShiftAssignmentForm from "../../components/forms/ShiftAssignmentForm";
import { createShiftAssignment } from "../../api/shiftAssignments";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const employeeId = searchParams.get("employeeId");

  if (!employeeId) {
    return (
      <div className="time-management">
        <div>
          <h1>Create Shift Assignment</h1>
          <p>Please select an employee first.</p>
          <button
            onClick={() =>
              router.push("/time-management/assignments/employees")
            }
          >
            Select Employee
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="time-management">
      <div>
        <h1>Create Shift Assignment</h1>

        <ShiftAssignmentForm
          onSubmit={async (data) => {
            await createShiftAssignment({
              ...data,
              employeeId,
            });

            router.push("/time-management/assignments");
          }}
        />
      </div>
    </div>
  );
}
