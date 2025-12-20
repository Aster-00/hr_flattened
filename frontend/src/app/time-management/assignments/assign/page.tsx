"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ShiftAssignmentForm from "../../components/forms/ShiftAssignmentForm";
import {
  getShiftAssignmentById,
  createShiftAssignment,
} from "../../api/shiftAssignments";
import { ShiftAssignment } from "../../types/ShiftAssignment";

type FormData = {
  shiftId: string;
  startDate: string;
  endDate?: string;
  scheduleRuleId?: string;
};

export default function AssignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const renewId = searchParams.get("renew");
  const reassignId = searchParams.get("reassign");
  const sourceId = renewId || reassignId;

  const [initialData, setInitialData] = useState<FormData | undefined>();
  const [loading, setLoading] = useState<boolean>(!!sourceId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceId) {
      setLoading(false);
      return;
    }

    const loadSourceAssignment = async () => {
      try {
        const a: ShiftAssignment =
          await getShiftAssignmentById(sourceId);

        setInitialData({
          shiftId:
            typeof a.shiftId === "string"
              ? a.shiftId
              : (a.shiftId as any)._id,

          startDate: new Date().toISOString().slice(0, 10),

          endDate: a.endDate,

          scheduleRuleId:
            typeof a.scheduleRuleId === "string"
              ? a.scheduleRuleId
              : (a.scheduleRuleId as any)?._id,
        });
      } catch {
        setError("Failed to load source assignment.");
      } finally {
        setLoading(false);
      }
    };

    loadSourceAssignment();
  }, [sourceId]);

  if (loading) return <p>Loading assignment data…</p>;

  if (error) {
    return (
      <div className="time-management">
        <div>
          <h1>Shift Assignment</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="time-management">
      <div>
        <h1>
          {renewId
            ? "Renew Shift Assignment"
            : reassignId
            ? "Reassign Shift"
            : "New Shift Assignment"}
        </h1>

        <ShiftAssignmentForm
          initialData={initialData}
          onSubmit={async (data) => {
            await createShiftAssignment(data);
            router.push("/time-management/assignments");
          }}
        />
      </div>
    </div>
  );
}
