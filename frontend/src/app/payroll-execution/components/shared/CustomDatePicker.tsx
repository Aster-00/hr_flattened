"use client";
import { useState, useEffect } from "react";

interface CustomDatePickerProps {
    value: string; // YYYY-MM
    onChange: (value: string) => void;
    disabled?: boolean;
}

export default function CustomDatePicker({ value, onChange, disabled }: CustomDatePickerProps) {
    // Parse value (YYYY-MM) or default to now
    const initialDate = value ? new Date(value + "-01") : new Date();

    // We only need to track the viewing YEAR
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [isOpen, setIsOpen] = useState(false);

    // Sync view year if value changes externally
    useEffect(() => {
        if (value) {
            const d = new Date(value + "-01");
            setViewYear(d.getFullYear());
        }
    }, [value]);

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const handlePrevYear = () => setViewYear(prev => prev - 1);
    const handleNextYear = () => setViewYear(prev => prev + 1);

    const handleSelectMonth = (monthIndex: number) => {
        if (disabled) return;

        // Format YYYY-MM
        const m = monthIndex + 1;
        const mStr = m < 10 ? `0${m}` : `${m}`;
        const val = `${viewYear}-${mStr}`;
        onChange(val);
        setIsOpen(false);
    };

    // Helper to check if a month is currently selected
    const isMonthSelected = (mIndex: number) => {
        if (!value) return false;
        const [yStr, mStr] = value.split('-');
        return parseInt(yStr) === viewYear && parseInt(mStr) === (mIndex + 1);
    };

    // Helper to format display
    const formatDisplay = (val: string) => {
        if (!val) return "Select Payroll Period";
        const date = new Date(val + "-01");
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); // e.g. "December 2025"
    };

    return (
        <div style={{ position: "relative", width: "320px", fontFamily: "'Inter', sans-serif" }}>
            {/* Input Trigger */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{
                    padding: "0.75rem 1rem",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    backgroundColor: disabled ? "#F3F4F6" : "#fff",
                    cursor: disabled ? "not-allowed" : "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    userSelect: "none"
                }}
            >
                <span style={{ color: value ? "#1F2937" : "#9CA3AF" }}>
                    {formatDisplay(value)}
                </span>
                <span style={{ color: "#6B7280", fontSize: "0.875rem" }}>▼</span>
            </div>

            {/* Dropdown Calendar (Month Picker) */}
            {isOpen && (
                <div style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    zIndex: 50,
                    backgroundColor: "#fff",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    padding: "1.5rem",
                    width: "100%",
                    border: "1px solid #E5E7EB"
                }}>
                    {/* Header: Year Navigation */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1.5rem"
                    }}>
                        <button
                            className="btn-click-effect"
                            onClick={handlePrevYear}
                            disabled={disabled}
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                border: "none",
                                backgroundColor: "#EBF1FF",
                                color: "#4F46E5",
                                cursor: disabled ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: "bold"
                            }}
                        >
                            &lt;
                        </button>

                        <span style={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "#1F2937"
                        }}>
                            {viewYear}
                        </span>

                        <button
                            className="btn-click-effect"
                            onClick={handleNextYear}
                            disabled={disabled}
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                border: "none",
                                backgroundColor: "#EBF1FF",
                                color: "#4F46E5",
                                cursor: disabled ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: "bold"
                            }}
                        >
                            &gt;
                        </button>
                    </div>

                    {/* Months Grid */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "0.75rem",
                        textAlign: "center"
                    }}>
                        {monthNames.map((mName, idx) => {
                            const isSelected = isMonthSelected(idx);

                            return (
                                <button
                                    className="btn-click-effect"
                                    key={mName}
                                    onClick={() => handleSelectMonth(idx)}
                                    disabled={disabled}
                                    style={{
                                        padding: "0.5rem",
                                        borderRadius: "8px",
                                        border: "none",
                                        backgroundColor: isSelected ? "#4F46E5" : "transparent",
                                        color: isSelected ? "#fff" : "#374151",
                                        cursor: disabled ? "not-allowed" : "pointer",
                                        fontSize: "0.875rem",
                                        fontWeight: isSelected ? 600 : 400,
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected && !disabled) {
                                            e.currentTarget.style.backgroundColor = "#EBF1FF";
                                            e.currentTarget.style.color = "#4F46E5";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected && !disabled) {
                                            e.currentTarget.style.backgroundColor = "transparent";
                                            e.currentTarget.style.color = "#374151";
                                        }
                                    }}
                                >
                                    {mName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
