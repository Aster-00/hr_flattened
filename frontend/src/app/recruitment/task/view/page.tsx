'use client';
import { useState, useEffect } from 'react';
import { OnApiRecruitment } from '../../ONservices';
import { OnboardingTask } from '../../ONtypes';

export default function ViewTask() {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: OnboardingTask[] = await OnApiRecruitment.getTasks();
      // Parse dates
      const normalized = data.map((task) => ({
        ...task,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
      }));
      setTasks(normalized);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Mark a task as completed
  const handleCompleteTask = async (taskId: string | undefined) => {
    if (!taskId) return;

    try {
      setLoading(true);
      setError(null);

      await OnApiRecruitment.updateTask(taskId);

      // Update local state
      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId
            ? {
                ...task,
                status: 'COMPLETED',
                completedAt: new Date(),
              }
            : task
        )
      );
    } catch (err) {
      setError('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  // Group tasks by onboardingId for display
  const groupedTasks = tasks.reduce((acc, task) => {
    const key = task.onboardingId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(task);
    return acc;
  }, {} as Record<string, OnboardingTask[]>);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)', marginBottom: '2rem' }}>
        Onboarding Tasks
      </h1>

      {error && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '0.5rem', color: '#c00' }}>{error}</div>}
      {loading && <p>Loading tasks...</p>}
      {!loading && tasks.length === 0 && <p>No onboarding tasks found.</p>}

      {Object.entries(groupedTasks).map(([onboardingId, taskList]) => {
        const allCompleted = taskList.every(t => t.status === 'COMPLETED');

        return (
          <div key={onboardingId} style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', backgroundColor: 'var(--bg-primary)' }}>
            <h2 style={{ marginBottom: '1rem' }}>Onboarding ID: {onboardingId}</h2>

            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {taskList.map((task, idx) => (
                <div key={task._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f9f9f9', borderRadius: '0.375rem' }}>
                  <div>
                    <strong>{task.name}</strong> - {task.department || 'N/A'} | {task.status} | Deadline: {task.deadline?.toLocaleDateString() || 'N/A'}
                    {task.completedAt && ` (Completed: ${task.completedAt.toLocaleDateString()})`}
                    {task.notes && <div>Notes: {task.notes}</div>}
                  </div>
                  {task.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleCompleteTask(task._id)}
                      disabled={loading}
                      style={{ padding: '0.25rem 0.75rem', backgroundColor: 'var(--recruitment)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
                    >
                      Complete
                    </button>
                  )}
                </div>
              ))}
            </div>

            {allCompleted && (
              <div style={{ color: 'green', fontWeight: '600', marginTop: '0.5rem' }}>
                ✅ All tasks completed
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
