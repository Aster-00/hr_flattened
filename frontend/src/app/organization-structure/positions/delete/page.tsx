"use client";

import React, { useEffect, useState } from "react";

type Position = {
  _id: string;
  code: string;
  title: string;
};

export default function DeletePositionPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch positions on mount
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        // Try both token keys
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        console.log("TOKEN FROM STORAGE:", token ? "Token found" : "No token");

        if (!token) {
          setMessage("Authentication required. Please log in.");
          return;
        }

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

    if (!selectedId) {
      setMessage("Please select a position");
      return;
    }

    if (!confirm("Are you sure you want to delete this position?")) return;

    setLoading(true);
    setMessage("");

    try {
      // Try both token keys
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) {
        setMessage("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/organization-structure/positions/${selectedId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage("Position deleted successfully!");
        setSelectedId("");
        // remove deleted position from dropdown
        setPositions((prev) => prev.filter((p) => p._id !== selectedId));
      } else {
        const error = await response.text();
        setMessage(`Error: ${error}`);
      }
    } catch (error) {
      console.error("Error deleting position:", error);
      setMessage("Network error while deleting position");
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
          Delete Position
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Remove a position from the organization
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
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'var(--error)',
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
                e.currentTarget.style.backgroundColor = 'var(--error-dark)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'var(--error)';
              }
            }}
          >
            {loading ? "Deleting..." : "Delete Position"}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: message.includes('Error') || message.includes('Failed') ? 'var(--error-light)' : 'var(--success-light)',
            color: message.includes('Error') || message.includes('Failed') ? 'var(--error-dark)' : 'var(--success-dark)',
            borderLeft: `4px solid ${message.includes('Error') || message.includes('Failed') ? 'var(--error)' : 'var(--success)'}`,
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
