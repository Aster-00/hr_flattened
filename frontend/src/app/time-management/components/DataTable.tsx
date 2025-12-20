"use client";

import React from "react";

export type Column<T> = {
    key: keyof T;
    label: string;
    render?: (row: T) => React.ReactNode;
};

type Props<T extends { _id: string }> = {
    data: T[];
    columns: Column<T>[];
};

export default function DataTable<T extends { _id: string }>({
                                                                 data,
                                                                 columns,
                                                             }: Props<T>) {
    if (!Array.isArray(data)) return null;

    return (
        <table>
            <thead>
            <tr>
                {columns.map((c) => (
                    <th key={String(c.key)}>{c.label}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((row) => (
                <tr key={row._id}>
                    {columns.map((c) => (
                        <td key={String(c.key)}>
                            {c.render
                                ? c.render(row)
                                : String(row[c.key] ?? "")}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
}
