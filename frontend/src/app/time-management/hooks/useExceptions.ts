// src/app/time-management/hooks/useExceptions.ts
import { useEffect, useState } from "react";
import {
    getExceptions,
    markPending,
    approveException,
    rejectException,
} from "../api/exceptions.api";
import { TimeException } from "../types/TimeException";

export function useExceptions() {
    const [exceptions, setExceptions] = useState<TimeException[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getExceptions().then((data) => {
            setExceptions(data);
            setLoading(false);
        });
    }, []);

    async function setPending(id: string) {
        const updated = await markPending(id);
        setExceptions((prev) =>
            prev.map((e) => (e._id === id ? updated : e))
        );
    }

    async function approve(id: string) {
        const updated = await approveException(id);
        setExceptions((prev) =>
            prev.map((e) => (e._id === id ? updated : e))
        );
    }

    async function reject(id: string) {
        const updated = await rejectException(id);
        setExceptions((prev) =>
            prev.map((e) => (e._id === id ? updated : e))
        );
    }

    return { exceptions, loading, setPending, approve, reject };
}
