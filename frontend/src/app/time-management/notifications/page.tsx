"use client";

import React, { useEffect, useState } from "react";
import {
    getNotifications,
    markNotificationAsRead,
} from "../api/notifications.api";
import { NotificationLog } from "../types/NotificationLog";
import DataTable from "../components/DataTable";

type NotificationRow = NotificationLog & {
    messageCell: React.ReactNode;
    status: "Read" | "Unread";
    action: React.ReactNode;
};

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function NotificationsPage() {
    const [rows, setRows] = useState<NotificationRow[]>([]);

    const load = async () => {
        const data = await getNotifications();

        const mapped: NotificationRow[] = data.map((n) => {
            const isRead = Boolean((n as any).read);

            return {
                ...n,
                createdAt: formatDate(n.createdAt),

                // 🟦 Message cell (bold + NEW badge for unread)
                messageCell: (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "1.05rem",
                                lineHeight: "1.6",
                                fontWeight: isRead ? 500 : 700,
                                color: isRead ? "#444" : "#000",
                            }}
                        >
                            {n.message}
                        </span>

                        {!isRead && (
                            <span
                                style={{
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    color: "#0d6efd",
                                    backgroundColor: "#e7f1ff",
                                    padding: "2px 6px",
                                    borderRadius: "6px",
                                }}
                            >
                                NEW
                            </span>
                        )}
                    </div>
                ),

                status: isRead ? "Read" : "Unread",

                // 🔵 Action button
                action: isRead ? null : (
                    <button
                        style={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "#0d6efd",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                        }}
                        onClick={async (e) => {
                            e.stopPropagation();
                            await markNotificationAsRead(n._id);

                            setRows((prev) =>
                                prev.map((row) =>
                                    row._id === n._id
                                        ? {
                                            ...row,
                                            status: "Read",
                                            action: null,
                                            messageCell: (
                                                <span
                                                    style={{
                                                        fontSize: "1.05rem",
                                                        lineHeight: "1.6",
                                                        fontWeight: 500,
                                                        color: "#444",
                                                    }}
                                                >
                                                      {n.message}
                                                  </span>
                                            ),
                                        }
                                        : row
                                )
                            );
                        }}
                    >
                        Mark as read
                    </button>
                ),
            };
        });

        setRows(
            mapped.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            )
        );
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div>
            <h1>Notifications</h1>

            <DataTable
                data={rows}
                columns={[
                    { key: "messageCell", label: "Message" },
                    { key: "createdAt", label: "Date" },
                    { key: "status", label: "Status" },
                    { key: "action", label: "Action" },
                ]}
            />
        </div>
    );
}
