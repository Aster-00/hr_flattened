"use client";

import Link from "next/link";
import { useAssignments } from "../hooks/useAssignments";
import { useLookupMaps } from "../hooks/useLookupMaps";
import { getAssignmentExpiryStatus } from "../utils/assignmentStatus";
import {
  approveShiftAssignment,
  cancelShiftAssignment,
} from "../api/shiftAssignments";

export default function AssignmentsPage() {
  const { data, loading } = useAssignments();
  const { shiftMap } = useLookupMaps();

  if (loading) return <p>Loading assignments…</p>;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Shift Assignments</h1>

      {/* Create */}
      <div style={{ marginBottom: "1rem" }}>
          <Link href="/time-management/assignments/employees">
             Create Assignment
          </Link>

      </div>

      <table>
        <thead>
          <tr>
            <th>Target</th>
            <th>Shift</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Expiry</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((a) => {
            const shift = shiftMap.get(a.shiftId as unknown as string);
            const expiryStatus = getAssignmentExpiryStatus(a.endDate);

            return (
              <tr key={a._id as unknown as string}>
                {/* Target */}
                <td>
                  {a.employeeId && `Employee: ${a.employeeId}`}
                  {a.departmentId && `Department: ${a.departmentId}`}
                  {a.positionId && `Position: ${a.positionId}`}
                </td>

                {/* Shift */}
                <td>{shift?.name ?? "—"}</td>

                {/* Dates */}
                <td>{new Date(a.startDate).toLocaleDateString()}</td>
                <td>
                  {a.endDate
                    ? new Date(a.endDate).toLocaleDateString()
                    : "Ongoing"}
                </td>

                {/* Status */}
                <td>
                  {a.status === "PENDING" && "Pending Approval"}
                  {a.status === "APPROVED" && "Approved"}
                  {a.status === "CANCELLED" && "Cancelled"}
                  {a.status === "EXPIRED" && "Expired"}
                </td>

                {/* Expiry */}
                <td>{expiryStatus}</td>

                {/* Actions */}
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  {a.status === "PENDING" && (
                    <>
                      <button
                        onClick={async () => {
                          await approveShiftAssignment(
                            a._id as unknown as string
                          );
                          location.reload();
                        }}
                      >
                        Approve
                      </button>

                      <button
                        onClick={async () => {
                          await cancelShiftAssignment(
                            a._id as unknown as string
                          );
                          location.reload();
                        }}
                      >
                        Cancel
                      </button>

                      <Link
                        href={`/time-management/assignments/edit/${a._id}`}
                      >
                        Edit
                      </Link>
                    </>
                  )}

                  {a.status !== "PENDING" && (
                    <span style={{ color: "#999" }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}

          {data.length === 0 && (
            <tr>
              <td colSpan={7}>No assignments found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
