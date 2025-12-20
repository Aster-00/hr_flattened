"use client"; // if using Next.js 13+ app directory

import { useEffect, useState } from "react";

type Department = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  headPositionId?: string;
  isActive: boolean;
};

type Position = {
  _id: string;
  title: string;
  code: string;
};

export default function UpdateDepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [formData, setFormData] = useState<Partial<Department>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch departments and positions from backend
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('token');
        console.log("TOKEN FROM STORAGE:", token);

        if (!token) {
          setMessage({ type: "error", text: "Authentication required. Please log in." });
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
            setMessage({ type: "error", text: "Failed to parse departments data" });
          }
        } else {
          try {
            const errorText = await deptRes.text();
            setMessage({ type: "error", text: `Failed to load departments (${deptRes.status}): ${errorText}` });
          } catch (error) {
            setMessage({ type: "error", text: `Failed to load departments (${deptRes.status})` });
          }
        }

        if (posRes.ok) {
          try {
            const posData = await posRes.json();
            setPositions(Array.isArray(posData) ? posData : []);
          } catch (parseError) {
            console.error("Error parsing positions JSON:", parseError);
            setMessage({ type: "error", text: "Failed to parse positions data" });
          }
        } else {
          try {
            const errorText = await posRes.text();
            setMessage({ type: "error", text: `Failed to load positions (${posRes.status}): ${errorText}` });
          } catch (error) {
            setMessage({ type: "error", text: `Failed to load positions (${posRes.status})` });
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setMessage({ type: "error", text: "Failed to load departments and positions" });
      }
    }

    fetchData();
  }, []);

  // Handle dropdown change - load department details into form
  const handleSelectDepartment = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = e.target.value;
    setSelectedId(deptId);

    if (deptId) {
      const selected = departments.find((dept) => dept._id === deptId);
      if (selected) {
        setFormData({
          code: selected.code,
          name: selected.name,
          description: selected.description || "",
          headPositionId: selected.headPositionId || "",
          isActive: selected.isActive,
        });
        setMessage(null);
      }
    } else {
      setFormData({});
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle save/update
  const handleSave = async () => {
    if (!selectedId || !formData.name || !formData.code) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    setLoading(true);
    try {
      const updatePayload = {
        code: formData.code,
        name: formData.name,
        description: formData.description || "",
        headPositionId: formData.headPositionId || undefined,
        isActive: formData.isActive ?? true,
      };

      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: "error", text: "Authentication required. Please log in." });
        setLoading(false);
        return;
      }

      const res = await fetch(`http://localhost:5000/organization-structure/departments/${selectedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Department updated successfully!" });
        setDepartments((prev) =>
          prev.map((dept) => (dept._id === selectedId ? { ...dept, ...formData } : dept))
        );
      } else {
        const errorData = await res.json();
        setMessage({ type: "error", text: `Failed to update department: ${errorData.message}` });
      }
    } catch (err) {
      console.error("Error updating department:", err);
      setMessage({ type: "error", text: "Error updating department" });
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

  const focusStyle = {
    outline: 'none',
    borderColor: 'var(--border-focus)',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--org-structure)', marginBottom: '0.5rem' }}>
          Update Department
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Modify existing department information
        </p>
      </div>

      {/* Department Dropdown */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          Select Department
        </label>
        <select
          value={selectedId}
          onChange={handleSelectDepartment}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
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
            <option value="" disabled>No departments available</option>
          )}
        </select> 
      </div>

      {/* Form Fields */}
      {selectedId && (
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-light)',
          borderRadius: '0.75rem',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          {/* Code */}
          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Department Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code || ""}
              onChange={handleInputChange}
              style={inputStyle}
              placeholder="e.g., DEPT001"
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Name */}
          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Department Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              style={inputStyle}
              placeholder="e.g., Human Resources"
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              rows={4}
              style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
              placeholder="Department description..."
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Head Position */}
          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Head Position
            </label>
            <select
              name="headPositionId"
              value={formData.headPositionId || ""}
              onChange={handleInputChange}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">-- None --</option>
              {positions.map((pos) => (
                <option key={pos._id} value={pos._id}>
                  {pos.title} ({pos.code})
                </option>
              ))}
            </select>
          </div>

          {/* Is Active */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive ?? true}
              onChange={handleInputChange}
              style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', cursor: 'pointer' }}
            />
            <label htmlFor="isActive" style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.875rem', cursor: 'pointer' }}>
              Active Department
            </label>
          </div>

          {/* Message */}
          {message && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: message.type === "success" ? 'var(--success-light)' : 'var(--error-light)',
                color: message.type === "success" ? 'var(--success-dark)' : 'var(--error-dark)',
                borderLeft: `4px solid ${message.type === "success" ? 'var(--success)' : 'var(--error)'}`,
              }}
            >
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              width: '100%',
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
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
