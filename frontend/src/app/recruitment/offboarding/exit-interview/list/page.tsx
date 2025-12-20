"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExitInterviewListPage() {
    const router = useRouter();

    useEffect(() => {
        // Since we don't have a standalone API for all interviews yet,
        // we redirect to the main requests list where you can access interviews per request.
        router.replace('/recruitment/offboarding/requests/list');
    }, [router]);

    return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Redirecting to Offboarding Requests...</p>
        </div>
    );
}
