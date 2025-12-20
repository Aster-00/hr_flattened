"use client";

import { useEffect, useState } from "react";
import { OnApiRecruitment } from "../../ONservices";
import { task } from "../../ONtypes";

const initialTaskForm: task = {
  employeeId: "",
  tasks: [],
  completed: false,
  completedAt: new Date(),
};

export default function TaskCreationPage() {
  const [taskForm, setTaskForm] = useState<task>(initialTaskForm);
  const [taskInput, setTaskInput] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const departmentOptions = ["Admin", "IT", "Any"];

  // 🔹 Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await OnApiRecruitment.getNewHire();
        setEmployees(data);
      } catch (err) {
        setError("Failed to load employees");
      }
    };
    fetchEmployees();
  }, []);

  // 🔹 Create task
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await OnApiRecruitment.createTask(taskForm);

      // Reset form after success
      setTaskForm(initialTaskForm);
      setTaskInput("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create onboarding task"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "1rem" }}>
      <h3 style={{ fontSize: "2rem", fontWeight: "600", color: "var(--recruitment)" }}>
        Create Onboarding Tasks
      </h3>

      <form onSubmit={createTask} style={{ marginTop: "1.5rem" }}>
        {/* Error */}
        {error && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1.5rem",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "0.5rem",
              color: "#c00",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "grid", gap: "1.5rem" }}>
          {/* Employee Select */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Employee
            </label>
            <select
              required
              value={taskForm.employeeId}
              onChange={(e) =>
                setTaskForm({ ...taskForm, employeeId: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-secondary)",
              }}
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.workEmail || emp.personalEmail}
                </option>
              ))}
            </select>
          </div>

          {/* Task Input */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Tasks
            </label>
            <input
              type="text"
              value={taskInput}
              placeholder="Add a task and press Enter"
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const value = taskInput.trim();
                  if (!value) return;

                  setTaskForm({
                    ...taskForm,
                    tasks: [
                      ...taskForm.tasks,
                      { name: value, status: "pending", department: "Any" },
                    ],
                  });
                  setTaskInput("");
                }
              }}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-secondary)",
              }}
            />

            {/* Task Chips with department dropdown */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginTop: "0.5rem",
              }}
            >
              {taskForm.tasks.map((t, index) => (
                <div
                  key={index}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "var(--bg-primary)",
                    borderRadius: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <span>{t.name}</span>

                  <select
                    value={t.department}
                    onChange={(e) => {
                      const updatedTasks = [...taskForm.tasks];
                      updatedTasks[index].department = e.target.value;
                      setTaskForm({ ...taskForm, tasks: updatedTasks });
                    }}
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-secondary)",
                      marginRight: "0.5rem",
                    }}
                  >
                    {departmentOptions.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      setTaskForm({
                        ...taskForm,
                        tasks: taskForm.tasks.filter((_, i) => i !== index),
                      })
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Completed */}
          <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={taskForm.completed}
              onChange={(e) =>
                setTaskForm({ ...taskForm, completed: e.target.checked })
              }
            />
            Completed
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "var(--recruitment)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
