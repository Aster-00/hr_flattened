"use client";

import { use, useEffect, useState } from "react";
import {
    getExceptionById,
    markPending,
    approveException,
    rejectException,
} from "../../api/exceptions.api";
import { TimeException } from "../../types/TimeException";
import StatusBadge from "../../components/StatusBadge";

export default function ExceptionDetailsPage({
                                                 params,
                                             }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [exception, setException] = useState<TimeException | null>(null);

    useEffect(() => {
        getExceptionById(id).then(setException);
    }, [id]);

    if (!exception) return <p>Loading...</p>;

    async function handlePending() {
        const updated = await markPending(id);
        setException(updated);
    }

    async function handleApprove() {
        const updated = await approveException(id);
        setException(updated);
    }

    async function handleReject() {
        const updated = await rejectException(id);
        setException(updated);
    }

    return (
        <div>
            <h1>Exception Details</h1>

            <p>Employee: {exception.employeeId}</p>
            <p>Reason: {exception.reason}</p>
            <StatusBadge status={exception.status} />

            {/* OPEN → PENDING */}
            <button
                disabled={exception.status !== "OPEN"}
                onClick={handlePending}
            >
                Mark Pending
            </button>

            {/* PENDING → APPROVED */}
            <button
                disabled={exception.status !== "PENDING"}
                onClick={handleApprove}
            >
                Approve
            </button>

            {/* OPEN | PENDING → REJECTED */}
            <button
                disabled={!["OPEN", "PENDING"].includes(exception.status)}
                onClick={handleReject}
            >
                Reject
            </button>
        </div>
    );
}
