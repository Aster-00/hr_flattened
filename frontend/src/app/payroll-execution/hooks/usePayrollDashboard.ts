import { useState, useEffect } from "react";
import { payrollExecutionApi } from "../services/payrollExecutionApi";
import { PayrollRun } from "../types";

export const usePayrollDashboard = () => {
    const [activeTab, setActiveTab] = useState<"CURRENT" | "HISTORY">("CURRENT");
    const [currentRun, setCurrentRun] = useState<PayrollRun | null>(null);
    const [history, setHistory] = useState<PayrollRun[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [anomalies, setAnomalies] = useState<any[]>([]);
    const [showAnomalies, setShowAnomalies] = useState(false);

    const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<"UNFREEZE" | "REJECT_MANAGER" | "REJECT_FINANCE" | "START_CALC" | "EXECUTE" | "SUBMIT_REVIEW" | "EDIT_PERIOD" | "ALERT" | null>(null);
    const [modalReason, setModalReason] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [targetRunId, setTargetRunId] = useState<string | null>(null);
    const [editPeriodData, setEditPeriodData] = useState<{ payrollPeriod: string; entity: string }>({ payrollPeriod: "", entity: "" });


    useEffect(() => {
        const loadUser = async () => {
            const user = await payrollExecutionApi.fetchCurrentUser();
            setCurrentUser(user);
        };
        loadUser();
    }, []);

    const fetchAnomalies = async (runId: string) => {
        try {
            const data = await payrollExecutionApi.getAnomalies(runId);
            setAnomalies(data);
        } catch (err) {
            console.error("Failed to fetch anomalies", err);
        }
    };

    const handleResolveAnomaly = async (payslipId: string, notes: string) => {
        try {
            setProcessing(true);
            await payrollExecutionApi.resolveAnomaly(payslipId, notes);
            if (currentRun) await fetchAnomalies(currentRun.runId);
        } catch (err: any) {
            console.error("Failed to resolve anomaly", err);
        } finally {
            setProcessing(false);
        }
    };

    const handleUnresolveAnomaly = async (payslipId: string) => {
        try {
            setProcessing(true);
            await payrollExecutionApi.unresolveAnomaly(payslipId);
            if (currentRun) await fetchAnomalies(currentRun.runId);
        } catch (err: any) {
            console.error("Failed to unresolve anomaly", err);
        } finally {
            setProcessing(false);
        }
    };


    const loadData = async (type: "CURRENT" | "HISTORY" | "REFRESH_SPECIFIC" = "CURRENT", specificRunId?: string) => {
        try {
            setLoading(true);
            if (type === "REFRESH_SPECIFIC" && specificRunId) {
                const runs = await payrollExecutionApi.getAllRuns();
                const updatedRun = runs.find(r => r.runId === specificRunId);
                if (updatedRun) {
                    setCurrentRun(updatedRun);
                    fetchAnomalies(updatedRun.runId);
                }
            } else if (type === "CURRENT") {
                const run = await payrollExecutionApi.getCurrentRun();
                setCurrentRun(run);
                if (run) fetchAnomalies(run.runId);
            } else {
                const runs = await payrollExecutionApi.getAllRuns();
                setHistory(runs);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData("CURRENT");
    }, []);

    const handleTabChange = (tab: "CURRENT" | "HISTORY") => {
        setActiveTab(tab);
        if (tab === "CURRENT" && currentRun) {
            loadData("REFRESH_SPECIFIC", currentRun.runId);
        } else {
            loadData(tab);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalAction(null);
    };

    const showAlert = (title: string, message: string) => {
        setModalAction("ALERT");
        setModalTitle(title);
        setModalMessage(message);
        setModalOpen(true);
    };

    const openInputModal = (action: "UNFREEZE" | "REJECT_MANAGER" | "REJECT_FINANCE", runId: string) => {
        setModalAction(action);
        setTargetRunId(runId);
        setModalReason("");
        setModalTitle(action === "UNFREEZE" ? "Unfreeze Payroll" : "Reject Payroll");
        setModalMessage("");
        setModalOpen(true);
    };

    const openConfirmModal = (action: "START_CALC" | "EXECUTE" | "SUBMIT_REVIEW", runId: string, title: string, message: string) => {
        setModalAction(action);
        setTargetRunId(runId);
        setModalTitle(title);
        setModalMessage(message);
        setModalOpen(true);
    };

    const handleStartCalculation = (runId: string) => {
        openConfirmModal("START_CALC", runId, "Start Calculation", "Are you sure you want to start/re-calculate this payroll run?");
    };

    const handleManagerApprove = async (runId: string) => {
        if (!currentUser) return;
        try {
            setProcessing(true);
            await payrollExecutionApi.approveByManager(runId, currentUser.id);
            showAlert("Approved", "Run approved. Awaiting Finance confirmation.");
            loadData();
        } catch (err: any) {
            showAlert("Error", err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleFinanceApprove = async (runId: string) => {
        if (!currentUser) return;
        try {
            setProcessing(true);
            await payrollExecutionApi.approveByFinance(runId, currentUser.id);
            showAlert("Finalized", "Payments processed and run finalized.");
            loadData();
        } catch (err: any) {
            showAlert("Error", err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleExecute = (runId: string) => {
        openConfirmModal("EXECUTE", runId, "Execute Payroll", "Are you sure you want to EXECUTE this payroll run? This will finalize payments and lock the run.");
    };

    const handleExportBankFile = async (runId: string) => {
        try {
            const blob = await payrollExecutionApi.exportBankFile(runId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `bank_file_${runId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            showAlert("Error", err.message);
        }
    };

    const handleSelectRun = (run: PayrollRun) => {
        setCurrentRun(run);
        setActiveTab("CURRENT");
        fetchAnomalies(run.runId);
    };

    const submitModal = async () => {
        if (modalAction === "ALERT") {
            closeModal();
            return;
        }

        if (!targetRunId || !currentUser) return;

        if ((modalAction === "UNFREEZE" || modalAction === "REJECT_MANAGER" || modalAction === "REJECT_FINANCE") && !modalReason) {
            return;
        }

        try {
            setProcessing(true);


            if (modalAction === "START_CALC") {
                await payrollExecutionApi.startCalculation(targetRunId);
                showAlert("Calculated", "Figures updated successfully.");
                loadData("REFRESH_SPECIFIC", targetRunId);
                return;
            }

            if (modalAction === "SUBMIT_REVIEW") {
                await payrollExecutionApi.submitForReview(targetRunId);
                showAlert("Submitted", "Run submitted to Manager for review.");
                loadData("REFRESH_SPECIFIC", targetRunId);
                return;
            }

            if (modalAction === "EXECUTE") {
                await payrollExecutionApi.executePayroll(targetRunId);
                showAlert("Executed", "Run executed and locked.");
                loadData("REFRESH_SPECIFIC", targetRunId);
                return;
            }

            if (modalAction === "UNFREEZE") {
                await payrollExecutionApi.unfreezePayroll(targetRunId, currentUser.id, modalReason);
                showAlert("Unfrozen", "Run unlocked. Reverted to Approved status.");
            } else if (modalAction === "REJECT_MANAGER") {
                await payrollExecutionApi.rejectByManager(targetRunId, currentUser.id, modalReason);
                showAlert("Rejected", "Rejected by Manager. Returned for revision.");
            } else if (modalAction === "REJECT_FINANCE") {
                await payrollExecutionApi.rejectByFinance(targetRunId, currentUser.id, modalReason);
                showAlert("Rejected", "Rejected by Finance. Returned for revision.");
            }

            loadData("REFRESH_SPECIFIC", targetRunId);
        } catch (err: any) {
            showAlert("Error", err.message || "Action failed");
        } finally {
            setProcessing(false);
        }
    };


    const handleSubmitForReview = (runId: string) => {
        openConfirmModal("SUBMIT_REVIEW", runId, "Submit for Review", "Submit this payroll run to the Payroll Manager for review? Status will change to 'Under Review'.");
    };

    const handleEditPeriod = (run: PayrollRun) => {
        setModalAction("EDIT_PERIOD");
        setTargetRunId(run.runId);
        setEditPeriodData({
            payrollPeriod: new Date(run.payrollPeriod).toISOString().slice(0, 7), // YYYY-MM format
            entity: run.entity || ""
        });
        setModalTitle("Edit Payroll Period");
        setModalOpen(true);
    };

    const submitEditPeriod = async () => {
        if (!targetRunId) return;
        try {
            setProcessing(true);
            await payrollExecutionApi.editPayrollPeriod(targetRunId, editPeriodData);
            showAlert("Updated", "Payroll period updated. You can now recalculate.");
            loadData("REFRESH_SPECIFIC", targetRunId);
        } catch (err: any) {
            showAlert("Error", err.message);
        } finally {
            setProcessing(false);
        }
    };

    return {
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
        handleSubmitForReview,
        handleManagerApprove,
        handleFinanceApprove,
        handleExecute,
        handleExportBankFile,
        handleSelectRun,
        handleEditPeriod,
        handleResolveAnomaly,
        handleUnresolveAnomaly,
        submitModal,
        submitEditPeriod
    };
};