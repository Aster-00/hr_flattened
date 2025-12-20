"use client";

import { useEffect, useState } from "react";
import { Holiday, HolidayType } from "../types/Holiday";
import {
    getHolidays,
    createHoliday,
    updateHoliday,
} from "../api/holidays.api";

export function useHolidays() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHolidays().then(data => {
            setHolidays(data);
            setLoading(false);
        });
    }, []);

    async function create(payload: Omit<Holiday, '_id'>) {
        const newHoliday = await createHoliday(payload);
        setHolidays(prev => [...prev, newHoliday]);
    }

    async function update(id: string, payload: Partial<Holiday>) {
        const updated = await updateHoliday(id, payload);
        setHolidays(prev =>
            prev.map(h => (h._id === id ? updated : h))
        );
    }

    return { holidays, loading, create, update };
}
