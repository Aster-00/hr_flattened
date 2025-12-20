"use client";

import { useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { CRUDTable } from "./CRUDTable";
import { StatusBadge } from "./StatusBadge";
import { apiClient } from "../lib/apiClient";
import ApprovalModal from "./ApprovalModal";
import RejectionModal from "./RejectionModal";
import { ToastProvider, useToast } from "./ToastProvider";
import { UserProvider, useUser, UserRole } from "../lib/userContext";
import { Modal } from "./Modal";

type TabType = "all" | "pay-types" | "pay-grades" | "payroll-policies" | "allowances" | "insurance-brackets" | "company-settings" | "signing-bonus" | "tax-rule" | "termination-benefit";

interface PendingItem {
  _id: string;
  name?: string;
  type?: string;
  grade?: string;
  policyName?: string;
  amount?: number;
  status: "draft";
  createdAt: Date | string;
  [key: string]: any;
}

function ApprovalWorkflowContent() {
  const { showToast } = useToast();
  const { user, isLoading: userLoading } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [allPendingItems, setAllPendingItems] = useState<Record<TabType, PendingItem[]>>({
    "all": [],
    "pay-types": [],
    "pay-grades": [],
    "payroll-policies": [],
    "allowances": [],
    "insurance-brackets": [],
    "company-settings": [],
    "signing-bonus": [],
    "tax-rule": [],
    "termination-benefit": [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingItemId, setProcessingItemId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkApproveModal, setShowBulkApproveModal] = useState(false);
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; message: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<string>("all");

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "all", label: "All", icon: "[All]" },
    { id: "pay-types", label: "Pay Types", icon: "[$]" },
    { id: "pay-grades", label: "Pay Grades", icon: "[G]" },
    { id: "payroll-policies", label: "Policies", icon: "[P]" },
    { id: "allowances", label: "Allowances", icon: "[A]" },
    { id: "insurance-brackets", label: "Insurance", icon: "[I]" },
    { id: "signing-bonus", label: "Bonuses", icon: "[B]" },
    { id: "tax-rule", label: "Tax", icon: "[T]" },
    { id: "termination-benefit", label: "Termination", icon: "[X]" },
    { id: "company-settings", label: "Settings", icon: "[C]" },
  ];

  const approveItem = async (type: string, id: string, approvedBy: string) => {
    const endpoints: Record<string, string> = {
      "pay-types": `/payroll-configuration/pay-types/${id}/approve`,
      "pay-grades": `/payroll-configuration/pay-grades/${id}/approve`,
      "payroll-policies": `/payroll-configuration/payroll-policies/${id}/approve`,
      "allowances": `/payroll-configuration/allowances/${id}/status`,
      "insurance-brackets": `/payroll-configuration/insurance-brackets/${id}/status`,
      "company-settings": `/payroll-configuration/company-settings/${id}/approve`,
      "signing-bonus": `/payroll-configuration/signing-bonus/${id}/approve`,
      "tax-rule": `/payroll-configuration/tax-rule/${id}/approve`,
      "termination-benefit": `/payroll-configuration/termination-benefit/${id}/approve`,
    };

    const endpoint = endpoints[type];
    if (!endpoint) {
      throw new Error(`Unknown configuration type: ${type}`);
    }

    if (["pay-types", "pay-grades", "payroll-policies", "company-settings"].includes(type)) {
      await apiClient.post(endpoint, { approvedBy });
    } else {
      await apiClient.patch(endpoint, { status: "approved", approverId: approvedBy });
    }
  };

  const rejectItem = async (type: string, id: string, rejectedBy: string, reason: string) => {
    const endpoints: Record<string, string> = {
      "pay-types": `/payroll-configuration/pay-types/${id}/reject`,
      "pay-grades": `/payroll-configuration/pay-grades/${id}/reject`,
      "payroll-policies": `/payroll-configuration/payroll-policies/${id}/reject`,
      "allowances": `/payroll-configuration/allowances/${id}/status`,
      "insurance-brackets": `/payroll-configuration/insurance-brackets/${id}/status`,
      "company-settings": `/payroll-configuration/company-settings/${id}/reject`,
      "signing-bonus": `/payroll-configuration/signing-bonus/${id}/reject`,
      "tax-rule": `/payroll-configuration/tax-rule/${id}/reject`,
      "termination-benefit": `/payroll-configuration/termination-benefit/${id}/reject`,
    };

    const endpoint = endpoints[type];
    if (!endpoint) {
      throw new Error(`Unknown configuration type: ${type}`);
    }

    if (["pay-types", "pay-grades", "payroll-policies", "company-settings"].includes(type)) {
      await apiClient.post(endpoint, { rejectedBy, reason });
    } else {
      await apiClient.patch(endpoint, { status: "rejected", approverId: rejectedBy });
    }
  };

  const deleteItem = async (type: string, id: string) => {
    const endpoints: Record<string, string> = {
      "pay-types": `/payroll-configuration/pay-types/${id}`,
      "pay-grades": `/payroll-configuration/pay-grades/${id}`,
      "payroll-policies": `/payroll-configuration/payroll-policies/${id}`,
      "allowances": `/payroll-configuration/allowances/${id}`,
      "insurance-brackets": `/payroll-configuration/insurance-brackets/${id}`,
      "company-settings": `/payroll-configuration/company-settings/${id}`,
      "signing-bonus": `/payroll-configuration/signing-bonus/${id}`,
      "tax-rule": `/payroll-configuration/tax-rule/${id}`,
      "termination-benefit": `/payroll-configuration/termination-benefit/${id}`,
    };

    const endpoint = endpoints[type];
    if (!endpoint) {
      throw new Error(`Unknown configuration type: ${type}`);
    }

    await apiClient.delete(endpoint);
  };

  const fetchPendingItems = async (showLoadingToast = false) => {
    setIsLoading(true);
    setError("");

    try {
      if (showLoadingToast) {
        showToast("Loading pending items...", "info");
      }
      const [
        payTypes, payGrades, policies, allowances, insuranceBrackets, companySettings,
        signingBonuses, taxRules, terminationBenefits
      ] = await Promise.all([
        apiClient.get("/payroll-configuration/pay-types?status=draft").catch(() => []),
        apiClient.get("/payroll-configuration/pay-grades?status=draft").catch(() => []),
        apiClient.get("/payroll-configuration/payroll-policies?status=draft").catch(() => []),
        apiClient.get("/payroll-configuration/allowances?status=draft").catch(() => []),
        apiClient.get("/payroll-configuration/insurance-brackets?status=draft").catch(() => []),
        apiClient.get("/payroll-configuration/company-settings?status=draft").catch(() => []),
        apiClient.get("/payroll-configuration/signing-bonus?status=draft").catch(() => []),
        apiClient.get("/payroll-configuration/tax-rule?status=draft").catch(() => []),
        apiClient.get("/payroll-configuration/termination-benefit?status=draft").catch(() => []),
      ]);

      const typedPayTypes = (payTypes || []).map((item: any) => ({ ...item, itemType: "pay-types" }));
      const typedPayGrades = (payGrades || []).map((item: any) => ({ ...item, itemType: "pay-grades" }));
      const typedPolicies = (policies || []).map((item: any) => ({ ...item, itemType: "payroll-policies" }));
      const typedAllowances = (allowances || []).map((item: any) => ({ ...item, itemType: "allowances" }));
      const typedInsuranceBrackets = (insuranceBrackets || []).map((item: any) => ({ ...item, itemType: "insurance-brackets" }));
      const typedSigningBonuses = (signingBonuses || []).map((item: any) => ({ ...item, itemType: "signing-bonus" }));
      const typedTaxRules = (taxRules || []).map((item: any) => ({ ...item, itemType: "tax-rule" }));
      const typedTerminationBenefits = (terminationBenefits || []).map((item: any) => ({ ...item, itemType: "termination-benefit" }));

      // Handle companySettings which might be a single object or an array
      const companySettingsArray = Array.isArray(companySettings) ? companySettings : (companySettings ? [companySettings] : []);
      const typedCompanySettings = companySettingsArray.map((item: any) => ({ ...item, itemType: "company-settings" }));

      const allItems: Record<TabType, PendingItem[]> = {
        "all": [
          ...typedPayTypes, ...typedPayGrades, ...typedPolicies, ...typedAllowances,
          ...typedInsuranceBrackets, ...typedCompanySettings, ...typedSigningBonuses,
          ...typedTaxRules, ...typedTerminationBenefits
        ],
        "pay-types": typedPayTypes,
        "pay-grades": typedPayGrades,
        "payroll-policies": typedPolicies,
        "allowances": typedAllowances,
        "insurance-brackets": typedInsuranceBrackets,
        "company-settings": typedCompanySettings,
        "signing-bonus": typedSigningBonuses,
        "tax-rule": typedTaxRules,
        "termination-benefit": typedTerminationBenefits,
      };

      setAllPendingItems(allItems);
    } catch (err: any) {
      console.error("Error fetching pending items:", err);
      const errorMessage = err.message || "Failed to load pending configurations";
      setError(errorMessage);
      showToast(`Failed to load items: ${errorMessage}`, "error");
      setAllPendingItems({
        "all": [],
        "pay-types": [],
        "pay-grades": [],
        "payroll-policies": [],
        "allowances": [],
        "insurance-brackets": [],
        "company-settings": [],
        "signing-bonus": [],
        "tax-rule": [],
        "termination-benefit": [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingItems(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const uniqueCreators = useMemo(() => {
    const allItems = allPendingItems["all"] || [];
    const creators = new Set<string>();
    allItems.forEach((item) => {
      if (item.createdBy) {
        creators.add(item.createdBy);
      }
    });
    return Array.from(creators).sort();
  }, [allPendingItems]);

  const filteredItems = useMemo(() => {
    let items = allPendingItems[activeTab] || [];

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      items = items.filter((item) => {
        const name = (item.name || item.grade || item.policyName || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        return name.includes(query) || description.includes(query);
      });
    }

    if (dateFrom || dateTo) {
      items = items.filter((item) => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        itemDate.setHours(0, 0, 0, 0);

        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (itemDate < fromDate) return false;
        }

        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (itemDate > toDate) return false;
        }

        return true;
      });
    }

    if (selectedCreator !== "all") {
      items = items.filter((item) => item.createdBy === selectedCreator);
    }

    return items;
  }, [allPendingItems, activeTab, debouncedSearchQuery, dateFrom, dateTo, selectedCreator]);

  const currentItems = filteredItems;
  const itemCount = currentItems.length;
  const unfilteredCount = allPendingItems[activeTab]?.length || 0;

  const selectedItems = currentItems.filter((item) => selectedIds.includes(item._id));

  const getSelectedItemsType = (): string | null => {
    if (selectedItems.length === 0) return null;
    const firstType = selectedItems[0].itemType || activeTab;
    const allSameType = selectedItems.every((item) => (item.itemType || activeTab) === firstType);
    return allSameType ? firstType : null;
  };

  const selectedItemsType = getSelectedItemsType();
  const canBulkAction = selectedItems.length > 0 && selectedItemsType !== null;

  const hasActiveFilters = useMemo(() => {
    return debouncedSearchQuery.trim() !== "" || dateFrom !== "" || dateTo !== "" || selectedCreator !== "all";
  }, [debouncedSearchQuery, dateFrom, dateTo, selectedCreator]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setSelectedCreator("all");
  }, []);

  const getTabLabel = (tab: { id: TabType; label: string; icon: string }): string => {
    const count = allPendingItems[tab.id]?.length || 0;
    return `${tab.label} (${count})`;
  };

  const normalizeItemForModal = (item: PendingItem) => {
    const name = item.name || item.grade || item.policyName || "Unknown";
    const type = item.itemType || "configuration";
    return {
      _id: item._id,
      name,
      type,
      createdAt: item.createdAt,
    };
  };

  const handleApprove = (item: PendingItem) => {
    if (isLoading || isProcessing) return;
    setSelectedItem(item);
    setShowApprovalModal(true);
  };

  const handleReject = (item: PendingItem) => {
    if (isLoading || isProcessing) return;
    setSelectedItem(item);
    setShowRejectionModal(true);
  };

  const handleDelete = async (item: PendingItem) => {
    if (isLoading || isProcessing) return;

    const itemName = item.name || item.grade || item.policyName || "this item";
    const confirmed = window.confirm(
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    setProcessingItemId(item._id);
    setError("");

    try {
      const itemType = item.itemType || activeTab;
      await deleteItem(itemType, item._id);
      showToast("Configuration deleted successfully", "success");
      setProcessingItemId(null);
      await fetchPendingItems();
    } catch (err: any) {
      console.error("Error deleting item:", err);
      const errorMessage = err.message || "Failed to delete configuration";
      setError(errorMessage);
      showToast(`Failed to delete: ${errorMessage}`, "error");
      setProcessingItemId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveConfirm = async (approvedBy: string) => {
    if (!selectedItem) return;

    setIsProcessing(true);
    setProcessingItemId(selectedItem._id);
    setError("");

    try {
      const itemType = selectedItem.itemType || activeTab;
      await approveItem(itemType, selectedItem._id, approvedBy);
      showToast("Configuration approved successfully", "success");
      setShowApprovalModal(false);
      setSelectedItem(null);
      setProcessingItemId(null);
      await fetchPendingItems();
    } catch (err: any) {
      console.error("Error approving item:", err);
      const errorMessage = err.message || "Failed to approve configuration";
      setError(errorMessage);
      showToast(`Failed to approve: ${errorMessage}`, "error");
      setProcessingItemId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async (rejectedBy: string, reason: string) => {
    if (!selectedItem) return;

    setIsProcessing(true);
    setProcessingItemId(selectedItem._id);
    setError("");

    try {
      const itemType = selectedItem.itemType || activeTab;
      await rejectItem(itemType, selectedItem._id, rejectedBy, reason);
      showToast("Configuration rejected", "success");
      setShowRejectionModal(false);
      setSelectedItem(null);
      setProcessingItemId(null);
      await fetchPendingItems();
    } catch (err: any) {
      console.error("Error rejecting item:", err);
      const errorMessage = err.message || "Failed to reject configuration";
      setError(errorMessage);
      showToast(`Failed to reject: ${errorMessage}`, "error");
      setProcessingItemId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveCancel = () => {
    setShowApprovalModal(false);
    setSelectedItem(null);
  };

  const handleRejectCancel = () => {
    setShowRejectionModal(false);
    setSelectedItem(null);
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState<PendingItem | null>(null);

  const handleViewDetails = (item: PendingItem) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  const handleBulkApprove = async (approvedBy: string) => {
    if (!selectedItemsType || selectedItems.length === 0) return;

    setBulkProgress({ current: 0, total: selectedItems.length, message: "Starting bulk approval..." });
    const results: { success: string[]; failed: Array<{ id: string; error: string }> } = {
      success: [],
      failed: [],
    };

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      setBulkProgress({
        current: i + 1,
        total: selectedItems.length,
        message: `Approving ${i + 1} of ${selectedItems.length}...`,
      });

      try {
        await approveItem(selectedItemsType, item._id, approvedBy);
        results.success.push(item._id);
      } catch (err: any) {
        results.failed.push({
          id: item._id,
          error: err.message || "Failed to approve",
        });
      }
    }

    setBulkProgress(null);
    setShowBulkApproveModal(false);

    if (results.failed.length === 0) {
      showToast(`Successfully approved ${results.success.length} items`, "success");
      setSelectedIds([]);
    } else {
      showToast(
        `Approved ${results.success.length} items, ${results.failed.length} failed`,
        results.success.length > 0 ? "warning" : "error"
      );
      setSelectedIds(results.failed.map((f) => f.id));
    }

    await fetchPendingItems();
  };

  const handleBulkReject = async (rejectedBy: string, reason: string) => {
    if (!selectedItemsType || selectedItems.length === 0) return;

    setBulkProgress({ current: 0, total: selectedItems.length, message: "Starting bulk rejection..." });
    const results: { success: string[]; failed: Array<{ id: string; error: string }> } = {
      success: [],
      failed: [],
    };

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      setBulkProgress({
        current: i + 1,
        total: selectedItems.length,
        message: `Rejecting ${i + 1} of ${selectedItems.length}...`,
      });

      try {
        await rejectItem(selectedItemsType, item._id, rejectedBy, reason);
        results.success.push(item._id);
      } catch (err: any) {
        results.failed.push({
          id: item._id,
          error: err.message || "Failed to reject",
        });
      }
    }

    setBulkProgress(null);
    setShowBulkRejectModal(false);

    if (results.failed.length === 0) {
      showToast(`Successfully rejected ${results.success.length} items`, "success");
      setSelectedIds([]);
    } else {
      showToast(
        `Rejected ${results.success.length} items, ${results.failed.length} failed`,
        results.success.length > 0 ? "warning" : "error"
      );
      setSelectedIds(results.failed.map((f) => f.id));
    }

    await fetchPendingItems();
  };

  const getColumns = () => {
    const baseColumns: Array<{
      key: string;
      label: string;
      render?: (value: any, row: any) => ReactNode;
      hideOnMobile?: boolean;
      hideOnTablet?: boolean;
    }> = [];

    switch (activeTab) {
      case "pay-types":
        baseColumns.push(
          { key: "type", label: "Type", render: (value: string) => value?.charAt(0).toUpperCase() + value?.slice(1) },
          { key: "amount", label: "Amount", render: (value: number) => `$${value?.toLocaleString()}` },
          { key: "status", label: "Status", render: (value: string) => <StatusBadge status={value as "draft" | "approved" | "rejected"} /> }
        );
        break;
      case "pay-grades":
        baseColumns.push(
          { key: "grade", label: "Grade" },
          { key: "baseSalary", label: "Base Salary", render: (value: number) => `$${value?.toLocaleString()}`, hideOnMobile: true },
          { key: "grossSalary", label: "Gross Salary", render: (value: number) => `$${value?.toLocaleString()}`, hideOnMobile: true },
          { key: "status", label: "Status", render: (value: string) => <StatusBadge status={value as "draft" | "approved" | "rejected"} /> }
        );
        break;
      case "payroll-policies":
        baseColumns.push(
          { key: "policyName", label: "Policy Name" },
          { key: "policyType", label: "Policy Type", hideOnMobile: true },
          { key: "status", label: "Status", render: (value: string) => <StatusBadge status={value as "draft" | "approved" | "rejected"} /> }
        );
        break;
      case "allowances":
        baseColumns.push(
          { key: "name", label: "Name" },
          { key: "amount", label: "Amount", render: (value: number) => `$${value?.toLocaleString()}` },
          { key: "status", label: "Status", render: (value: string) => <StatusBadge status={value as "draft" | "approved" | "rejected"} /> }
        );
        break;
      case "insurance-brackets":
        baseColumns.push(
          { key: "name", label: "Name" },
          { key: "minSalary", label: "Min Salary", render: (value: number) => `$${value?.toLocaleString()}`, hideOnMobile: true },
          { key: "maxSalary", label: "Max Salary", render: (value: number) => `$${value?.toLocaleString()}`, hideOnMobile: true },
          { key: "status", label: "Status", render: (value: string) => <StatusBadge status={value as "draft" | "approved" | "rejected"} /> }
        );
        break;
      case "signing-bonus":
        baseColumns.push(
          { key: "name", label: "Name" },
          { key: "amount", label: "Amount", render: (value: number) => `$${value?.toLocaleString()}` },
          { key: "status", label: "Status", render: (value: string) => <StatusBadge status={value as "draft" | "approved" | "rejected"} /> }
        );
        break;
      case "tax-rule":
        baseColumns.push(
          { key: "name", label: "Rule Name" },
          { key: "rate", label: "Rate", render: (value: number) => `${value}%` },
          { key: "status", label: "Status", render: (value: string) => <StatusBadge status={value as "draft" | "approved" | "rejected"} /> }
        );
        break;
      case "termination-benefit":
        baseColumns.push(
          { key: "name", label: "Benefit Name" },
          { key: "amount", label: "Amount", render: (value: number) => `$${value?.toLocaleString()}` },
          { key: "status", label: "Status", render: (value: string) => <StatusBadge status={value as "draft" | "approved" | "rejected"} /> }
        );
        break;
      case "company-settings":
        baseColumns.push(
          { key: "timeZone", label: "Time Zone" },
          { key: "currency", label: "Currency" },
          {
            key: "payDate", label: "Pay Date", render: (value: any) => {
              if (!value) return "N/A";
              const date = typeof value === 'string' ? new Date(value) : value;
              return date.toLocaleDateString();
            }, hideOnMobile: true
          },
          { key: "status", label: "Status", render: (value: string) => <StatusBadge status={value as "draft" | "approved" | "rejected"} /> }
        );
        break;
      default:
        baseColumns.push(
          { key: "name", label: "Name", render: (value: any, row: any) => row.name || row.grade || row.policyName || "N/A" },
          {
            key: "type", label: "Type", render: (value: any, row: any) => {
              if (row.itemType === "company-settings") return "Company Settings";
              if (row.itemType === "signing-bonus") return "Signing Bonus";
              if (row.itemType === "tax-rule") return "Tax Rule";
              if (row.itemType === "termination-benefit") return "Termination Benefit";
              if (row.type) return "Pay Type";
              if (row.grade) return "Pay Grade";
              if (row.policyName) return "Payroll Policy";
              if (row.name && row.amount && row.itemType === "insurance-brackets") return "Insurance Bracket";
              if (row.name && row.amount) return "Allowance";
              return "Unknown";
            }
          },
          { key: "status", label: "Status", render: (value: string) => <StatusBadge status={value as "draft" | "approved" | "rejected"} /> }
        );
    }

    baseColumns.push({
      key: "actions",
      label: "Actions",
      render: (value: any, row: PendingItem) => {
        const isProcessingThisItem = processingItemId === row._id;
        const itemType = row.itemType || activeTab;
        const canApprove = canApproveItemType(itemType);

        return (
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            <button
              onClick={() => handleViewDetails(row)}
              disabled={isLoading || isProcessing}
              className="px-2 sm:px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs sm:text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              View
            </button>
            <button
              onClick={() => handleApprove(row)}
              disabled={isLoading || isProcessing || isProcessingThisItem || !canApprove}
              className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 ${canApprove
                ? "text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                : "text-gray-400 bg-gray-100 cursor-not-allowed"
                }`}
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(row)}
              disabled={isLoading || isProcessing || isProcessingThisItem || !canApprove}
              className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 ${canApprove
                ? "text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                : "text-gray-400 bg-gray-100 cursor-not-allowed"
                }`}
            >
              Reject
            </button>
            <button
              onClick={() => handleDelete(row)}
              disabled={isLoading || isProcessing || isProcessingThisItem || row.status !== "draft"}
              className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 ${row.status === "draft"
                ? "text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                : "text-gray-400 bg-gray-100 cursor-not-allowed"
                }`}
              title={row.status !== "draft" ? "Only draft items can be deleted" : "Delete this item"}
            >
              Delete
            </button>
          </div>
        );
      },
    });

    return baseColumns;
  };

  const canApproveItemType = (itemType: string): boolean => {
    if (!user) return false;
    if (user.role === "PayrollManager") {
      return ["pay-types", "pay-grades", "payroll-policies", "allowances", "company-settings", "signing-bonus", "tax-rule", "termination-benefit"].includes(itemType);
    } else if (user.role === "HRManager") {
      return itemType === "insurance-brackets";
    }
    return false;
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, tabId: TabType) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveTab(tabId);
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      const nextIndex = e.key === "ArrowRight"
        ? (currentIndex + 1) % tabs.length
        : (currentIndex - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[nextIndex].id);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {(isLoading || isProcessing) && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-[var(--gray-200)] z-50">
          <div className="h-full bg-[var(--primary-600)] animate-pulse" style={{ width: "100%" }}></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {userLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading user information...</p>
          </div>
        ) : !user ? (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Authentication Required:</strong> Please log in to access the approval workflow.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-2">Approval Workflow Dashboard</h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)]">Review and approve pending configurations</p>
              {user.role && (
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Logged in as: <span className="font-medium text-[var(--text-primary)]">{user.role === 'PayrollManager' ? 'Payroll Manager' : 'HR Manager'}</span>
                  {user.workEmail && ` (${user.workEmail})`}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-1 sm:gap-2 mb-0 border-b border-[var(--border-light)] overflow-x-auto" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  className={`px-3 sm:px-6 py-3 sm:py-4 font-semibold transition-all duration-200 whitespace-nowrap border-b-2 ${activeTab === tab.id
                    ? "text-[var(--primary-600)] border-[var(--primary-600)] bg-[var(--primary-50)]"
                    : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--gray-50)]"
                    } focus:outline-none rounded-t-lg`}
                >
                  <span className="mr-1 sm:mr-2 opacity-70">{tab.icon}</span>
                  <span className="text-xs sm:text-sm md:text-base">{getTabLabel(tab)}</span>
                </button>
              ))}
            </div>

            <div className="card !p-0 !rounded-t-none" role="tabpanel">
              <div className="p-3 sm:p-6">
                {error && (
                  <div className="alert alert-error flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-bold mb-1">Error loading data</p>
                      <p className="text-sm">{error}</p>
                    </div>
                    <button
                      onClick={() => fetchPendingItems(true)}
                      className="btn-danger !py-1 !px-3 text-sm"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div className="bg-[var(--bg-secondary)] rounded-xl p-4 sm:p-6 mb-6 border border-[var(--border-light)]">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                    <div className="flex-1 w-full sm:min-w-[200px]">
                      <label htmlFor="search" className="form-label mb-1">
                        Search
                      </label>
                      <input
                        id="search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or description..."
                        className="form-input"
                      />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <div className="flex-1 sm:flex-none">
                        <label htmlFor="dateFrom" className="form-label mb-1">
                          From
                        </label>
                        <input
                          id="dateFrom"
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="flex-1 sm:flex-none">
                        <label htmlFor="dateTo" className="form-label mb-1">
                          To
                        </label>
                        <input
                          id="dateTo"
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          min={dateFrom}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="w-full sm:min-w-[180px]">
                      <label htmlFor="creator" className="form-label mb-1">
                        Creator
                      </label>
                      <select
                        id="creator"
                        value={selectedCreator}
                        onChange={(e) => setSelectedCreator(e.target.value)}
                        className="form-input"
                      >
                        <option value="all">All Creators</option>
                        {uniqueCreators.map((creator) => (
                          <option key={creator} value={creator}>
                            {creator}
                          </option>
                        ))}
                      </select>
                    </div>

                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="btn-secondary !py-2"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-3 text-xs sm:text-sm text-gray-600">
                      Showing {itemCount} of {unfilteredCount} items
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <CRUDTable
                    data={currentItems}
                    columns={getColumns()}
                    isLoading={isLoading}
                    emptyMessage={hasActiveFilters ? "No items match your filters" : "No pending approvals"}
                    processingItemId={processingItemId}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                  />
                </div>
              </div>
            </div>

            <ApprovalModal
              isOpen={showApprovalModal}
              item={selectedItem ? normalizeItemForModal(selectedItem) : null}
              onConfirm={handleApproveConfirm}
              onCancel={handleApproveCancel}
              isLoading={isProcessing}
            />

            <RejectionModal
              isOpen={showRejectionModal}
              item={selectedItem ? normalizeItemForModal(selectedItem) : null}
              onConfirm={handleRejectConfirm}
              onCancel={handleRejectCancel}
              isLoading={isProcessing}
            />

            {viewItem && (
              <Modal
                isOpen={showViewModal}
                title="Configuration Details"
                onClose={() => {
                  setShowViewModal(false);
                  setViewItem(null);
                }}
                size="lg"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900">{viewItem.name || viewItem.grade || viewItem.policyName || "N/A"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <p className="text-gray-900">{viewItem.itemType || activeTab}</p>
                    </div>
                    {viewItem.amount && (
                      <div>
                        <span className="font-medium text-gray-600">Amount:</span>
                        <p className="text-gray-900">${viewItem.amount.toLocaleString()}</p>
                      </div>
                    )}
                    {viewItem.createdAt && (
                      <div>
                        <span className="font-medium text-gray-600">Created Date:</span>
                        <p className="text-gray-900">
                          {new Date(viewItem.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <p className="text-gray-900">
                        <StatusBadge status={viewItem.status as "draft" | "approved" | "rejected"} />
                      </p>
                    </div>
                  </div>
                </div>
              </Modal>
            )}

            {selectedIds.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 p-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-medium text-gray-700">
                      {selectedIds.length} item{selectedIds.length !== 1 ? "s" : ""} selected
                    </p>
                    {!canBulkAction && (
                      <p className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                        Select items of the same type for bulk actions
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowBulkApproveModal(true)}
                      disabled={!canBulkAction || isProcessing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Bulk Approve
                    </button>
                    <button
                      onClick={() => setShowBulkRejectModal(true)}
                      disabled={!canBulkAction || isProcessing}
                      className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Bulk Reject
                    </button>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {bulkProgress && (
              <Modal
                isOpen={true}
                title="Processing Bulk Action"
                onClose={() => { }}
                size="md"
              >
                <div className="space-y-4">
                  <p className="text-gray-700">{bulkProgress.message}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    {bulkProgress.current} of {bulkProgress.total} completed
                  </p>
                </div>
              </Modal>
            )}

            <Modal
              isOpen={showBulkApproveModal}
              title="Bulk Approve"
              onClose={() => setShowBulkApproveModal(false)}
              size="md"
            >
              <div className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to approve {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}?
                </p>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowBulkApproveModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleBulkApprove(user?.id || '')}
                    className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition"
                  >
                    Approve All
                  </button>
                </div>
              </div>
            </Modal>
          </>
        )}

        <RejectionModal
          isOpen={showBulkRejectModal}
          item={{
            _id: "bulk",
            name: `${selectedItems.length} items`,
            type: selectedItemsType || "configurations",
          }}
          onConfirm={(rejectedBy, reason) => handleBulkReject(rejectedBy, reason)}
          onCancel={() => setShowBulkRejectModal(false)}
          isLoading={!!bulkProgress}
        />
      </div>
    </div>
  );
}

export default function ApprovalWorkflow() {
  return (
    <UserProvider>
      <ToastProvider>
        <ApprovalWorkflowContent />
      </ToastProvider>
    </UserProvider>
  );
}

