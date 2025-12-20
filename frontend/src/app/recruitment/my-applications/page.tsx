"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { recruitmentApi } from "../services";

interface Application {
  _id: string;
  jobRequisitionId: string;
  jobTitle: string;
  department: string;
  location: string;
  currentStage: string;
  status: string;
  appliedAt: string;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  submitted: { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" },
  in_process: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  offer: { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
  hired: { bg: "#CFFAFE", text: "#0E7490", border: "#67E8F9" },
  rejected: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
};

const stageColors: Record<string, { bg: string; text: string; border: string }> = {
  SCREENING: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  INTERVIEW: { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" },
  ASSESSMENT: { bg: "#E0E7FF", text: "#3730A3", border: "#A5B4FC" },
  OFFER: { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
  HIRED: { bg: "#CFFAFE", text: "#0E7490", border: "#67E8F9" },
  REJECTED: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
  WITHDRAWN: { bg: "#F3F4F6", text: "#4B5563", border: "#D1D5DB" },
};

// Status progression order (excluding rejected which is terminal)
const STATUS_PROGRESSION = ["submitted", "in_process", "offer", "hired"];

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  in_process: "In Process",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationOffers, setApplicationOffers] = useState<Record<string, any>>({});
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);
  const [rejectingOfferId, setRejectingOfferId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?returnUrl=/recruitment/my-applications");
      return;
    }
    fetchApplications();
  }, [router]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recruitment/applications/my-applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?returnUrl=/recruitment/my-applications");
          return;
        }
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data);
      console.log('=== MY APPLICATIONS PAGE ===');
      console.log('Total applications fetched:', data.length);
      console.log('Applications data:', data);

      // Fetch offers for each application in OFFER status
      try {
        const offerMap: Record<string, any> = {};
        
        // Find applications that might have offers (status is 'offer' or stage is 'OFFER')
        const applicationsWithOffers = data.filter((app: Application) => 
          app.status?.toLowerCase() === 'offer' || 
          app.currentStage?.toUpperCase() === 'OFFER'
        );
        
        console.log('=== OFFER FETCHING ===');
        console.log('Applications in OFFER status:', applicationsWithOffers.length);
        console.log('Application IDs to check for offers:', applicationsWithOffers.map((a: Application) => ({
          id: a._id,
          status: a.status,
          stage: a.currentStage,
          jobTitle: a.jobTitle
        })));
        
        // Fetch offers for each application
        for (const app of applicationsWithOffers) {
          console.log(`Fetching offers for application: ${app._id} (${app.jobTitle})...`);
          try {
            const offers = await recruitmentApi.getOffersByApplicationId(app._id);
            console.log(`✓ Offers found for ${app._id}:`, offers.length, offers);
            if (offers && offers.length > 0) {
              // Store the first/latest offer for this application
              offerMap[app._id] = offers[0];
              console.log(`  → Stored offer:`, {
                offerId: offers[0]._id,
                salary: offers[0].grossSalary,
                finalStatus: offers[0].finalStatus,
                applicantResponse: offers[0].applicantResponse
              });
            } else {
              console.log(`  → No offers found for this application`);
            }
          } catch (offerErr) {
            console.error(`✗ Failed to fetch offers for application ${app._id}:`, offerErr);
          }
        }
        
        console.log('=== FINAL OFFER MAP ===');
        console.log('Offers loaded for applications:', Object.keys(offerMap).length);
        console.log('Offer map:', offerMap);
        setApplicationOffers(offerMap);
      } catch (offerErr) {
        console.error('Failed to fetch offers:', offerErr);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: string, applicationId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Get the candidateId from the offer (not from JWT since they're different)
      const offer = applicationOffers[applicationId];
      if (!offer) {
        alert('Offer not found. Please refresh the page.');
        return;
      }
      
      // Extract candidateId from the offer - it could be an object or string
      const candidateId = typeof offer.candidateId === 'string' 
        ? offer.candidateId 
        : offer.candidateId?._id;
      
      if (!candidateId) {
        alert('Unable to verify candidate identity. Please try again.');
        return;
      }
      
      console.log('Accepting offer:', offerId, 'with candidateId:', candidateId);

      setAcceptingOfferId(offerId);
      await recruitmentApi.candidateAcceptOffer(offerId, candidateId);
      
      // Refresh applications to show updated status
      await fetchApplications();
      
      alert('Congratulations! You have accepted the offer. You will receive onboarding instructions shortly.');
    } catch (err) {
      console.error('Failed to accept offer:', err);
      alert('Failed to accept offer. Please try again.');
    } finally {
      setAcceptingOfferId(null);
    }
  };

  const handleRejectOffer = async (offerId: string, applicationId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const offer = applicationOffers[applicationId];
      if (!offer) {
        alert('Offer not found. Please refresh the page.');
        return;
      }
      
      const candidateId = typeof offer.candidateId === 'string' 
        ? offer.candidateId 
        : offer.candidateId?._id;
      
      if (!candidateId) {
        alert('Unable to verify candidate identity. Please try again.');
        return;
      }
      
      setRejectingOfferId(offerId);
      await recruitmentApi.candidateRejectOffer(offerId, candidateId, rejectReason);
      
      // Close modal and refresh
      setShowRejectModal(null);
      setRejectReason("");
      await fetchApplications();
      
      alert('You have declined this offer.');
    } catch (err) {
      console.error('Failed to reject offer:', err);
      alert('Failed to reject offer. Please try again.');
    } finally {
      setRejectingOfferId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStageStyle = (stage: string) => {
    const colors = stageColors[stage] || stageColors.SCREENING;
    return {
      backgroundColor: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
    };
  };

  const getStatusStyle = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || "submitted";
    const colors = statusColors[normalizedStatus] || statusColors.submitted;
    return {
      backgroundColor: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
    };
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        backgroundColor: "var(--bg-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "4px solid var(--border-light)",
            borderTopColor: "var(--recruitment)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 1rem"
          }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading your applications...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        backgroundColor: "var(--bg-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "var(--shadow-md)",
          textAlign: "center",
          maxWidth: "400px"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#FEE2E2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem"
          }}>
            <span style={{ fontSize: "24px" }}>⚠️</span>
          </div>
          <h2 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Error</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>{error}</p>
          <button
            onClick={fetchApplications}
            style={{
              backgroundColor: "var(--recruitment)",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-secondary)" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, var(--recruitment) 0%, #7C3AED 100%)",
        padding: "3rem 1.5rem",
        color: "white"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: 700, 
            marginBottom: "0.5rem" 
          }}>
            My Applications
          </h1>
          <p style={{ opacity: 0.9 }}>
            Track the status of your job applications
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Quick Actions */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <p style={{ color: "var(--text-secondary)" }}>
            {applications.length} application{applications.length !== 1 ? "s" : ""} found
          </p>
          <Link
            href="/recruitment/jobs/careers"
            style={{
              backgroundColor: "var(--recruitment)",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <span>🔍</span> Browse Jobs
          </Link>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "4rem 2rem",
            textAlign: "center",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#F3F4F6",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "2.5rem"
            }}>
              📋
            </div>
            <h2 style={{ 
              color: "var(--text-primary)", 
              marginBottom: "0.5rem",
              fontSize: "1.25rem"
            }}>
              No Applications Yet
            </h2>
            <p style={{ 
              color: "var(--text-secondary)", 
              marginBottom: "1.5rem",
              maxWidth: "400px",
              margin: "0 auto 1.5rem"
            }}>
              You haven&apos;t applied to any jobs yet. Browse our open positions and start your career journey!
            </p>
            <Link
              href="/recruitment/jobs/careers"
              style={{
                backgroundColor: "var(--recruitment)",
                color: "white",
                padding: "0.875rem 2rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-block"
              }}
            >
              View Open Positions
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {applications.map((app) => (
              <div
                key={app._id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid var(--border-light)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "1rem"
                }}>
                  {/* Job Info */}
                  <div style={{ flex: 1, minWidth: "250px" }}>
                    <h3 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.5rem"
                    }}>
                      {app.jobTitle || "Position"}
                    </h3>
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "1rem",
                      color: "var(--text-secondary)",
                      fontSize: "0.875rem"
                    }}>
                      {app.department && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          🏢 {app.department}
                        </span>
                      )}
                      {app.location && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          📍 {app.location}
                        </span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        📅 Applied {formatDate(app.appliedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "0.5rem"
                  }}>
                    <span
                      style={{
                        ...getStatusStyle(app.status),
                        padding: "0.375rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      {statusLabels[app.status?.toLowerCase()] || app.status?.replace(/_/g, " ") || "Submitted"}
                    </span>
                    {app.currentStage && (
                      <span
                        style={{
                          ...getStageStyle(app.currentStage),
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          fontWeight: 500,
                        }}
                      >
                        Stage: {app.currentStage?.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress indicator - based on status */}
                <div style={{ marginTop: "1rem" }}>
                  {app.status?.toLowerCase() === "rejected" ? (
                    // Rejected status - show red bar
                    <div>
                      <div style={{
                        width: "100%",
                        height: "4px",
                        backgroundColor: "#FCA5A5",
                        borderRadius: "4px",
                      }} />
                      <div style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "0.5rem",
                        fontSize: "0.75rem",
                        color: "#991B1B",
                        fontWeight: 500
                      }}>
                        Application Rejected
                      </div>
                    </div>
                  ) : (
                    // Normal progression
                    <>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}>
                        {STATUS_PROGRESSION.map((status, index) => {
                          const currentStatus = app.status?.toLowerCase() || "submitted";
                          const currentIndex = STATUS_PROGRESSION.indexOf(currentStatus);
                          const isCompleted = index < currentIndex;
                          const isCurrent = index === currentIndex;
                          
                          return (
                            <div key={status} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                              <div
                                style={{
                                  width: "100%",
                                  height: "4px",
                                  backgroundColor: isCompleted || isCurrent 
                                    ? "var(--recruitment)" 
                                    : "#E5E7EB",
                                  borderRadius: index === 0 ? "4px 0 0 4px" : index === STATUS_PROGRESSION.length - 1 ? "0 4px 4px 0" : "0",
                                  transition: "background-color 0.3s"
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "0.5rem",
                        fontSize: "0.65rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        {STATUS_PROGRESSION.map((status) => (
                          <span key={status}>{statusLabels[status]}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Offer Details Section - Show if offer exists */}
                {applicationOffers[app._id] && (
                  <div style={{ 
                    marginTop: "1rem", 
                    paddingTop: "1rem", 
                    borderTop: "2px solid var(--recruitment)",
                    backgroundColor: applicationOffers[app._id].applicantResponse === 'accepted' ? "#D1FAE5" 
                      : applicationOffers[app._id].applicantResponse === 'rejected' ? "#FEE2E2"
                      : "#F0FDF4",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginLeft: "-1rem",
                    marginRight: "-1rem",
                    marginBottom: "-1rem"
                  }}>
                    {/* Offer Header */}
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      marginBottom: "1rem"
                    }}>
                      <h4 style={{ 
                        margin: 0, 
                        color: "var(--recruitment)", 
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}>
                        🎉 Job Offer
                        {applicationOffers[app._id].applicantResponse === 'accepted' && (
                          <span style={{ 
                            backgroundColor: "#059669", 
                            color: "white", 
                            padding: "0.25rem 0.5rem", 
                            borderRadius: "4px", 
                            fontSize: "0.75rem" 
                          }}>
                            ACCEPTED
                          </span>
                        )}
                        {applicationOffers[app._id].applicantResponse === 'rejected' && (
                          <span style={{ 
                            backgroundColor: "#DC2626", 
                            color: "white", 
                            padding: "0.25rem 0.5rem", 
                            borderRadius: "4px", 
                            fontSize: "0.75rem" 
                          }}>
                            DECLINED
                          </span>
                        )}
                        {applicationOffers[app._id].applicantResponse === 'pending' && applicationOffers[app._id].finalStatus === 'approved' && (
                          <span style={{ 
                            backgroundColor: "#F59E0B", 
                            color: "white", 
                            padding: "0.25rem 0.5rem", 
                            borderRadius: "4px", 
                            fontSize: "0.75rem" 
                          }}>
                            AWAITING YOUR RESPONSE
                          </span>
                        )}
                        {applicationOffers[app._id].finalStatus === 'pending' && (
                          <span style={{ 
                            backgroundColor: "#6B7280", 
                            color: "white", 
                            padding: "0.25rem 0.5rem", 
                            borderRadius: "4px", 
                            fontSize: "0.75rem" 
                          }}>
                            PENDING APPROVAL
                          </span>
                        )}
                      </h4>
                      {applicationOffers[app._id].deadline && (
                        <span style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                          ⏰ Respond by: {formatDate(applicationOffers[app._id].deadline)}
                        </span>
                      )}
                    </div>

                    {/* Offer Details Grid */}
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                      gap: "1rem",
                      marginBottom: "1rem"
                    }}>
                      {/* Salary */}
                      <div style={{ 
                        backgroundColor: "white", 
                        padding: "0.75rem", 
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB"
                      }}>
                        <div style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.25rem" }}>
                          💰 Annual Salary
                        </div>
                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#059669" }}>
                          {formatCurrency(applicationOffers[app._id].grossSalary)}
                        </div>
                      </div>

                      {/* Signing Bonus */}
                      {applicationOffers[app._id].signingBonus > 0 && (
                        <div style={{ 
                          backgroundColor: "white", 
                          padding: "0.75rem", 
                          borderRadius: "8px",
                          border: "1px solid #E5E7EB"
                        }}>
                          <div style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.25rem" }}>
                            🎁 Signing Bonus
                          </div>
                          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#7C3AED" }}>
                            {formatCurrency(applicationOffers[app._id].signingBonus)}
                          </div>
                        </div>
                      )}

                      {/* Role */}
                      <div style={{ 
                        backgroundColor: "white", 
                        padding: "0.75rem", 
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB"
                      }}>
                        <div style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.25rem" }}>
                          👔 Position
                        </div>
                        <div style={{ fontSize: "1rem", fontWeight: 600, color: "#1F2937" }}>
                          {applicationOffers[app._id].role || app.jobTitle}
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    {applicationOffers[app._id].benefits && applicationOffers[app._id].benefits.length > 0 && (
                      <div style={{ 
                        backgroundColor: "white", 
                        padding: "0.75rem", 
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                        marginBottom: "1rem"
                      }}>
                        <div style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.5rem" }}>
                          🏥 Benefits Package
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                          {applicationOffers[app._id].benefits.map((benefit: string, idx: number) => (
                            <span 
                              key={idx}
                              style={{ 
                                backgroundColor: "#EEF2FF", 
                                color: "#4F46E5", 
                                padding: "0.25rem 0.75rem", 
                                borderRadius: "999px",
                                fontSize: "0.875rem"
                              }}
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conditions */}
                    {applicationOffers[app._id].conditions && (
                      <div style={{ 
                        backgroundColor: "white", 
                        padding: "0.75rem", 
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                        marginBottom: "1rem"
                      }}>
                        <div style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.25rem" }}>
                          📋 Conditions
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "#374151" }}>
                          {applicationOffers[app._id].conditions}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons - Only show if offer is approved and pending response */}
                    {applicationOffers[app._id].finalStatus === 'approved' && applicationOffers[app._id].applicantResponse === 'pending' && (
                      <div style={{ 
                        display: "flex", 
                        gap: "1rem", 
                        alignItems: "center", 
                        flexWrap: "wrap",
                        paddingTop: "0.5rem",
                        borderTop: "1px solid #E5E7EB"
                      }}>
                        <button
                          onClick={() => handleAcceptOffer(applicationOffers[app._id]._id, app._id)}
                          disabled={acceptingOfferId === applicationOffers[app._id]._id}
                          style={{
                            backgroundColor: acceptingOfferId === applicationOffers[app._id]._id ? "#9CA3AF" : "#059669",
                            color: "white",
                            border: "none",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            cursor: acceptingOfferId === applicationOffers[app._id]._id ? "not-allowed" : "pointer",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                          }}
                        >
                          {acceptingOfferId === applicationOffers[app._id]._id ? (
                            <>⏳ Accepting...</>
                          ) : (
                            <>✓ Accept Offer</>
                          )}
                        </button>
                        
                        <button
                          onClick={() => setShowRejectModal(app._id)}
                          disabled={rejectingOfferId === applicationOffers[app._id]._id}
                          style={{
                            backgroundColor: "white",
                            color: "#DC2626",
                            border: "2px solid #DC2626",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            cursor: rejectingOfferId === applicationOffers[app._id]._id ? "not-allowed" : "pointer",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                          }}
                        >
                          ✕ Decline Offer
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Reject Modal */}
                {showRejectModal === app._id && (
                  <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                  }}>
                    <div style={{
                      backgroundColor: "white",
                      padding: "2rem",
                      borderRadius: "12px",
                      maxWidth: "500px",
                      width: "90%",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                    }}>
                      <h3 style={{ margin: "0 0 1rem 0", color: "#DC2626" }}>
                        Decline Offer
                      </h3>
                      <p style={{ color: "#6B7280", marginBottom: "1rem" }}>
                        Are you sure you want to decline this offer for <strong>{app.jobTitle}</strong>? 
                        This action cannot be undone.
                      </p>
                      <textarea
                        placeholder="Please provide a reason (optional)..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          border: "1px solid #D1D5DB",
                          marginBottom: "1rem",
                          minHeight: "100px",
                          resize: "vertical"
                        }}
                      />
                      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => {
                            setShowRejectModal(null);
                            setRejectReason("");
                          }}
                          style={{
                            backgroundColor: "#F3F4F6",
                            color: "#374151",
                            border: "none",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: 500
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRejectOffer(applicationOffers[app._id]._id, app._id)}
                          disabled={rejectingOfferId === applicationOffers[app._id]._id}
                          style={{
                            backgroundColor: rejectingOfferId === applicationOffers[app._id]._id ? "#9CA3AF" : "#DC2626",
                            color: "white",
                            border: "none",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            cursor: rejectingOfferId === applicationOffers[app._id]._id ? "not-allowed" : "pointer",
                            fontWeight: 600
                          }}
                        >
                          {rejectingOfferId === applicationOffers[app._id]._id ? "Declining..." : "Confirm Decline"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
