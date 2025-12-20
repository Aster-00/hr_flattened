"use client";

import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";

type Position = {
  _id: string;
  code: string;
  title: string;
};

type Employee = {
  _id: string;
  firstName: string;
  primaryPositionId: {
    _id: string;
    code: string;
  }
};
export default function MakeChangeRequestPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newPositionId, setNewPositionId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [details, setDetails] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("No authentication token found. Please log in again.");
      return;
    }

    const fetchPositions = async () => {
      try {
        const res = await fetch("http://localhost:5000/organization-structure/positions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Positions response status:", res.status, res.statusText);

        if (res.ok) {
          try {
            const data = await res.json();
            console.log("Positions data received:", data);

            // Handle different response formats
            let positionsArray: any[] = [];
            if (Array.isArray(data)) {
              positionsArray = data;
            } else if (data && Array.isArray(data.data)) {
              positionsArray = data.data;
            } else if (data && Array.isArray(data.positions)) {
              positionsArray = data.positions;
            }

            console.log("Positions array length:", positionsArray.length);

            const normalizedPositions = positionsArray.map((pos: any) => ({
              _id: pos._id || pos.id,
              code: pos.code || '',
              title: pos.title || '',
            }));

            setPositions(normalizedPositions);
            console.log("Normalized positions set:", normalizedPositions.length);
          } catch (parseError) {
            console.error("Error parsing positions JSON:", parseError);
            setMessage("Failed to parse positions data");
          }
        } else {
          try {
            const errorText = await res.text();
            console.error("Error fetching positions:", res.status, errorText);
            setMessage(`Failed to fetch positions (${res.status}): ${errorText}`);
          } catch (error) {
            console.error("Error reading error response:", error);
            setMessage(`Failed to fetch positions (${res.status})`);
          }
        }
      } catch (err) {
        console.error("Network error while fetching positions:", err);
        setMessage("Network error while fetching positions. Check console for details.");
      }
    };

    fetchPositions();
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
        "http://localhost:5000/organization-structure/change-request/position",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employeeId,
            newPos: newPositionId,
            details,
            reason,
          }),
        }
      );

      if (response.ok) {
        setMessage("Position change request submitted successfully.");
        setNewPositionId("");
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
          Position Change Request
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Request a change to an employee's position
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
              Select Position *
            </label>
            <select
              value={newPositionId}
              onChange={(e) => setNewPositionId(e.target.value)}
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
              <option value="">-- Select a Position --</option>
              {positions.length > 0 ? (
                positions.map((pos) => (
                  <option key={pos._id} value={pos._id}>
                    {pos.title} ({pos.code})
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {message && (message.includes('Error') || message.includes('Failed')) ? "Error loading positions - see message below" : "No positions available"}
                </option>
              )}
            </select>
            {positions.length > 0 && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {positions.length} position{positions.length !== 1 ? 's' : ''} found
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
