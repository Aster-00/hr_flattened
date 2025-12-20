import { apiClient } from './axios';
import { Holiday } from '../types/Holiday';

const BASE = '/time-management/holidays';

export async function getHolidays(): Promise<Holiday[]> {
    const res = await apiClient.get<Holiday[]>(BASE);
    return res.data;
}

export async function getHolidayById(id: string): Promise<Holiday> {
    const res = await apiClient.get<Holiday>(`${BASE}/${id}`);
    return res.data;
}

export async function createHoliday(
    data: Omit<Holiday, '_id'>
): Promise<Holiday> {
    const res = await apiClient.post(BASE, data);
    return res.data;
}

export async function updateHoliday(
    id: string,
    data: Partial<Holiday>
): Promise<Holiday> {
    const res = await apiClient.put(`${BASE}/${id}`, data);
    return res.data;
}

export async function deleteHoliday(id: string) {
    return apiClient.delete(`${BASE}/${id}`);
}
