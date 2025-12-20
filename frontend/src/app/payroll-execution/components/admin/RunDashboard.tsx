"use client";
import { usePayrollDashboard } from "../../hooks/usePayrollDashboard";
import { Wallet, Play, Clock, Users, AlertTriangle, AlertCircle, FileText, Check, Unlock, Calculator, Ban, CheckCircle, XCircle, LayoutTemplate, Edit2, CheckCheck, RotateCcw } from "lucide-react";
import { useState } from "react";
import CustomDatePicker from "../shared/CustomDatePicker";

// Helper for status badge colors
const getStatusBadgeClass = (status: string) => {
    const s = status?.trim().toLowerCase() || "";
    if (["approved", "accepted", "executed", "completed", "unlocked"].some(k => s.includes(k))) return "badge-success";
    if (s.includes("rejected")) return "badge-error";
    if (s.includes("locked") || s.includes("pending finance")) return "badge-warning";
    return "badge-info"; // Draft / Default
};

export default function RunDashboard() {
    const {
        activeTab,
        currentRun,
        history,
        loading,
        processing,
        anomalies,
        showAnomalies,
        setShowAnomalies,
        currentUser,
        modalOpen,
        modalAction,
        modalReason,
        setModalReason,
        modalTitle,
        modalMessage,
        setModalOpen,
        setModalAction,
        editPeriodData,
        setEditPeriodData,
        handleTabChange,
        closeModal,
        openInputModal,
        handleStartCalculation,
        handleManagerApprove,
        handleFinanceApprove,
        handleExecute,
        handleExportBankFile,
        handleSelectRun,
        handleSubmitForReview,
        handleEditPeriod,
        handleResolveAnomaly,
        handleUnresolveAnomaly,
        submitModal,
        submitEditPeriod
    } = usePayrollDashboard();

    const [resolveNotes, setResolveNotes] = useState("");
    const [resolvingPayslipId, setResolvingPayslipId] = useState<string | null>(null);



    return (
        <div>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-light)" }}>
                <button
                    onClick={() => handleTabChange("CURRENT")}
                    style={{
                        cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.75rem 1rem",
                        background: "transparent",
                        border: "none",
                        borderBottom: activeTab === "CURRENT" ? "2px solid var(--primary-500)" : "none",
                        fontWeight: 600,
                        color: activeTab === "CURRENT" ? "var(--primary-600)" : "var(--text-secondary)"
                    }}
                    className="btn-click-effect"
                >
                    <Clock size={16} />
                    Current Run
                </button>
                <button
                    onClick={() => handleTabChange("HISTORY")}
                    style={{
                        padding: "0.75rem 1rem",
                        background: "transparent",
                        border: "none",
                        borderBottom: activeTab === "HISTORY" ? "2px solid var(--primary-500)" : "none",
                        fontWeight: 600,
                        color: activeTab === "HISTORY" ? "var(--primary-600)" : "var(--text-secondary)",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "0.5rem"
                    }}
                    className="btn-click-effect"
                >
                    <FileText size={16} />
                    Run History
                </button>
            </div>

            {loading && (
                <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* Header Skeleton */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <div className="skeleton" style={{ width: "200px", height: "2rem" }}></div>
                            <div className="skeleton" style={{ width: "150px", height: "1rem" }}></div>
                        </div>
                        <div className="skeleton" style={{ width: "100px", height: "2rem", borderRadius: "9999px" }}></div>
                    </div>

                    {/* Stats Grid Skeleton */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <div className="skeleton" style={{ height: "120px", borderRadius: "0.75rem" }}></div>
                        <div className="skeleton" style={{ height: "120px", borderRadius: "0.75rem" }}></div>
                        <div className="skeleton" style={{ height: "120px", borderRadius: "0.75rem" }}></div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="skeleton" style={{ height: "200px", borderRadius: "0.75rem" }}></div>
                </div>
            )}

            {/* CURRENT RUN VIEW */}
            {activeTab === "CURRENT" && !loading && (
                <div>
                    {!currentRun ? (
                        <div className="animate-fade-in" style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4rem 2rem",
                            border: "2px dashed var(--border-medium)",
                            borderRadius: "1rem",
                            color: "var(--text-secondary)",
                            textAlign: "center",
                            background: "var(--bg-tertiary)"
                        }}>
                            <div style={{ background: "white", padding: "1rem", borderRadius: "50%", marginBottom: "1rem", boxShadow: "var(--shadow-sm)" }}>
                                <LayoutTemplate size={32} className="text-tertiary" />
                            </div>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>No Active Payroll Run</h3>
                            <p style={{ maxWidth: "400px", margin: "0", lineHeight: "1.5" }}>
                                Select a past run from the <strong style={{ color: "var(--primary-600)", cursor: "pointer" }} onClick={() => handleTabChange("HISTORY")}>History</strong> tab, or switch to <strong style={{ color: "var(--primary-600)" }}>Start New Run</strong> to initiate a new cycle.
                            </p>
                        </div>
                    ) : (
                        <div className="card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                                <div>
                                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <Wallet className="text-primary" size={24} />
                                        Payroll Run
                                    </h2>
                                    <h3 style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>ID: <span style={{ fontFamily: "var(--font-geist-mono)" }}>{currentRun.runId}</span></h3>
                                    <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                        <Clock size={14} />
                                        Period: {new Date(currentRun.payrollPeriod).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                                    </p>
                                </div>
                                <div className={`badge ${getStatusBadgeClass(currentRun.status)}`} style={{ fontSize: "1rem", textTransform: "capitalize" }}>
                                    Status: {currentRun.status}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="animate-slide-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                                <div className="stat-card hover-lift stagger-1" style={{ display: "flex", alignItems: "center", gap: "1rem", background: "linear-gradient(135deg, var(--org-structure) 0%, #7c3aed 100%)" }}>
                                    <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.2)", borderRadius: "0.5rem" }}>
                                        <Wallet size={24} color="white" />
                                    </div>
                                    <div>
                                        <div style={{ opacity: 0.9, fontSize: "0.875rem" }}>Total Net Pay</div>
                                        <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>EGP {currentRun.totalnetpay.toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="stat-card stat-card-info hover-lift stagger-2" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.2)", borderRadius: "0.5rem" }}>
                                        <Users size={24} color="white" />
                                    </div>
                                    <div>
                                        <div style={{ opacity: 0.9, fontSize: "0.875rem" }}>Employees Processed</div>
                                        <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{currentRun.employees}</div>
                                    </div>
                                </div>
                                <div className={`stat-card ${currentRun.exceptions > 0 ? "stat-card-warning" : "stat-card-success"} hover-lift stagger-3`} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.2)", borderRadius: "0.5rem" }}>
                                        <AlertTriangle size={24} color="white" />
                                    </div>
                                    <div>
                                        <div style={{ opacity: 0.9, fontSize: "0.875rem" }}>Anomalies</div>
                                        <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{currentRun.exceptions}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Anomalies Section */}
                            {(currentRun.exceptions > 0) && (
                                <div style={{ marginBottom: "2rem" }}>
                                    <button
                                        className="btn-secondary btn-click-effect"
                                        onClick={() => setShowAnomalies(!showAnomalies)}
                                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                                    >
                                        <AlertCircle size={16} className="text-warning" />
                                        {showAnomalies ? "Hide Anomalies" : "View Anomalies Details"}
                                    </button>

                                    {showAnomalies && (
                                        <div className="animate-expand" style={{ marginTop: "1rem", border: "1px solid var(--border-light)", borderRadius: "0.5rem" }}>
                                            {anomalies.length > 0 ? (
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Employee</th>
                                                            <th>Net Pay</th>
                                                            <th>Issues</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {anomalies.map((a, i) => (
                                                            <tr
                                                                key={a.payslipId || i}
                                                                style={{
                                                                    transition: "all 0.2s",
                                                                    animationDelay: `${i * 0.05}s`,
                                                                    opacity: a.resolved ? 0.6 : 1
                                                                }}
                                                                className="animate-slide-up"
                                                            >
                                                                <td>{a.employeeName || "Unknown"}</td>
                                                                <td>{a.netPay || "-"}</td>
                                                                <td style={{ color: a.resolved ? "var(--text-secondary)" : "var(--error)" }}>
                                                                    {a.reasons ? a.reasons.join(", ") : ""}
                                                                </td>
                                                                <td>
                                                                    {a.resolved ? (
                                                                        <span className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                                            <CheckCheck size={12} /> Resolved
                                                                        </span>
                                                                    ) : (
                                                                        <span className="badge badge-warning">Pending</span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {resolvingPayslipId === a.payslipId ? (
                                                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                                            <input
                                                                                type="text"
                                                                                className="form-input"
                                                                                placeholder="Resolution notes..."
                                                                                value={resolveNotes}
                                                                                onChange={(e) => setResolveNotes(e.target.value)}
                                                                                style={{ width: "150px", padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                                                                                autoFocus
                                                                            />
                                                                            <button
                                                                                className="btn-success btn-click-effect"
                                                                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                                                                onClick={() => {
                                                                                    handleResolveAnomaly(a.payslipId, resolveNotes);
                                                                                    setResolvingPayslipId(null);
                                                                                    setResolveNotes("");
                                                                                }}
                                                                                disabled={processing}
                                                                            >
                                                                                Save
                                                                            </button>
                                                                            <button
                                                                                className="btn-secondary btn-click-effect"
                                                                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                                                                onClick={() => {
                                                                                    setResolvingPayslipId(null);
                                                                                    setResolveNotes("");
                                                                                }}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    ) : a.resolved ? (
                                                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                                                            {a.resolutionNotes && (
                                                                                <small style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
                                                                                    "{a.resolutionNotes}"
                                                                                </small>
                                                                            )}
                                                                            <button
                                                                                className="btn-secondary btn-click-effect"
                                                                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                                                                                onClick={() => handleUnresolveAnomaly(a.payslipId)}
                                                                                disabled={processing}
                                                                            >
                                                                                <RotateCcw size={12} /> Unresolve
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            className="btn-success btn-click-effect"
                                                                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                                                                            onClick={() => setResolvingPayslipId(a.payslipId)}
                                                                            disabled={processing}
                                                                        >
                                                                            <Check size={12} /> Resolve
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div style={{ padding: "1rem", color: "var(--text-secondary)", textAlign: "center" }}>
                                                    No details available despite exceptions count. Please recalculate.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            )}

                            {/* ACTION BAR */}
                            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1.5rem" }}>
                                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>

                                    {/* PAYROLL SPECIALIST ACTIONS */}
                                    {currentUser?.role === 'Payroll Specialist' && (
                                        <>
                                            {(currentRun.status === "rejected") && (
                                                <>
                                                    <div className="alert alert-error" style={{ width: "100%", marginBottom: "0.5rem" }}>
                                                        <strong>Rejected:</strong> {currentRun.rejectionReason || "No reason provided"}
                                                    </div>
                                                    <button
                                                        className="btn-secondary btn-click-effect"
                                                        onClick={() => handleEditPeriod(currentRun)}
                                                        disabled={processing || !!modalAction}
                                                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                                                    >
                                                        <Edit2 size={18} />
                                                        Edit Period
                                                    </button>
                                                    <button
                                                        className="btn-primary btn-click-effect"
                                                        onClick={() => handleStartCalculation(currentRun.runId)}
                                                        disabled={processing || !!modalAction}
                                                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                                                    >
                                                        <Calculator size={18} />
                                                        Recalculate
                                                    </button>
                                                </>
                                            )}
                                            {(currentRun.status === "draft") && (
                                                <>
                                                    <button
                                                        className="btn-primary btn-click-effect"
                                                        onClick={() => handleStartCalculation(currentRun.runId)}
                                                        disabled={processing || !!modalAction}
                                                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                                                    >
                                                        <Calculator size={18} />
                                                        Calculate / Recalculate
                                                    </button>
                                                    {(currentRun.employees > 0) && (
                                                        <button
                                                            className="btn-success btn-click-effect"
                                                            onClick={() => handleSubmitForReview(currentRun.runId)}
                                                            disabled={processing || !!modalAction}
                                                            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                                                        >
                                                            <CheckCircle size={18} />
                                                            Submit for Review (Publish)
                                                        </button>
                                                    )}
                                                </>
                                            )}


                                            {(currentRun.status === "approved" || currentRun.status === "unlocked") && (
                                                <button
                                                    className="btn-primary btn-click-effect"
                                                    onClick={() => handleExecute(currentRun.runId)}
                                                    disabled={processing || !!modalAction}
                                                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                                                >
                                                    <Play size={18} />
                                                    EXECUTE PAYROLL (Lock)
                                                </button>
                                            )}

                                            <button
                                                className="btn-secondary btn-click-effect"
                                                onClick={() => handleExportBankFile(currentRun.runId)}
                                                disabled={processing || !!modalAction}
                                                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                                            >
                                                <FileText size={18} />
                                                Export Bank File
                                            </button>
                                        </>
                                    )}

                                    {/* MANAGER ACTIONS */}
                                    {currentUser?.role === 'Payroll Manager' && (
                                        <>
                                            {(currentRun.status === "under review") && (
                                                <>
                                                    <button
                                                        className="btn-success btn-click-effect"
                                                        onClick={() => handleManagerApprove(currentRun.runId)}
                                                        disabled={processing || !!modalAction}
                                                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                                                    >
                                                        <Check size={18} />
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn-danger btn-click-effect"
                                                        onClick={() => openInputModal("REJECT_MANAGER", currentRun.runId)}
                                                        disabled={processing || !!modalAction}
                                                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                                                    >
                                                        <Ban size={18} />
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                            {(currentRun.status === "locked") && (
                                                <button
                                                    className="btn-primary btn-click-effect"
                                                    style={{ backgroundColor: "var(--warning)", color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}
                                                    onClick={() => openInputModal("UNFREEZE", currentRun.runId)}
                                                    disabled={processing || !!modalAction}
                                                >
                                                    <Unlock size={18} />
                                                    Unfreeze (Revert to Approved)
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {/* FINANCE ACTIONS */}
                                    {currentUser?.role === 'Finance Staff' && (
                                        <>
                                            {(currentRun.status === "pending finance approval") && (
                                                <>
                                                    <button
                                                        className="btn-success btn-click-effect"
                                                        onClick={() => handleFinanceApprove(currentRun.runId)}
                                                        disabled={processing || !!modalAction}
                                                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                                                    >
                                                        <CheckCircle size={18} />
                                                        Approve Payment
                                                    </button>
                                                    <button
                                                        className="btn-danger btn-click-effect"
                                                        onClick={() => openInputModal("REJECT_FINANCE", currentRun.runId)}
                                                        disabled={processing || !!modalAction}
                                                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                                                    >
                                                        <XCircle size={18} />
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* INLINE INPUT SECTION */}
                                {(modalAction === "UNFREEZE" || modalAction === "REJECT_MANAGER" || modalAction === "REJECT_FINANCE") && (
                                    <div style={{
                                        marginTop: "1rem",
                                        padding: "1.5rem",
                                        backgroundColor: "var(--bg-secondary)",
                                        borderRadius: "0.5rem",
                                        border: "1px solid var(--border-light)",
                                        fontFamily: "var(--font-geist-sans)"
                                    }}>
                                        <h4 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>
                                            {modalAction === "UNFREEZE" ? "Unfreeze Payroll" : "Reject Payroll"}
                                        </h4>

                                        <label className="form-label">
                                            Reason required:
                                        </label>
                                        <textarea
                                            className="form-input"
                                            rows={3}
                                            value={modalReason}
                                            onChange={(e) => setModalReason(e.target.value)}
                                            onInput={(e: any) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }}
                                            style={{ resize: "none", overflow: "hidden", minHeight: "80px", marginBottom: "1rem" }}
                                            placeholder="Enter reason here..."
                                            autoFocus
                                        />

                                        <div style={{ display: "flex", gap: "1rem" }}>
                                            <button
                                                className="btn-secondary btn-click-effect"
                                                onClick={() => {
                                                    setModalAction(null);
                                                    setModalReason("");
                                                    setModalOpen(false);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className={`btn-click-effect ${modalAction === "UNFREEZE" ? "btn-primary" : "btn-danger"}`}
                                                style={modalAction === "UNFREEZE" ? { backgroundColor: "var(--warning)", color: "white" } : {}}
                                                onClick={submitModal}
                                                disabled={!modalReason.trim() || processing}
                                            >
                                                {processing ? "Processing..." : "Confirm"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* HISTORY VIEW */}
            {activeTab === "HISTORY" && !loading && (
                <div className="card">
                    <p style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>Click on a row to view details & take actions.</p>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Period</th>
                                <th>Run ID</th>
                                <th>Status</th>
                                <th>Total Net Pay</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((run, index) => (
                                <tr
                                    key={run.runId}
                                    onClick={() => handleSelectRun(run)}
                                    style={{ cursor: "pointer", transition: "all 0.2s", animationDelay: `${index * 0.05}s` }}
                                    className="history-row animate-fade-in"
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                    <td>{new Date(run.payrollPeriod).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</td>
                                    <td>{run.runId}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(run.status)}`}>
                                            {run.status}
                                        </span>
                                    </td>
                                    <td>{run.totalnetpay.toLocaleString()}</td>
                                </tr>
                            ))}
                            {history.length === 0 && <tr><td colSpan={5}>No history found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL (Alerts & Confirmations Only) */}
            {modalOpen && !["UNFREEZE", "REJECT_MANAGER", "REJECT_FINANCE", "EDIT_PERIOD"].includes(modalAction || "") && (
                <div className="modal-overlay animate-fade-in" style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
                }}>
                    <div className="modal-content animate-scale-in" style={{ width: "450px", maxWidth: "95%", fontFamily: "var(--font-geist-sans)" }}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                {modalTitle}
                            </h3>
                        </div>
                        <div className="modal-body">
                            {modalMessage && (
                                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                                    {modalMessage}
                                </p>
                            )}
                        </div>
                        <div className="modal-footer">
                            {(modalAction !== "ALERT") && (
                                <button
                                    className="btn-secondary btn-click-effect"
                                    onClick={closeModal}
                                    style={{ fontWeight: 500 }}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                className="btn-primary btn-click-effect"
                                onClick={submitModal}
                                disabled={processing}
                                style={{ fontWeight: 500 }}
                            >
                                {processing ? "Processing..." : modalAction === "ALERT" ? "OK" : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT_PERIOD Modal */}
            {modalOpen && modalAction === "EDIT_PERIOD" && (
                <div className="modal-overlay animate-fade-in" style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
                }}>
                    <div className="modal-content animate-scale-in" style={{ width: "450px", maxWidth: "95%", fontFamily: "var(--font-geist-sans)" }}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                {modalTitle}
                            </h3>
                        </div>
                        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Payroll Period</label>
                                <CustomDatePicker
                                    value={editPeriodData.payrollPeriod}
                                    onChange={(value) => setEditPeriodData({ ...editPeriodData, payrollPeriod: value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Entity / Department</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editPeriodData.entity}
                                    onChange={(e) => setEditPeriodData({ ...editPeriodData, entity: e.target.value })}
                                    placeholder="Enter entity name"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary btn-click-effect"
                                onClick={closeModal}
                                style={{ fontWeight: 500 }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary btn-click-effect"
                                onClick={submitEditPeriod}
                                disabled={processing}
                                style={{ fontWeight: 500 }}
                            >
                                {processing ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
