"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; 
import {apiClient} from "../../api/axios";

interface Employee {
  _id: string;
  employeeNumber: string;
  firstName?: string;
  lastName?: string;
  workEmail?: string;
  primaryDepartmentId?: { _id: string; name: string };
  primaryPositionId?: { _id: string; name: string };
}

export default function AssignmentEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/shift-assignments/employees")
      .then((res) => setEmployees(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading employees…</p>;

  return (
    <div className="time-management">
      <div>
        <h1>Assign Shift to Employee</h1>

        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {employees.map((e) => (
              <tr key={e._id}>
                <td>
                  {e.firstName} {e.lastName}
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>
                    {e.employeeNumber}
                  </div>
                </td>

                <td>{e.workEmail ?? "—"}</td>

                <td>{e.primaryDepartmentId?.name ?? "—"}</td>

                <td>{e.primaryPositionId?.name ?? "—"}</td>

                <td>
                  <Link
                    href={`/time-management/assignments/create?employeeId=${e._id}`}
                  >
                    Assign Shift
                  </Link>
                </td>
              </tr>
            ))}

            {employees.length === 0 && (
              <tr>
                <td colSpan={5}>No active employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
