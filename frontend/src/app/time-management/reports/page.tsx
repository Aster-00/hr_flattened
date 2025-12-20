"use client";

import { useEffect, useState } from "react";
import {
    getExceptionsSummary,
    getDashboardKpis,
    exportExceptionsCsv,
    exportOvertimeCsv,
} from "../api/reports.api";
import { apiClient } from "../api/axios";

export default function ReportsPage() {
    const [exceptions, setExceptions] = useState<any>(null);
    const [kpis, setKpis] = useState<any>(null);
    const [overtime, setOvertime] = useState<any[]>([]);
    const [lateness, setLateness] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [e, k, o, l] = await Promise.all([
                getExceptionsSummary(),
                getDashboardKpis(),
                apiClient.get("/time-management/reports/overtime-summary"),
                apiClient.get("/time-management/reports/lateness-summary"),
            ]);
            setExceptions(e);
            setKpis(k);
            setOvertime(o.data);
            setLateness(l.data);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <p>Loading reports...</p>;

    return (
        <div>
            <h1>Time Management Reports</h1>

            <section>
                <h2>Dashboard KPIs</h2>
                <p>Total Exceptions: {kpis.totalExceptions}</p>
                <p>Approved: {kpis.approved}</p>
                <p>Pending: {kpis.pending}</p>
                <p>Rejected: {kpis.rejected}</p>
                <p>Approval Rate: {kpis.approvalRate}%</p>
            </section>

            <section>
                <h2>Exceptions Summary</h2>
                <button onClick={exportExceptionsCsv}>Export CSV</button>
                {exceptions.breakdown.map((b: any) => (
                    <p key={b._id}>{b._id}: {b.count}</p>
                ))}
            </section>

            <section>
                <h2>Overtime Summary (Payroll)</h2>
                <button onClick={exportOvertimeCsv}>Export CSV</button>

                {overtime.length === 0 ? (
                    <p>No overtime records.</p>
                ) : (
                    <table border={1} cellPadding={6}>
                        <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Total Overtime (Minutes)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {overtime.map((r) => (
                            <tr key={r._id}>
                                <td>{r._id}</td>
                                <td>{r.totalOvertimeMinutes}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </section>

            <section>
                <h2>Lateness Summary</h2>
                {lateness.length === 0 ? (
                    <p>No lateness records.</p>
                ) : (
                    <table border={1} cellPadding={6}>
                        <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Late Count</th>
                        </tr>
                        </thead>
                        <tbody>
                        {lateness.map((r) => (
                            <tr key={r._id}>
                                <td>{r._id}</td>
                                <td>{r.lateCount}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}
