"use client";
console.log("🚨 CORRECTIONS PAGE FILE LOADED");

import React from "react";
import DataTable, { Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import ApprovalButtons from "../components/ApprovalButtons";
import { useCorrections } from "../hooks/useCorrections";
import { CorrectionRequest } from "../types/CorrectionRequest";
console.log("🔥 useCorrections FILE LOADED");

type CorrectionRow = CorrectionRequest & {
    statusBadge: React.ReactNode;
    actions: React.ReactNode;
};

export default function CorrectionsPage() {
    console.log("🚨 CorrectionsPage rendered");

    const { corrections, loading, approve, reject } = useCorrections();

    console.log("🚨 Corrections data:", corrections);

    if (loading) return <p>Loading...</p>;

    const rows: CorrectionRow[] = corrections.map((c) => ({
        ...c,
        statusBadge: <StatusBadge status={c.status} />,
        actions: (
            <ApprovalButtons
                status={c.status}
                onApprove={() => approve(c._id)}
                onReject={() => reject(c._id)}
            />
        ),
    }));

    const columns: Column<CorrectionRow>[] = [
        { key: "employeeId", label: "Employee ID" },
        { key: "date", label: "Date" },
        { key: "reason", label: "Reason" },
        { key: "statusBadge", label: "Status" },
        { key: "actions", label: "Actions" },
    ];

    return (
        <div>
            <h1>Corrections</h1>
            <DataTable data={rows} columns={columns} />
        </div>
    );
}
