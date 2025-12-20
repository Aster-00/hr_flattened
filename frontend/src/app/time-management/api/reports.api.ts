import { apiClient } from "./axios";

const BASE_URL = apiClient.defaults.baseURL; // ✅ reuse backend URL

export const getExceptionsSummary = () =>
    apiClient.get("/time-management/reports/exceptions-summary")
        .then(res => res.data);

export const getDashboardKpis = () =>
    apiClient.get("/time-management/reports/dashboard-kpis")
        .then(res => res.data);

export const exportExceptionsCsv = () => {
    window.open(
        `${BASE_URL}/time-management/reports/exceptions-summary/export`,
        "_blank"
    );
};

export const exportOvertimeCsv = () => {
    window.open(
        `${BASE_URL}/time-management/reports/overtime-summary/export`,
        "_blank"
    );
};