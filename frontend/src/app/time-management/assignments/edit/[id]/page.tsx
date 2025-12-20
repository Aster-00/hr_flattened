"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ShiftAssignmentForm from "../../../components/forms/ShiftAssignmentForm";
import {
  getShiftAssignmentById,
  updateShiftAssignment,
} from "../../../api/shiftAssignments";
import {
  ShiftAssignment,
  AssignmentStatus,
} from "../../../types/ShiftAssignment";

export default function EditAssignmentPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [assignment, setAssignment] = useState<ShiftAssignment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    getShiftAssignmentById(id)
      .then(setAssignment)
      .catch(() =>
        setError("You do not have permission to edit this assignment.")
      );
  }, [id]);

  if (error) {
    return (
      <div className="time-management">
        <div>
          <h1>Edit Shift Assignment</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return <p>Loading…</p>;
  }

  // 🚫 Guard: only PENDING assignments can be edited
  if (assignment.status !== "PENDING") {
    return (
      <div className="time-management">
        <div>
          <h1>Edit Shift Assignment</h1>

          <p>
            This assignment can no longer be edited because its status is{" "}
            <strong>{assignment.status}</strong>.
          </p>

          <button
            onClick={() => router.push("/time-management/assignments")}
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  // 🔑 Normalize populated IDs for form
  const normalizedShiftId =
    typeof assignment.shiftId === "string"
      ? assignment.shiftId
      : assignment.shiftId._id;

  const normalizedScheduleRuleId =
    typeof assignment.scheduleRuleId === "string"
      ? assignment.scheduleRuleId
      : assignment.scheduleRuleId?._id;

  return (
    <div className="time-management">
      <div>
        <h1>Edit Shift Assignment</h1>

        <ShiftAssignmentForm
          initialData={{
            shiftId: normalizedShiftId,
            startDate: assignment.startDate.slice(0, 10),
            endDate: assignment.endDate?.slice(0, 10),
            scheduleRuleId: normalizedScheduleRuleId,
          }}
          onSubmit={async (data) => {
            await updateShiftAssignment(id, data);
            router.push("/time-management/assignments");
          }}
        />
      </div>
    </div>
  );
}
