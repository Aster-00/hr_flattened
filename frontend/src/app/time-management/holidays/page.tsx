"use client";

import { useEffect, useState } from "react";
import { getHolidays } from "../api/holidays.api";
import { Holiday } from "../types/Holiday";
import Link from "next/link";

export default function HolidaysPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHolidays()
            .then((data) => setHolidays(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1>Holidays</h1>

            <Link href="/time-management/holidays/create">
                Create Holiday
            </Link>

            <ul style={{ marginTop: "1rem" }}>
                {holidays.map((h) => (
                    <li key={h._id} style={{ marginBottom: "0.5rem" }}>
                        <strong>{h.name}</strong>{" "}
                        — {new Date(h.startDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}

                        {/* Status badge */}
                        <span
                            style={{
                                marginLeft: "10px",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                color: h.active ? "#155724" : "#721c24",
                                backgroundColor: h.active ? "#d4edda" : "#f8d7da",
                            }}
                        >
                            {h.active ? "Active" : "Inactive"}
                        </span>

                        {" — "}
                        <Link href={`/time-management/holidays/edit/${h._id}`}>
                            Edit
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
