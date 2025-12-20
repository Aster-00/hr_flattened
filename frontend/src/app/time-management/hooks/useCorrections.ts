"use client";

import { useEffect, useState } from "react";
import { CorrectionRequest } from "../types/CorrectionRequest";
import { apiClient } from "../api/axios";

export function useCorrections() {
    const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCorrections() {
            try {
                const { data } = await apiClient.get(
                    "/attendance/corrections"
                );
                setCorrections(data);
            } catch (err) {
                console.error("Failed to load corrections", err);
            } finally {
                setLoading(false);
            }
        }

        fetchCorrections();
    }, []);

    async function approve(id: string) {
        const { data } = await apiClient.patch(
            `/attendance/corrections/${id}`,
            { status: "APPROVED" }
        );

        setCorrections((prev) =>
            prev.map((c) => (c._id === id ? data : c))
        );
    }

    async function reject(id: string) {
        const { data } = await apiClient.patch(
            `/attendance/corrections/${id}`,
            {
                status: "REJECTED",
                comment: "Rejected by reviewer",
            }
        );

        setCorrections((prev) =>
            prev.map((c) => (c._id === id ? data : c))
        );
    }

    return { corrections, loading, approve, reject };
}
