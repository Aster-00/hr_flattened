"use client";

import { CorrectionStatus } from "../types/CorrectionRequest";

interface ApprovalButtonsProps {
    status: CorrectionStatus;
    onApprove: () => void;
    onReject: () => void;
}

export default function ApprovalButtons({
                                            status,
                                            onApprove,
                                            onReject,
                                        }: ApprovalButtonsProps) {
    if (status !== "PENDING") return null;

    return (
        <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={onApprove}>Approve</button>
            <button onClick={onReject}>Reject</button>
        </div>
    );
}
