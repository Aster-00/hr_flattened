"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Phase0Review from "./components/admin/Pre-RunReview";
import InitiationFlow from "./components/admin/InitiationFlow";
import RunDashboard from "./components/admin/RunDashboard";
import MyPayslips from "./components/employee/MyPayslips";
import { payrollExecutionApi } from "./services/payrollExecutionApi";
import { User } from "lucide-react";

export default function PayrollExecutionPage() {
    const [phase, setPhase] = useState<"PHASE_0" | "INITIATION" | "EXECUTION">("PHASE_0");
    const [viewMode, setViewMode] = useState<"ADMIN" | "EMPLOYEE">("ADMIN");
    const router = useRouter();

    const [user, setUser] = useState<{ id: string; role: string; name?: string } | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const u = await payrollExecutionApi.fetchCurrentUser();
            setUser(u);
            if (u?.role === 'EMPLOYEE') {
                setViewMode("EMPLOYEE");
            } else if (u?.role === 'Payroll Specialist') {
                setPhase("PHASE_0"); // Specialists start at Pre-Run
            } else {
                setPhase("EXECUTION"); // Managers/Finance start at Dashboard
            }
        };
        loadUser();
    }, []);

    return (
        <div>
            {/* Header Banner with colored background */}
            <div style={{
                background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
                padding: "2rem 1.5rem",
                margin: "1rem 1.5rem 0 1.5rem",
                borderRadius: "1rem",
                boxShadow: "0 4px 20px rgba(37, 99, 235, 0.25)"
            }}>

                <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "white" }}>
                                Payroll Execution
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.85)", marginTop: "0.5rem" }}>
                                Manage the end-to-end payroll process from review to final execution.
                            </p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1rem" }}>
                            {/* View Mode Switcher */}
                            <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.15)", padding: "0.25rem", borderRadius: "0.5rem" }}>
                                <button
                                    onClick={() => setViewMode("ADMIN")}
                                    style={{
                                        padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", fontWeight: 600,
                                        background: viewMode === "ADMIN" ? "white" : "transparent",
                                        boxShadow: viewMode === "ADMIN" ? "var(--shadow-sm)" : "none",
                                        color: viewMode === "ADMIN" ? "#1e40af" : "rgba(255,255,255,0.9)"
                                    }}
                                >
                                    Admin View
                                </button>
                                <button
                                    onClick={() => setViewMode("EMPLOYEE")}
                                    style={{
                                        padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", fontWeight: 600,
                                        background: viewMode === "EMPLOYEE" ? "white" : "transparent",
                                        boxShadow: viewMode === "EMPLOYEE" ? "var(--shadow-sm)" : "none",
                                        color: viewMode === "EMPLOYEE" ? "#1e40af" : "rgba(255,255,255,0.9)"
                                    }}
                                >
                                    My Payslips
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "2rem 1.5rem" }}>

                {viewMode === "EMPLOYEE" ? (
                    <div style={{ display: "grid", gap: "1.5rem" }}>
                        <div className="alert alert-info">
                            Viewing your personal pay history.
                        </div>
                        <MyPayslips />
                    </div>
                ) : (
                    <>
                        {/* Navigation Tabs for Admin View */}
                        <div style={{ display: "flex", borderBottom: "1px solid var(--border-light)", marginBottom: "2rem" }}>
                            {/* Only Specialists show Initiate Tab */}
                            {user?.role === 'Payroll Specialist' && (
                                <button
                                    onClick={() => {
                                        setPhase("PHASE_0");
                                    }}
                                    style={{
                                        padding: "1rem 1.5rem",
                                        background: "transparent",
                                        border: "none",
                                        borderBottom: (phase === "PHASE_0" || phase === "INITIATION") ? "2px solid var(--primary-500)" : "none",
                                        color: (phase === "PHASE_0" || phase === "INITIATION") ? "var(--primary-600)" : "var(--text-secondary)",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem"
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                                    Start New Run
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setPhase("EXECUTION");
                                }}
                                style={{
                                    padding: "1rem 1.5rem",
                                    background: "transparent",
                                    border: "none",
                                    borderBottom: phase === "EXECUTION" ? "2px solid var(--primary-500)" : "none",
                                    color: phase === "EXECUTION" ? "var(--primary-600)" : "var(--text-secondary)",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem"
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                Run Dashboard & History
                            </button>
                        </div>

                        {/* Admin Content Area */}
                        <div key={phase} className="animate-fade-in">
                            {(phase === "PHASE_0" || phase === "INITIATION") ? (
                                <div style={{ display: "grid", gap: "1.5rem" }}>
                                    {/* Timeline Stepper */}
                                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "1rem" }}>
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: "0.5rem",
                                            fontWeight: 600,
                                            color: phase === "PHASE_0" ? "var(--primary-600)" : "var(--success)"
                                        }}>
                                            <span style={{
                                                width: "2rem", height: "2rem", borderRadius: "50%",
                                                background: phase === "PHASE_0" ? "var(--primary-600)" : "var(--success)",
                                                color: "white", display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>1</span>
                                            Pre-Run Review
                                        </div>
                                        <div style={{ width: "2rem", height: "2px", background: "var(--border-medium)", alignSelf: "center" }}></div>
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: "0.5rem",
                                            fontWeight: 600,
                                            color: phase === "INITIATION" ? "var(--primary-600)" : "var(--text-tertiary)"
                                        }}>
                                            <span style={{
                                                width: "2rem", height: "2rem", borderRadius: "50%",
                                                background: phase === "INITIATION" ? "var(--primary-600)" : "var(--gray-300)",
                                                color: "white", display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>2</span>
                                            Initiation
                                        </div>
                                    </div>

                                    {phase === "PHASE_0" && (
                                        <Phase0Review onComplete={() => setPhase("INITIATION")} />
                                    )}

                                    {phase === "INITIATION" && (
                                        <>
                                            <div className="alert alert-info" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span>Pre-Run check completed successfully</span>
                                                <button
                                                    className="btn-secondary"
                                                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                                                    onClick={() => setPhase("PHASE_0")}
                                                >
                                                    Back to Review
                                                </button>
                                            </div>
                                            <InitiationFlow onInitiated={() => setPhase("EXECUTION")} />
                                        </>
                                    )}
                                </div>
                            ) : (
                                <RunDashboard />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

