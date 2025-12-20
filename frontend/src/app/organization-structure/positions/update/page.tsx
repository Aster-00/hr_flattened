"use client"; // if using Next.js 13+ app directory

import { useEffect, useState } from "react";

type Position = {
  _id: string;
  code: string;
  title: string;
  description?: string;
  departmentId: string;
  reportsToPositionId?: string;
  isActive: boolean;
};

type Department = {
  _id: string;
  name: string;
};

export default function UpdatePositionPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [formData, setFormData] = useState<Partial<Position>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch positions and departments from backend
  useEffect(() => {
    async function fetchData() {
      try {
        // Try both token keys
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        console.log("TOKEN FROM STORAGE:", token ? "Token found" : "No token");

        if (!token) {
          setMessage({ type: "error", text: "Authentication required. Please log in." });
          return;
        }

        const [posRes, deptRes] = await Promise.all([
          fetch("http://localhost:5000/organization-structure/positions", {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/organization-structure/departments", {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
        ]);

        console.log("Positions response status:", posRes.status, posRes.statusText);
        console.log("Departments response status:", deptRes.status, deptRes.statusText);

        if (posRes.ok) {
          try {
            const posData = await posRes.json();
            console.log("Positions data received:", posData);
            
            // Handle different response formats
            let positionsArray: any[] = [];
            if (Array.isArray(posData)) {
              positionsArray = posData;
            } else if (posData && Array.isArray(posData.data)) {
              positionsArray = posData.data;
            } else if (posData && Array.isArray(posData.positions)) {
              positionsArray = posData.positions;
            }
            
            console.log("Positions array length:", positionsArray.length);
            
            // Handle case where departmentId might be populated as an object
            const normalizedPositions = positionsArray.map((pos: any) => ({
              _id: pos._id || pos.id,
              code: pos.code || '',
              title: pos.title || '',
              description: pos.description || '',
              departmentId: typeof pos.departmentId === 'object' && pos.departmentId?._id 
                ? pos.departmentId._id 
                : pos.departmentId || '',
              reportsToPositionId: typeof pos.reportsToPositionId === 'object' && pos.reportsToPositionId?._id
                ? pos.reportsToPositionId._id
                : pos.reportsToPositionId || '',
              isActive: pos.isActive !== undefined ? pos.isActive : true,
            }));
            
            setPositions(normalizedPositions);
            console.log("Normalized positions set:", normalizedPositions.length);
          } catch (parseError) {
            console.error("Error parsing positions JSON:", parseError);
            setMessage({ type: "error", text: "Failed to parse positions data" });
          }
        } else {
          try {
            const errorText = await posRes.text();
            console.error("Error fetching positions:", posRes.status, errorText);
            setMessage({ type: "error", text: `Failed to load positions (${posRes.status}): ${errorText}` });
          } catch (error) {
            console.error("Error reading error response:", error);
            setMessage({ type: "error", text: `Failed to load positions (${posRes.status})` });
          }
        }

        if (deptRes.ok) {
          try {
            const deptData = await deptRes.json();
            console.log("Departments data received:", deptData);
            
            // Handle different response formats
            let departmentsArray: any[] = [];
            if (Array.isArray(deptData)) {
              departmentsArray = deptData;
            } else if (deptData && Array.isArray(deptData.data)) {
              departmentsArray = deptData.data;
            } else if (deptData && Array.isArray(deptData.departments)) {
              departmentsArray = deptData.departments;
            }
            
            const normalizedDepartments = departmentsArray.map((dept: any) => ({
              _id: dept._id || dept.id,
              name: dept.name || '',
            }));
            
            setDepartments(normalizedDepartments);
            console.log("Departments set:", normalizedDepartments.length);
          } catch (parseError) {
            console.error("Error parsing departments JSON:", parseError);
            setMessage({ type: "error", text: "Failed to parse departments data" });
          }
        } else {
          try {
            const errorText = await deptRes.text();
            console.error("Error fetching departments:", deptRes.status, errorText);
            setMessage({ type: "error", text: `Failed to load departments (${deptRes.status}): ${errorText}` });
          } catch (error) {
            console.error("Error reading error response:", error);
            setMessage({ type: "error", text: `Failed to load departments (${deptRes.status})` });
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setMessage({ type: "error", text: "Failed to load positions and departments. Check console for details." });
      }
    }

    fetchData();
  }, []);

  // Handle dropdown change - load position details into form
  const handleSelectPosition = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const posId = e.target.value;
    setSelectedId(posId);

    if (posId) {
      const selected = positions.find((pos) => pos._id === posId);
      if (selected) {
        setFormData({
          code: selected.code,
          title: selected.title,
          description: selected.description || "",
          departmentId: selected.departmentId,
          reportsToPositionId: selected.reportsToPositionId || "",
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
    if (!selectedId || !formData.title || !formData.code || !formData.departmentId) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    setLoading(true);
    try {
      const updatePayload = {
        code: formData.code,
        title: formData.title,
        description: formData.description || "",
        departmentId: formData.departmentId,
        reportsToPositionId: formData.reportsToPositionId || undefined,
        isActive: formData.isActive ?? true,
      };

      // Try both token keys
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        setMessage({ type: "error", text: "Authentication required. Please log in." });
        setLoading(false);
        return;
      }

      const res = await fetch(`http://localhost:5000/organization-structure/positions/${selectedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Position updated successfully!" });
        // Update local state
        setPositions((prev) =>
          prev.map((pos) => (pos._id === selectedId ? { ...pos, ...formData } : pos))
        );
      } else {
        const errorData = await res.json();
        setMessage({ type: "error", text: `Failed to update position: ${errorData.message}` });
      }
    } catch (err) {
      console.error("Error updating position:", err);
      setMessage({ type: "error", text: "Error updating position" });
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (deptId: string | any) => {
    // Handle case where deptId might be an object (populated)
    const id = typeof deptId === 'object' && deptId?._id ? deptId._id : deptId;
    return departments.find((d) => d._id === id)?.name || "Unknown";
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
          Update Position
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Modify position details and requirements
        </p>
      </div>

      {/* Position Dropdown */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          Select Position
        </label>
        <select
          value={selectedId}
          onChange={handleSelectPosition}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-medium)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="">-- Select a Position --</option>
          {positions.length > 0 ? (
            positions.map((pos) => (
              <option key={pos._id} value={pos._id}>
                {pos.title} ({pos.code}) - {getDepartmentName(pos.departmentId)}
              </option>
            ))
          ) : (
            <option value="" disabled>
              {message && message.type === "error" ? "Error loading positions - see message below" : "No positions available"}
            </option>
          )}
        </select>
        {positions.length > 0 && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {positions.length} position{positions.length !== 1 ? 's' : ''} found
          </p>
        )}
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
              Position Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code || ""}
              onChange={handleInputChange}
              style={inputStyle}
              placeholder="e.g., POS001"
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Title */}
          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Position Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              style={inputStyle}
              placeholder="e.g., Senior Developer"
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
              placeholder="Position description..."
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Department */}
          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Department *
            </label>
            <select
              name="departmentId"
              value={formData.departmentId || ""}
              onChange={handleInputChange}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">-- Select Department --</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reports To Position */}
          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Reports To Position
            </label>
            <select
              name="reportsToPositionId"
              value={formData.reportsToPositionId || ""}
              onChange={handleInputChange}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">-- None --</option>
              {positions
                .filter((pos) => pos._id !== selectedId) // Exclude current position
                .map((pos) => (
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
              Active Position
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
