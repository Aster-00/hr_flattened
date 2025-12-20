"use client";
import { useEffect, useState } from "react";
import { payrollExecutionApi } from "../../services/payrollExecutionApi";
import { ChevronDown, ChevronUp, Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface PayslipDetail {
    _id: string;
    payrollRunId?: {
        payrollPeriod: string;
        runId: string;
        paymentStatus?: string;
    };
    earningsDetails?: {
        baseSalary?: number;
        allowances?: Array<{ type?: string; name?: string; amount?: number }>;
        bonuses?: Array<{ reason?: string; givenAmount?: number }>;
        benefits?: Array<{ type?: string; givenAmount?: number }>;
        refunds?: Array<{ reason?: string; amount?: number }>;
    };
    deductionsDetails?: {
        taxes?: Array<{ bracket?: string; deductionAmount?: number }>;
        insurances?: Array<{ employeeRate?: number; employeeContribution?: number }>;
        penalties?: { penaltyDays?: number; amountDeducted?: number };
    };
    totalGrossSalary: number;
    totaDeductions?: number;
    netPay: number;
    paymentStatus?: string;
    createdAt: string;
}

export default function MyPayslips() {
    const [payslips, setPayslips] = useState<PayslipDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await payrollExecutionApi.getMyPayslips();
                setPayslips(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) return <div className="card">Loading your payslips...</div>;

    return (
        <div className="card">
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Wallet size={24} /> My Payslips
            </h2>
            {payslips.length === 0 ? (
                <div className="alert alert-info">
                    No payslips found for your account.
                    <br />
                    <small>Note: Payslips are only generated for employees included in a finalized payroll run.</small>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {payslips.map((p, index) => {
                        const isExpanded = expandedId === p._id;
                        const status = p.paymentStatus || p.payrollRunId?.paymentStatus || "PENDING";
                        const isPaid = status.toString().toUpperCase() === "PAID";

                        return (
                            <div
                                key={p._id}
                                className="animate-slide-up"
                                style={{
                                    border: "1px solid var(--border-light)",
                                    borderRadius: "0.75rem",
                                    overflow: "hidden",
                                    animationDelay: `${index * 0.05}s`
                                }}
                            >
                                {/* Summary Row - Clickable */}
                                <div
                                    onClick={() => toggleExpand(p._id)}
                                    style={{
                                        padding: "1rem 1.5rem",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        background: isExpanded ? "var(--bg-secondary)" : "transparent",
                                        transition: "background 0.2s"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: "1rem" }}>
                                                {p.payrollRunId?.payrollPeriod
                                                    ? new Date(p.payrollRunId.payrollPeriod).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
                                                    : "N/A"}
                                            </div>
                                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                                Run: {p.payrollRunId?.runId || "N/A"}
                                            </div>
                                        </div>
                                        <span className={`badge ${isPaid ? "badge-success" : "badge-warning"}`}>
                                            {status}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Net Pay</div>
                                            <div style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--success)" }}>
                                                EGP {p.netPay?.toLocaleString()}
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="animate-expand" style={{
                                        padding: "1.5rem",
                                        borderTop: "1px solid var(--border-light)",
                                        background: "var(--bg-tertiary)"
                                    }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                                            {/* EARNINGS */}
                                            <div>
                                                <h4 style={{
                                                    display: "flex", alignItems: "center", gap: "0.5rem",
                                                    marginBottom: "1rem", color: "var(--success)", fontWeight: 600
                                                }}>
                                                    <TrendingUp size={18} /> Earnings
                                                </h4>
                                                <table style={{ width: "100%", fontSize: "0.9rem" }}>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{ padding: "0.5rem 0" }}>Base Salary</td>
                                                            <td style={{ textAlign: "right", fontWeight: 500 }}>
                                                                EGP {p.earningsDetails?.baseSalary?.toLocaleString() || 0}
                                                            </td>
                                                        </tr>
                                                        {p.earningsDetails?.allowances?.map((a, i) => (
                                                            <tr key={`allowance-${i}`}>
                                                                <td style={{ padding: "0.5rem 0", paddingLeft: "1rem", color: "var(--text-secondary)" }}>
                                                                    + {a.type || a.name || "Allowance"}
                                                                </td>
                                                                <td style={{ textAlign: "right" }}>
                                                                    EGP {a.amount?.toLocaleString() || 0}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {p.earningsDetails?.bonuses?.map((b, i) => (
                                                            <tr key={`bonus-${i}`}>
                                                                <td style={{ padding: "0.5rem 0", paddingLeft: "1rem", color: "var(--text-secondary)" }}>
                                                                    + Bonus ({b.reason || "Signing"})
                                                                </td>
                                                                <td style={{ textAlign: "right" }}>
                                                                    EGP {b.givenAmount?.toLocaleString() || 0}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {p.earningsDetails?.benefits?.map((b, i) => (
                                                            <tr key={`benefit-${i}`}>
                                                                <td style={{ padding: "0.5rem 0", paddingLeft: "1rem", color: "var(--text-secondary)" }}>
                                                                    + Benefit ({b.type || "End of Service"})
                                                                </td>
                                                                <td style={{ textAlign: "right" }}>
                                                                    EGP {b.givenAmount?.toLocaleString() || 0}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {p.earningsDetails?.refunds?.map((r, i) => (
                                                            <tr key={`refund-${i}`}>
                                                                <td style={{ padding: "0.5rem 0", paddingLeft: "1rem", color: "var(--text-secondary)" }}>
                                                                    + Refund ({r.reason || "Other"})
                                                                </td>
                                                                <td style={{ textAlign: "right" }}>
                                                                    EGP {r.amount?.toLocaleString() || 0}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr style={{ borderTop: "1px solid var(--border-light)" }}>
                                                            <td style={{ padding: "0.75rem 0", fontWeight: 600 }}>Total Gross</td>
                                                            <td style={{ textAlign: "right", fontWeight: 700, color: "var(--success)" }}>
                                                                EGP {p.totalGrossSalary?.toLocaleString() || 0}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* DEDUCTIONS */}
                                            <div>
                                                <h4 style={{
                                                    display: "flex", alignItems: "center", gap: "0.5rem",
                                                    marginBottom: "1rem", color: "var(--error)", fontWeight: 600
                                                }}>
                                                    <TrendingDown size={18} /> Deductions
                                                </h4>
                                                <table style={{ width: "100%", fontSize: "0.9rem" }}>
                                                    <tbody>
                                                        {p.deductionsDetails?.taxes?.map((t, i) => (
                                                            <tr key={`tax-${i}`}>
                                                                <td style={{ padding: "0.5rem 0" }}>
                                                                    Tax {t.bracket ? `(${t.bracket})` : ""}
                                                                </td>
                                                                <td style={{ textAlign: "right", color: "var(--error)" }}>
                                                                    - EGP {t.deductionAmount?.toLocaleString() || 0}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {p.deductionsDetails?.insurances?.map((ins, i) => (
                                                            <tr key={`ins-${i}`}>
                                                                <td style={{ padding: "0.5rem 0" }}>
                                                                    Insurance ({ins.employeeRate || 0}%)
                                                                </td>
                                                                <td style={{ textAlign: "right", color: "var(--error)" }}>
                                                                    - EGP {ins.employeeContribution?.toLocaleString() || 0}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {p.deductionsDetails?.penalties && p.deductionsDetails.penalties.amountDeducted ? (
                                                            <tr>
                                                                <td style={{ padding: "0.5rem 0" }}>
                                                                    Penalties ({p.deductionsDetails.penalties.penaltyDays || 0} days)
                                                                </td>
                                                                <td style={{ textAlign: "right", color: "var(--error)" }}>
                                                                    - EGP {p.deductionsDetails.penalties.amountDeducted?.toLocaleString() || 0}
                                                                </td>
                                                            </tr>
                                                        ) : null}
                                                        <tr style={{ borderTop: "1px solid var(--border-light)" }}>
                                                            <td style={{ padding: "0.75rem 0", fontWeight: 600 }}>Total Deductions</td>
                                                            <td style={{ textAlign: "right", fontWeight: 700, color: "var(--error)" }}>
                                                                - EGP {p.totaDeductions?.toLocaleString() || 0}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* NET PAY SUMMARY */}
                                        <div style={{
                                            marginTop: "1.5rem",
                                            padding: "1rem 1.5rem",
                                            background: "linear-gradient(135deg, var(--primary), var(--primary-dark, #1565c0))",
                                            borderRadius: "0.5rem",
                                            color: "white",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <DollarSign size={24} />
                                                <div>
                                                    <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>Net Pay (Gross - Deductions)</div>
                                                    <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                                                        EGP {p.totalGrossSalary?.toLocaleString()} - EGP {p.totaDeductions?.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                                                EGP {p.netPay?.toLocaleString()}
                                            </div>
                                        </div>

                                        <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center" }}>
                                            Generated on {new Date(p.createdAt).toLocaleDateString('en-US', {
                                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
