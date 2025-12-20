"use client";
import { useEffect, useState } from "react";
import { payrollExecutionApi } from "../../services/payrollExecutionApi";
import { Check, X, AlertTriangle, ClipboardList, Edit2, Save } from "lucide-react";

export default function Phase0Review({ onComplete }: { onComplete: () => void }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ pendingBonuses: any[]; pendingBenefits: any[] }>({
        pendingBonuses: [],
        pendingBenefits: [],
    });
    const [error, setError] = useState("");
    const [editingBonusId, setEditingBonusId] = useState<string | null>(null);
    const [editingBenefitId, setEditingBenefitId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState<number>(0);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await payrollExecutionApi.getPendingItems();
            setData(res);
            // If no pending items, validate and notify parent
            if (res.pendingBonuses.length === 0 && res.pendingBenefits.length === 0) {
                const val = await payrollExecutionApi.validatePhase0();
                if (val.phase0Complete) {
                    onComplete();
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleBonusAction = async (id: string, status: string) => {
        try {
            await payrollExecutionApi.updateBonusStatus(id, status);
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleBenefitAction = async (id: string, status: string) => {
        try {
            await payrollExecutionApi.updateBenefitStatus(id, status);
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleEditBonus = (item: any) => {
        setEditingBonusId(item._id);
        setEditAmount(item.givenAmount);
    };

    const handleSaveBonus = async (id: string) => {
        try {
            await payrollExecutionApi.editBonus(id, editAmount);
            setEditingBonusId(null);
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleEditBenefit = (item: any) => {
        setEditingBenefitId(item._id);
        setEditAmount(item.givenAmount);
    };

    const handleSaveBenefit = async (id: string) => {
        try {
            await payrollExecutionApi.editBenefit(id, editAmount);
            setEditingBenefitId(null);
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return (
        <div className="card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}><div className="skeleton" style={{ width: "200px", height: "1.5rem" }}></div></h2>
            <div className="skeleton" style={{ height: "40px" }}></div>
            <div className="skeleton" style={{ height: "100px" }}></div>
        </div>
    );

    const hasItems = data.pendingBonuses.length > 0 || data.pendingBenefits.length > 0;

    return (
        <div className="card animate-fade-in">
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ClipboardList className="text-primary" size={24} />
                Pre-Run Review
            </h2>

            {error && <div className="alert alert-error">{error}</div>}

            {!hasItems && !error ? (
                <div className="alert alert-success">
                    No pending items found. You can proceed to Initiation.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div className="alert alert-warning" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <AlertTriangle size={20} />
                        <div>
                            <strong>Attention Needed:</strong> There are pending items that must be resolved before running payroll.
                        </div>
                    </div>

                    {/* Bonuses */}
                    {data.pendingBonuses.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Pending Signing Bonuses</h3>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.pendingBonuses.map((item, i) => (
                                        <tr key={item._id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                            <td>{item.employeeId}</td>
                                            <td>
                                                {editingBonusId === item._id ? (
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        style={{ width: "120px", padding: "0.25rem 0.5rem" }}
                                                        value={editAmount}
                                                        onChange={(e) => setEditAmount(Number(e.target.value))}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span style={{ fontWeight: 500 }}>EGP {item.givenAmount?.toLocaleString()}</span>
                                                )}
                                            </td>
                                            <td style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                                {editingBonusId === item._id ? (
                                                    <>
                                                        <button
                                                            className="btn-success btn-click-effect"
                                                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                                                            onClick={() => handleSaveBonus(item._id)}
                                                        >
                                                            <Save size={14} />
                                                            Save
                                                        </button>
                                                        <button
                                                            className="btn-secondary btn-click-effect"
                                                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                                                            onClick={() => setEditingBonusId(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="btn-secondary btn-click-effect"
                                                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                                                            onClick={() => handleEditBonus(item)}
                                                        >
                                                            <Edit2 size={14} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn-success btn-click-effect"
                                                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                                                            onClick={() => handleBonusAction(item._id, "APPROVED")}
                                                        >
                                                            <Check size={14} />
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn-danger btn-click-effect"
                                                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                                                            onClick={() => handleBonusAction(item._id, "REJECTED")}
                                                        >
                                                            <X size={14} />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Benefits */}
                    {data.pendingBenefits.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Pending Benefits (Termination/Resignation)</h3>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.pendingBenefits.map((item, i) => (
                                        <tr key={item._id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                            <td>{item.employeeId}</td>
                                            <td>
                                                {editingBenefitId === item._id ? (
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        style={{ width: "120px", padding: "0.25rem 0.5rem" }}
                                                        value={editAmount}
                                                        onChange={(e) => setEditAmount(Number(e.target.value))}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span style={{ fontWeight: 500 }}>EGP {item.givenAmount?.toLocaleString()}</span>
                                                )}
                                            </td>
                                            <td style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                                {editingBenefitId === item._id ? (
                                                    <>
                                                        <button
                                                            className="btn-success btn-click-effect"
                                                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                                                            onClick={() => handleSaveBenefit(item._id)}
                                                        >
                                                            <Save size={14} />
                                                            Save
                                                        </button>
                                                        <button
                                                            className="btn-secondary btn-click-effect"
                                                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                                                            onClick={() => setEditingBenefitId(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="btn-secondary btn-click-effect"
                                                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                                                            onClick={() => handleEditBenefit(item)}
                                                        >
                                                            <Edit2 size={14} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn-success btn-click-effect"
                                                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                                                            onClick={() => handleBenefitAction(item._id, "APPROVED")}
                                                        >
                                                            <Check size={14} />
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn-danger btn-click-effect"
                                                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                                                            onClick={() => handleBenefitAction(item._id, "REJECTED")}
                                                        >
                                                            <X size={14} />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
