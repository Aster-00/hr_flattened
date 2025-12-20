'use client';
import { useState, useEffect } from 'react';
import { OnApiRecruitment } from '../../ONservices';
import { Onboarding } from '../../ONtypes';

export default function ViewTask() {
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: Onboarding[] = await OnApiRecruitment.getTasks();
      // Parse dates
      const normalized = data.map((ob) => ({
        ...ob,
        completedAt: ob.completedAt ? new Date(ob.completedAt) : undefined,
        tasks: ob.tasks.map((t) => ({
          ...t,
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
          deadline: t.deadline ? new Date(t.deadline) : undefined,
        })),
      }));
      setOnboardings(normalized);
    } catch (err) {
      setError('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Mark all tasks in an onboarding as completed
  const handleCompleteOnboarding = async (onboardingId: string) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Pass parent onboarding _id to backend
      await OnApiRecruitment.updateTask(onboardingId);

      // ✅ Immediately update local state
      setOnboardings((prev) =>
        prev.map((ob) =>
          ob._id === onboardingId
            ? {
                ...ob,
                completed: true,
                completedAt: new Date(),
                tasks: ob.tasks.map((t) => ({
                  ...t,
                  status: 'COMPLETED',
                  completedAt: new Date(),
                })),
              }
            : ob
        )
      );
    } catch (err) {
      setError('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)', marginBottom: '2rem' }}>
        Onboarding Tasks
      </h1>

      {error && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '0.5rem', color: '#c00' }}>{error}</div>}
      {loading && <p>Loading tasks...</p>}
      {!loading && onboardings.length === 0 && <p>No onboarding tasks found.</p>}

      {onboardings.map((ob) => (
        <div key={ob._id} style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', backgroundColor: 'var(--bg-primary)' }}>
          <h2 style={{ marginBottom: '1rem' }}>Employee ID: {ob.employeeId}</h2>

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {ob.tasks.map((task, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f9f9f9', borderRadius: '0.375rem' }}>
                <div>
                  <strong>{task.name}</strong> - {task.department || 'N/A'} | {task.status} | Deadline: {task.deadline?.toLocaleDateString() || 'N/A'}
                  {task.completedAt && ` (Completed: ${task.completedAt.toLocaleDateString()})`}
                  {task.notes && <div>Notes: {task.notes}</div>}
                </div>
              </div>
            ))}
          </div>

          {!ob.completed && (
            <button
              onClick={() => handleCompleteOnboarding(ob._id)}
              disabled={loading}
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: 'var(--recruitment)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Mark All Tasks as Complete
            </button>
          )}

          {ob.completed && (
            <div style={{ color: 'green', fontWeight: '600', marginTop: '0.5rem' }}>
              ✅ All tasks completed
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
