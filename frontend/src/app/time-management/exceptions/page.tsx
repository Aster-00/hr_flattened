"use client";

import Link from "next/link";
import { useExceptions } from "../hooks/useExceptions";
import DataTable, { Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { TimeException } from "../types/TimeException";

export default function ExceptionsPage() {
    const { exceptions, loading } = useExceptions();

    if (loading) return <p>Loading...</p>;

    const columns: Column<TimeException>[] = [
        { key: "employeeId", label: "Employee" },
        { key: "reason", label: "Reason" },
        { key: "status", label: "Status" },
        {
            key: "_id",
            label: "Actions",
            render: (e) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <StatusBadge status={e.status} />
                    <Link href={`/time-management/exceptions/${e._id}`}>
                        View
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div>
            <h1>Exceptions</h1>
            <DataTable data={exceptions} columns={columns} />
        </div>
    );
}
