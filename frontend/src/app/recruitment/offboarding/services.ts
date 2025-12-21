const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Offboarding Request Services
export async function createOffboardingRequest(data: any, token: string) {
    console.log('🔗 Calling PROXY API at: /api/offboarding/create');
    // Use Next.js API Proxy to avoid CORS
    const response = await fetch('/api/offboarding/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Error ${response.status}: Failed to create offboarding request`);
    }

    return response.json();
}

// Employee Services
export async function getAllEmployees(token: string) {
    const response = await fetch(`${BACKEND_URL}/employee-profile`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
}

export async function getAllOffboardingRequests(filters: any = {}, token: string) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${BACKEND_URL}/offboarding/request?${queryParams}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch offboarding requests');
    return response.json();
}

export async function getOffboardingRequest(id: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/request/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch offboarding request');
    return response.json();
}

export async function updateOffboardingRequest(id: string, data: any, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/request/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update offboarding request');
    return response.json();
}

export async function deleteOffboardingRequest(id: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/request/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to delete offboarding request');
    return response.json();
}

// Offboarding Status Services
export async function createOffboardingStatus(offboardingRequestId: string, employeeId: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/status/${offboardingRequestId}/${employeeId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to create offboarding status');
    return response.json();
}

export async function updateOffboardingStage(offboardingRequestId: string, stage: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/status/${offboardingRequestId}/stage/${stage}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to update offboarding stage');
    return response.json();
}

export async function completeOffboardingStage(offboardingRequestId: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/status/${offboardingRequestId}/complete-stage`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to complete offboarding stage');
    return response.json();
}

// Exit Interview Services
export async function createExitInterview(offboardingRequestId: string, employeeId: string, data: any, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/exit-interview/${offboardingRequestId}/${employeeId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create exit interview');
    return response.json();
}

export async function getExitInterview(id: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/exit-interview/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch exit interview');
    return response.json();
}

export async function getExitInterviewByOffboarding(offboardingRequestId: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/exit-interview/offboarding/${offboardingRequestId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch exit interview');
    return response.json();
}

export async function updateExitInterview(id: string, data: any, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/exit-interview/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update exit interview');
    return response.json();
}

export async function completeExitInterview(id: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/exit-interview/${id}/complete`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to complete exit interview');
    return response.json();
}

// Asset Return Services
export async function createAssetReturn(offboardingRequestId: string, employeeId: string, assetData: any, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/asset/${offboardingRequestId}/${employeeId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(assetData),
    });
    if (!response.ok) throw new Error('Failed to create asset return');
    return response.json();
}

export async function getAssetsByOffboarding(offboardingRequestId: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/asset/offboarding/${offboardingRequestId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
}

export async function updateAssetReturn(id: string, data: any, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/asset/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update asset return');
    return response.json();
}

export async function markAssetAsReturned(id: string, receivedByPersonId: string, condition: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/asset/${id}/mark-returned/${receivedByPersonId}/${condition}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to mark asset as returned');
    return response.json();
}

export async function deleteAssetReturn(id: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/asset/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to delete asset return');
    return response.json();
}

// Final Settlement Services
export async function createFinalSettlement(offboardingRequestId: string, employeeId: string, data: any, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/settlement/${offboardingRequestId}/${employeeId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create final settlement');
    return response.json();
}

export async function getFinalSettlementByOffboarding(offboardingRequestId: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/settlement/offboarding/${offboardingRequestId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch final settlement');
    return response.json();
}

export async function updateFinalSettlement(id: string, data: any, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/settlement/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update final settlement');
    return response.json();
}

export async function processFinalSettlement(id: string, processedByPersonId: string, paymentData: any, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/settlement/${id}/process/${processedByPersonId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
    });
    if (!response.ok) throw new Error('Failed to process final settlement');
    return response.json();
}

export async function acknowledgeSettlement(id: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/settlement/${id}/acknowledge`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to acknowledge settlement');
    return response.json();
}

// Clearance Checklist Services
export async function getClearanceChecklistByOffboarding(offboardingRequestId: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/clearance/offboarding/${offboardingRequestId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    const text = await response.text();
    if (!response.ok) {
        let message = 'Failed to fetch clearance checklist';
        try {
            const parsed = text ? JSON.parse(text) : null;
            message = parsed?.message || parsed?.error || message;
        } catch {
            // ignore
        }
        throw new Error(message);
    }

    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

export async function updateClearanceChecklistByOffboarding(offboardingRequestId: string, data: any, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/clearance/offboarding/${offboardingRequestId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    const text = await response.text();
    if (!response.ok) {
        let message = 'Failed to update clearance checklist';
        try {
            const parsed = text ? JSON.parse(text) : null;
            message = parsed?.message || parsed?.error || message;
        } catch {
            // ignore
        }
        throw new Error(message);
    }
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

// Dashboard & Metrics Services
export async function getOffboardingPipeline(employeeId: string | null, token: string) {
    const query = employeeId ? `?employeeId=${employeeId}` : '';
    const response = await fetch(`${BACKEND_URL}/offboarding/pipeline${query}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch offboarding pipeline');
    return response.json();
}

export async function getOffboardingMetrics(token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/metrics`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch offboarding metrics');
    return response.json();
}

export async function getOffboardingProgress(offboardingRequestId: string, token: string) {
    const response = await fetch(`${BACKEND_URL}/offboarding/progress/${offboardingRequestId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch offboarding progress');
    return response.json();
}
