// src/app/leaves/api/calendars.api.ts

import { leavesApiClient } from './leaves.client';
import { LEAVE_CALENDARS_BASE } from './leaves.endpoints';
import type { Calendar } from '@/app/leaves/types';

// ==================== CALENDARS ====================

export async function getCalendars(): Promise<Calendar[]> {
  const { data } = await leavesApiClient.get<Calendar[]>(LEAVE_CALENDARS_BASE);
  return data;
}

export async function getCalendarById(id: string): Promise<Calendar> {
  const { data } = await leavesApiClient.get<Calendar>(`${LEAVE_CALENDARS_BASE}/${id}`);
  return data;
}

export async function createCalendar(calendarData: Partial<Calendar>): Promise<Calendar> {
  const { data } = await leavesApiClient.post<Calendar>(LEAVE_CALENDARS_BASE, calendarData);
  return data;
}

export async function updateCalendar(id: string, calendarData: Partial<Calendar>): Promise<Calendar> {
  const { data } = await leavesApiClient.put<Calendar>(`${LEAVE_CALENDARS_BASE}/${id}`, calendarData);
  return data;
}

export async function deleteCalendar(id: string): Promise<void> {
  await leavesApiClient.delete(`${LEAVE_CALENDARS_BASE}/${id}`);
}

// ==================== WORKING DAYS CALCULATION ====================

export async function calculateWorkingDays(
  from: string,
  to: string
): Promise<{
  workingDays: number;
  totalDays: number;
  excludedDates: Array<{
    date: string;
    reason: string;
  }>;
  from: string;
  to: string;
}> {
  const { data } = await leavesApiClient.get(`${LEAVE_CALENDARS_BASE}/working-days`, {
    params: { from, to },
  });
  return data;
}

export async function checkBlockedPeriods(
  from: string,
  to: string
): Promise<{
  hasBlockedPeriod: boolean;
  blockedPeriods: Array<{
    name: string;
    from: string;
    to: string;
    reason?: string;
  }>;
}> {
  const { data } = await leavesApiClient.get(`${LEAVE_CALENDARS_BASE}/check-blocked-periods`, {
    params: { from, to },
  });
  return data;
}

// ==================== BLOCKED PERIODS ====================

export interface BlockedPeriod {
  _id: string;
  name: string;
  from: string;
  to: string;
  reason?: string;
}

export async function getBlockedPeriods(): Promise<BlockedPeriod[]> {
  const { data } = await leavesApiClient.get(`${LEAVE_CALENDARS_BASE}/blocked-periods`);
  return data;
}

export async function createBlockedPeriod(periodData: {
  name: string;
  from: string;
  to: string;
  reason?: string;
}): Promise<BlockedPeriod> {
  const { data } = await leavesApiClient.post(`${LEAVE_CALENDARS_BASE}/blocked-periods`, periodData);
  return data;
}

export async function updateBlockedPeriod(
  id: string,
  periodData: Partial<BlockedPeriod>
): Promise<BlockedPeriod> {
  const { data } = await leavesApiClient.patch(`${LEAVE_CALENDARS_BASE}/blocked-periods/${id}`, periodData);
  return data;
}

export async function deleteBlockedPeriod(id: string): Promise<{ message: string }> {
  const { data } = await leavesApiClient.delete(`${LEAVE_CALENDARS_BASE}/blocked-periods/${id}`);
  return data;
}

// ==================== HOLIDAYS ====================

export interface Holiday {
  _id: string;
  name: string;
  date: string;
  calendarId?: string;
  isRecurring?: boolean;
  description?: string;
}

export async function getHolidays(): Promise<Holiday[]> {
  const { data } = await leavesApiClient.get('/leaves/holidays');
  return data;
}

export async function getHolidayById(id: string): Promise<Holiday> {
  const { data } = await leavesApiClient.get(`/leaves/holidays/${id}`);
  return data;
}

export async function createHoliday(holidayData: Omit<Holiday, '_id'>): Promise<Holiday> {
  const { data } = await leavesApiClient.post('/leaves/holidays', holidayData);
  return data;
}

export async function updateHoliday(id: string, holidayData: Partial<Holiday>): Promise<Holiday> {
  const { data } = await leavesApiClient.put(`/leaves/holidays/${id}`, holidayData);
  return data;
}

export async function deleteHoliday(id: string): Promise<void> {
  await leavesApiClient.delete(`/leaves/holidays/${id}`);
}
