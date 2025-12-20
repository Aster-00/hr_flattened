"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getHolidayById, updateHoliday } from "../../../api/holidays.api";
import { Holiday, HolidayType } from "../../../types/Holiday";

export default function EditHolidayPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [type, setType] = useState<HolidayType>("NATIONAL");
    const [active, setActive] = useState(true);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadHoliday() {
            try {
                const h = await getHolidayById(id);

                setName(h.name ?? "");
                setType(h.type);
                setActive(h.active);
                setStartDate(h.startDate.slice(0, 10)); // yyyy-mm-dd
            } catch {
                setError("Failed to load holiday");
            } finally {
                setLoading(false);
            }
        }

        loadHoliday();
    }, [id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        try {
            await updateHoliday(id, {
                name,
                type,
                startDate,
                active,
            });

            router.push("/time-management/holidays");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to update holiday");
        }
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <h1>Edit Holiday</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label><br />
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Type</label><br />
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as HolidayType)}
                    >
                        <option value="NATIONAL">National</option>
                        <option value="ORGANIZATIONAL">Organizational</option>
                        <option value="WEEKLY_REST">Weekly Rest</option>
                    </select>
                </div>

                <div>
                    <label>Date</label><br />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                        />
                        Active
                    </label>
                </div>

                <button type="submit">Save</button>
            </form>
        </div>
    );
}
