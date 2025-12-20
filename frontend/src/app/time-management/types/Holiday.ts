export type HolidayType =
    | 'NATIONAL'
    | 'ORGANIZATIONAL'
    | 'WEEKLY_REST';

export interface Holiday {
    _id: string;
    name: string;
    type: HolidayType;
    startDate: string;
    endDate?: string;
    active: boolean;
}
