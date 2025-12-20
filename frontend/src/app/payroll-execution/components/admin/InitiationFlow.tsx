"use client";
import { useState, useEffect } from "react";
import { payrollExecutionApi, fetchUsersByRole } from "../../services/payrollExecutionApi";
import CustomDatePicker from "../shared/CustomDatePicker";
import { Calendar, CheckCircle, XCircle, Play, Info } from "lucide-react";

const ENTITY_NAME = "Tech Corp";

export default function InitiationFlow({ onInitiated }: { onInitiated: () => void }) {
    const [selectedMonth, setSelectedMonth] = useState("");
    const [isApproved, setIsApproved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [specialistId, setSpecialistId] = useState<string>("");
    const [managerId, setManagerId] = useState<string>("");

    useEffect(() => {
        const loadRoles = async () => {
            try {
                // Fetch valid users for roles
                const specialists = await fetchUsersByRole("Payroll Specialist");
                const managers = await fetchUsersByRole("Payroll Manager");

                if (specialists.length > 0) setSpecialistId(specialists[0]._id);
                if (managers.length > 0) setManagerId(managers[0]._id);
            } catch (err) {
                console.error("Failed to load roles", err);
            }
        };
        loadRoles();
    }, []);

    const handleApprovePeriod = () => {
        if (!selectedMonth) return;
        setIsApproved(true);
    };

    const handleRejectPeriod = () => {
        setIsApproved(false);
        setSelectedMonth(""); // Reset
    };

    const handleCreateRun = async () => {
        if (!isApproved || !selectedMonth) return;
        if (!specialistId || !managerId) {
            setError("Cannot initiate: Missing valid Payroll Specialist or Payroll Manager users in the system.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            // 1. Initiate Run (Create Draft)
            const dto = {
                payrollPeriod: selectedMonth, // Format: YYYY-MM
                entity: ENTITY_NAME,
                payrollSpecialistId: specialistId,
                payrollManagerId: managerId
            };

            const run = await payrollExecutionApi.initiatePayroll(dto);

            // 2. Auto-Start Calculation so data is ready
            await payrollExecutionApi.startCalculation(run.runId);

            onInitiated();

        } catch (err: any) {
            setError(err.message || "Failed to initiate payroll");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in">
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar className="text-primary" size={24} />
                Payroll Initiation
            </h2>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Premium Date Picker */}
            <div style={{ display: "flex", justifyContent: "flex-start", padding: "1rem 0" }}>
                <CustomDatePicker
                    value={selectedMonth}
                    onChange={(val) => {
                        setSelectedMonth(val);
                        setIsApproved(false);
                    }}
                    disabled={loading}
                />
            </div>

            {selectedMonth && (
                <div className="animate-expand" style={{ marginTop: "1.5rem", padding: "1.5rem", border: "1px solid var(--border-light)", borderRadius: "0.5rem", backgroundColor: "var(--bg-secondary)" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Info size={20} className="text-info" />
                        Period Review: <span style={{ color: "var(--text-primary)" }}>{new Date(selectedMonth + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: "0.5rem 0 1.5rem 1.75rem" }}>
                        Please review the selected period. You must approve this period before creating a payroll run.
                    </p>

                    {!isApproved ? (
                        <div style={{ display: "flex", gap: "1rem", marginLeft: "1.75rem" }}>
                            <button className="btn-success btn-click-effect" onClick={handleApprovePeriod} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <CheckCircle size={18} />
                                Approve Period
                            </button>
                            <button className="btn-danger btn-click-effect" onClick={handleRejectPeriod} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <XCircle size={18} />
                                Reject Period
                            </button>
                        </div>
                    ) : (
                        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginLeft: "1.75rem" }}>
                            <div className="alert alert-success" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <CheckCircle size={18} />
                                Period Approved. You can now create the payroll run.
                            </div>

                            <button
                                className="btn-primary btn-click-effect"
                                onClick={handleCreateRun}
                                disabled={loading}
                                style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "fit-content" }}
                            >
                                <Play size={18} />
                                {loading ? "Creating..." : "Create Payroll Run"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}