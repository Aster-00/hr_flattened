"use client";

import Link from "next/link";
import { useAssignments } from "../hooks/useAssignments";
import { useLookupMaps } from "../hooks/useLookupMaps";
import { isExpired, isNearExpiry } from "../utils/date";
import { ExpiryBadge } from "../components/badges/ExpiryBadge";

export default function ExpiryMonitorPage() {
  const { data, loading } = useAssignments();
  const { shiftMap } = useLookupMaps();

  if (loading) return <p>Loading shift lifecycle…</p>;

  return (
    <div>
      <h1>Assignment Expiry Monitor</h1>

      {data.length === 0 && <p>No assignments to monitor.</p>}

      {data.map(a => {
        const shift = shiftMap.get(a.shiftId as unknown as string);

        const status =
          isExpired(a.endDate)
            ? "Expired"
            : isNearExpiry(a.endDate)
            ? "Near Expiry"
            : "Active";

        return (
          <div key={a._id as unknown as string}>
            <h3>{shift?.name ?? "—"}</h3>

            <p>
              End Date:{" "}
              {a.endDate
                ? new Date(a.endDate).toLocaleDateString()
                : "Ongoing"}
            </p>

            <ExpiryBadge status={status} />

            <div>
              <Link
                href={`/time-management/assignments/assign?renew=${a._id}`}
              >
                Renew
              </Link>{" "}
              |{" "}
              <Link
                href={`/time-management/assignments/assign?reassign=${a._id}`}
              >
                Reassign
              </Link>
            </div>

            <hr />
          </div>
        );
      })}
    </div>
  );
}
