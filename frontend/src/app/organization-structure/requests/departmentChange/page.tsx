"use client";

import React, { useEffect, useState } from "react";
type Employee = {
  _id: string;
  firstName: string;
  primaryPositionId: {
    _id: string;
    code: string;
  }
};

type Department = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  headPositionId?: string;
  isActive: boolean;
};

export default function CreateDepartmentChangeRequestPage() {
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [details, setDetails] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage("No authentication token found. Please log in again.");
          return;
        }

        const res = await fetch("http://localhost:5000/employee-profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Employee response status:", res.status, res.statusText);

        if (res.ok) {
          try {
            const data = await res.json();
            console.log("Employee data received:", data);

            // Handle different response formats
            let employeesArray: any[] = [];
            if (Array.isArray(data)) {
              employeesArray = data;
            } else if (data && Array.isArray(data.data)) {
              employeesArray = data.data;
            } else if (data && Array.isArray(data.employees)) {
              employeesArray = data.employees;
            }

            console.log("employees array length:", employeesArray.length);

            const normalizedEmployees = employeesArray.map((emp: any) => ({
              _id: emp._id || emp.id,
            }));

            setEmployees(employeesArray);
            console.log("Normalized employees set:", normalizedEmployees.length);
          } catch (parseError) {
            console.error("Error parsing employees JSON:", parseError);
            setMessage("Failed to parse employees data");
          }
        } else {
          try {
            const errorText = await res.text();
            console.error("Error fetching employees:", res.status, errorText);
            setMessage(`Failed to fetch employees (${res.status}): ${errorText}`);
          } catch (error) {
            console.error("Error reading error response:", error);
            setMessage(`Failed to fetch employees (${res.status})`);
          }
        }
      } catch (err) {
        console.error("Network error while fetching employees:", err);
        setMessage("Network error while fetching employees. Check console for details.");
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('token');
        console.log("TOKEN FROM STORAGE:", token);

        if (!token) {
          setMessage("Authentication required. Please log in.");
          return;
        }

        const [deptRes, posRes] = await Promise.all([
          fetch("http://localhost:5000/organization-structure/departments", {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/organization-structure/positions", {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
        ]);

        if (deptRes.ok) {
          try {
            const deptData = await deptRes.json();
            const normalizedDepartments = Array.isArray(deptData) ? deptData.map((dept: any) => ({
              ...dept,
              headPositionId: typeof dept.headPositionId === 'object' && dept.headPositionId?._id
                ? dept.headPositionId._id
                : dept.headPositionId,
            })) : [];
            setDepartments(normalizedDepartments);
          } catch (parseError) {
            console.error("Error parsing departments JSON:", parseError);
            setMessage("Failed to parse departments data");
          }
        } else {
          try {
            const errorText = await deptRes.text();
            setMessage(`Failed to load departments (${deptRes.status}): ${errorText}`);
          } catch (error) {
            setMessage(`Failed to load departments (${deptRes.status})`);
          }
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setMessage("Failed to load departments and positions");
      }
    }

    fetchData();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("No authentication token found. Please log in again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/organization-structure/change-request/department",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employeeId,
            newDept: newDepartmentId,
            details,
            reason,
          }),
        }
      );

      if (response.ok) {
        setMessage("Department change request submitted successfully.");
        setNewDepartmentId("");
        setEmployeeId("");
        setDetails("");
        setReason("");
      } else {
        const errorText = await response.text();
        setMessage(`Error: ${errorText}`);
      }
    } catch (error) {
      setMessage("Network error while submitting request.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid var(--border-medium)',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-primary)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--org-structure)', marginBottom: '0.5rem' }}>
          Create Department Change Request
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Request a change to an employee's department
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: '0.75rem',
        padding: '2rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Select Department*
            </label>
            <select
              value={newDepartmentId}
              onChange={(e) => setNewDepartmentId(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = 'var(--border-focus)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">-- Select a Department --</option>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {message && (message.includes('Error') || message.includes('Failed')) ? "Error loading positions - see message below" : "No positions available"}
                </option>
              )}
            </select>
            {departments.length > 0 && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {departments.length} department{departments.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Select Employee *
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = 'var(--border-focus)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">-- Select an Employee --</option>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} - {emp.primaryPositionId ? emp.primaryPositionId.code : 'No Position'}
                    {/* {pos.title} ({pos.code}) */}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {message && (message.includes('Error') || message.includes('Failed')) ? "Error loading employees - see message below" : "No employees available"}
                </option>
              )}
            </select>
            {employees.length > 0 && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {employees.length} position{employees.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Details *
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              rows={4}
              style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = 'var(--border-focus)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = 'var(--border-focus)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'var(--org-structure)',
              color: 'var(--text-inverse)',
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: message.includes('Error') ? 'var(--error-light)' : 'var(--success-light)',
            color: message.includes('Error') ? 'var(--error-dark)' : 'var(--success-dark)',
            borderLeft: `4px solid ${message.includes('Error') ? 'var(--error)' : 'var(--success)'}`,
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
