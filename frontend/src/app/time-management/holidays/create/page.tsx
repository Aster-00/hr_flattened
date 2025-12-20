'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHoliday } from '../../api/holidays.api';
import type { HolidayType } from '../../types/Holiday';

export default function CreateHolidayPage() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [type, setType] = useState<HolidayType>('NATIONAL');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await createHoliday({
                name,
                type,
                startDate,
                active: true,
            });

            router.push('/time-management/holidays');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to create holiday');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Create Holiday</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Holiday name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as HolidayType)}
                >
                    <option value="NATIONAL">National Holiday</option>
                    <option value="ORGANIZATIONAL">Organizational Holiday</option>
                    <option value="WEEKLY_REST">Weekly Rest</option>
                </select>

                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create'}
                </button>
            </form>
        </div>
    );
}
