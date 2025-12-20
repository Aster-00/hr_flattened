"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type JobTemplate = {
  _id: string;
  title: string;
  department: string;
  qualifications: string[];
  skills: string[];
  description?: string;
};

type JobRequisition = {
  _id: string;
  requisitionId: string;
  templateId: string | JobTemplate;
  openings: number;
  location: string;
  publishStatus: 'draft' | 'published' | 'closed';
  postingDate?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
};

type JobPosting = {
  id: string;
  title: string;
  department: string;
  location: string;
  openings: number;
  description: string;
  qualifications: string[];
  skills: string[];
  postedDate: string;
  expiryDate?: string;
};

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      fetchCandidateApplications();
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchCandidateApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recruitment/applications/my-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch applications');
        return;
      }

      const applications = await response.json();
      
      // Extract job requisition IDs from applications
      const jobIds = new Set<string>(applications.map((app: { jobRequisitionId: string }) => app.jobRequisitionId));
      setAppliedJobIds(jobIds);
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recruitment/careers/jobs`);

      if (!response.ok) {
        throw new Error("Failed to fetch job postings");
      }

      const data: JobRequisition[] = await response.json();

      // Transform the data to match our JobPosting type
      const transformedJobs: JobPosting[] = data
        .filter((req) => typeof req.templateId === 'object' && req.templateId !== null)
        .map((req) => {
          const template = req.templateId as JobTemplate;
          return {
            id: req._id,
            title: template.title,
            department: template.department,
            location: req.location,
            openings: req.openings,
            description: template.description || `Join our ${template.department} team as a ${template.title}. We are looking for talented individuals to fill ${req.openings} position(s).`,
            qualifications: template.qualifications || [],
            skills: template.skills || [],
            postedDate: req.postingDate || req.createdAt,
            expiryDate: req.expiryDate,
          };
        });

      setJobs(transformedJobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job: JobPosting) => {
    // Redirect to login if not authenticated
    if (!isLoggedIn) {
      const returnUrl = encodeURIComponent('/recruitment/jobs/careers');
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    // Check if already applied
    if (appliedJobIds.has(job.id)) {
      alert('You have already applied to this position.');
      return;
    }

    // Submit application directly for authenticated users (no modal)
    setSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recruitment/applications/apply/${job.id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit application");
      }

      // Update applied jobs list
      setAppliedJobIds(prev => new Set([...prev, job.id]));
      
      // Show success message
      alert(`Successfully applied to ${job.title}!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit application";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = () => {
    const returnUrl = encodeURIComponent('/recruitment/jobs/careers');
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading opportunities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "var(--error)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-secondary)" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "var(--recruitment)",
          padding: "4rem 2rem",
          textAlign: "center",
          color: "white",
          position: "relative",
        }}
      >
        {/* Logged-in indicator */}
        {isLoggedIn && (
          <div
            style={{
              position: "absolute",
              top: "1rem",
              right: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span style={{ fontWeight: "500" }}>Welcome back!</span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.875rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
              }}
            >
              Logout
            </button>
          </div>
        )}

        <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>
          Join Our Team
        </h1>
        <p style={{ fontSize: "1.25rem", maxWidth: "800px", margin: "0 auto", opacity: 0.95 }}>
          Explore exciting opportunities and grow your career with us
        </p>

        {/* Login prompt for non-logged in users */}
        {!isLoggedIn && (
          <div style={{ marginTop: "1.5rem" }}>
            <button
              onClick={handleLogin}
              style={{
                backgroundColor: "white",
                color: "var(--recruitment)",
                border: "none",
                padding: "0.75rem 2rem",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Login / Create Account
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>
        {jobs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              backgroundColor: "var(--bg-primary)",
              borderRadius: "0.75rem",
              border: "1px solid var(--border-color)",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", color: "var(--text-primary)", marginBottom: "1rem" }}>
              No Open Positions
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              We don't have any open positions at the moment, but check back soon!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {jobs.map((job) => (
              <div
                key={job.id}
                style={{
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.75rem",
                  padding: "2rem",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Job Header */}
                <div style={{ marginBottom: "1rem" }}>
                  <h2
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: "600",
                      color: "var(--recruitment)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {job.title}
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "1rem",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span>Location: {job.location}</span>
                    <span>Department: {job.department}</span>
                    <span>{job.openings} {job.openings === 1 ? 'opening' : 'openings'}</span>
                    <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                    {job.expiryDate && (
                      <span>Expires {new Date(job.expiryDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Job Description */}
                <p
                  style={{
                    color: "var(--text-primary)",
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                  }}
                >
                  {job.description}
                </p>

                {/* Expanded Details */}
                {selectedJob?.id === job.id && (
                  <div
                    style={{
                      marginTop: "1.5rem",
                      paddingTop: "1.5rem",
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    {job.qualifications.length > 0 && (
                      <div style={{ marginBottom: "1.5rem" }}>
                        <h3
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: "600",
                            color: "var(--text-primary)",
                            marginBottom: "0.75rem",
                          }}
                        >
                          Qualifications
                        </h3>
                        <ul
                          style={{
                            listStyle: "disc",
                            paddingLeft: "1.5rem",
                            color: "var(--text-secondary)",
                            lineHeight: "1.8",
                          }}
                        >
                          {job.qualifications.map((qual: string, index: number) => (
                            <li key={index}>{qual}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {job.skills.length > 0 && (
                      <div>
                        <h3
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: "600",
                            color: "var(--text-primary)",
                            marginBottom: "0.75rem",
                          }}
                        >
                          Required Skills
                        </h3>
                        <ul
                          style={{
                            listStyle: "disc",
                            paddingLeft: "1.5rem",
                            color: "var(--text-secondary)",
                            lineHeight: "1.8",
                          }}
                        >
                          {job.skills.map((skill: string, index: number) => (
                            <li key={index}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Apply Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(job);
                  }}
                  disabled={isLoggedIn && appliedJobIds.has(job.id)}
                  style={{
                    marginTop: "1.5rem",
                    padding: "0.75rem 2rem",
                    backgroundColor: isLoggedIn && appliedJobIds.has(job.id) 
                      ? "var(--text-secondary)" 
                      : "var(--recruitment)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: isLoggedIn && appliedJobIds.has(job.id) ? "not-allowed" : "pointer",
                    transition: "background-color 0.2s",
                    opacity: isLoggedIn && appliedJobIds.has(job.id) ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!appliedJobIds.has(job.id)) {
                      e.currentTarget.style.opacity = "0.9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!appliedJobIds.has(job.id)) {
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                >
                  {isLoggedIn && appliedJobIds.has(job.id) ? "Already Applied" : "Apply Now"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
