// src/app/time-management/api/exceptions.api.ts
import { apiClient } from "./axios";
import { TimeException } from "../types/TimeException";

export async function getExceptions(): Promise<TimeException[]> {
    const { data } = await apiClient.get("/time-management/exceptions");
    return data;
}

export async function getExceptionById(id: string): Promise<TimeException> {
    const { data } = await apiClient.get(
        `/time-management/exceptions/${id}`
    );
    return data;
}

export async function markPending(id: string): Promise<TimeException> {
    const { data } = await apiClient.put(
        `/time-management/exceptions/${id}/status`,
        { status: "PENDING" }
    );
    return data;
}

export async function approveException(id: string): Promise<TimeException> {
    const { data } = await apiClient.put(
        `/time-management/exceptions/${id}/status`,
        { status: "APPROVED" }
    );
    return data;
}

export async function rejectException(id: string): Promise<TimeException> {
    const { data } = await apiClient.put(
        `/time-management/exceptions/${id}/status`,
        {
            status: "REJECTED",
            comment: "Rejected by reviewer",
        }
    );
    return data;
}
