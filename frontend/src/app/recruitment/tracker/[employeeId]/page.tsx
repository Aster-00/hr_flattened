'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { OnApiRecruitment } from '../../ONservices';
import { OnboardingTask } from '../../ONtypes';

const TrackerPage = () => {
  const params = useParams();
  const employeeId = Array.isArray(params.employeeId) ? params.employeeId[0] : params.employeeId;

  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) {
      setError('Employee ID not found');
      return;
    }

    const fetchTracker = async () => {
      setLoading(true);
      try {
        const data = await OnApiRecruitment.getTracker(employeeId);
        setTasks(data.tasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tracker');
      } finally {
        setLoading(false);
      }
    };

    fetchTracker();
  }, [employeeId]);

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--recruitment)', marginBottom: '1.5rem' }}>
        Onboarding Tasks Tracker
      </h2>

      {loading && <p>Loading tasks...</p>}
      {error && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '0.5rem',
            color: '#c00',
          }}
        >
          {error}
        </div>
      )}

      {tasks.length === 0 && !loading && !error && <p>No tasks assigned.</p>}

      {tasks.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid var(--border-color)',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>Name</th>
                <th style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>Department</th>
                <th style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>Status</th>
                <th style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>Deadline</th>
                <th style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>Completed At</th>
                <th style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                  }}
                >
                  <td style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>{task.name}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>{task.department || '-'}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>{task.status}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                    {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>{task.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrackerPage;
