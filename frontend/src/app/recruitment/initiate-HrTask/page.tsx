'use client';

import { useEffect, useState } from 'react';
import { OnApiRecruitment } from '../ONservices';
import {NewHire} from '../ONtypes'

export default function NewHirePage() {
  const [hires, setHires] = useState<NewHire[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHires = async () => {
      try {
        const data = await OnApiRecruitment.getNewHire();
        setHires(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load new hires');
      } finally {
        setLoading(false);
      }
    };

    fetchHires();
  }, []);

  const handleCreateEmployee = async (hire: NewHire) => {
    try {
      setProcessingId(hire._id);
      setError(null);

      // 1️⃣ Create Employee Profile
      await OnApiRecruitment.createEP({
        employeeId: hire.employeeId,
        contractId: hire.contractId,
      });

      // 2️⃣ Initialize Signing Bonus (ONLY if exists)
      if (hire.signingBonus && hire.signingBonus > 0) {
        await OnApiRecruitment.initBouns({
          employeeId: hire.employeeId,
          signingBonus: hire.signingBonus,
        });
      }

      alert('Employee created successfully');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <p>Loading new hires...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>New Hires</h2>

      {hires.length === 0 && <p>No new hires found.</p>}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {hires.map((hire) => (
          <div
            key={hire._id}
            style={{
              padding: '1.5rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h4>{hire.firstName} {hire.lastName}</h4>
              <p>{hire.workEmail}</p>
              {hire.signingBonus && (
                <p>Signing Bonus: {hire.signingBonus}</p>
              )}
            </div>

            <button
              onClick={() => handleCreateEmployee(hire)}
              disabled={processingId === hire._id}
              style={{
                padding: '0.5rem 1rem',
                cursor: processingId === hire._id ? 'not-allowed' : 'pointer',
              }}
            >
              {processingId === hire._id ? 'Processing...' : 'Create Employee'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
