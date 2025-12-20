"use client";

import Link from "next/link";
import "./home.css";

export default function TimeManagementHome() {
    return (
        <div className="tm-home">
            <div className="tm-hero" />

            <h1 className="tm-title">Time Management</h1>

            <div className="tm-cards">
                <Link href="/time-management/holidays" className="tm-card">
                    <span className="tm-icon">📅</span>
                    <h3>Holidays</h3>
                    <p>Manage official and custom holidays</p>
                </Link>

                <Link href="/time-management/exceptions" className="tm-card">
                    <span className="tm-icon">⏱️</span>
                    <h3>Exceptions</h3>
                    <p>Review attendance exceptions</p>
                </Link>

                <Link href="/time-management/corrections" className="tm-card">
                    <span className="tm-icon">✏️</span>
                    <h3>Corrections</h3>
                    <p>Approve or reject correction requests</p>
                </Link>

                <Link href="/time-management/notifications" className="tm-card">
                    <span className="tm-icon">🔔</span>
                    <h3>Notifications</h3>
                    <p>System activity and audit logs</p>
                </Link>

                <Link href="/time-management/reports" className="tm-card">
                    <span className="tm-icon">📊</span>
                    <h3>Reports</h3>
                    <p>Time management analytics</p>
                </Link>

                <Link href="/time-management/shifts" className="tm-card">
                    <span className="tm-icon">🕒</span>
                    <h3>Shifts</h3>
                    <p>Create and manage work shifts</p>
                </Link>

                <Link href="/time-management/shift-types" className="tm-card">
                    <span className="tm-icon">🧩</span>
                    <h3>Shift Types</h3>
                    <p>Define shift categories</p>
                </Link>

                <Link href="/time-management/schedule-rules" className="tm-card">
                    <span className="tm-icon">📆</span>
                    <h3>Schedule Rules</h3>
                    <p>Recurring schedules and rules</p>
                </Link>

                <Link href="/time-management/assignments" className="tm-card">
                    <span className="tm-icon">👥</span>
                    <h3>Assignments</h3>
                    <p>Assign shifts to employees</p>
                </Link>

                <Link href="/time-management/expiry-monitor" className="tm-card">
                    <span className="tm-icon">⏰</span>
                    <h3>Expiry Monitor</h3>
                    <p>Track expiring assignments</p>
                </Link>

            </div>
        </div>
    );
}
