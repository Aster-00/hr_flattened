"use client";

import Link from "next/link";
import { useScheduleRules } from "../hooks/useScheduleRules";

export default function ScheduleRulesPage() {
  const { data, loading } = useScheduleRules();

  if (loading) return <p>Loading schedule rules…</p>;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Schedule Rules</h1>

      <div style={{ marginBottom: "1rem" }}>
        <Link href="/time-management/schedule-rules/create">
          Create Schedule Rule
        </Link>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Pattern</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((rule) => (
            <tr key={rule._id as unknown as string}>
              <td>{rule.name}</td>
              <td>{rule.pattern}</td>
              <td>{rule.active ? "Yes" : "No"}</td>
              <td>
                <Link
                  href={`/time-management/schedule-rules/edit/${rule._id}`}
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
