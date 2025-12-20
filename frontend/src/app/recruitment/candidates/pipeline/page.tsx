"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, DragStartEvent, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { recruitmentApi } from '../../services';
import { emailService } from '../../services/email.service';
import { ApplicationWithDetails } from '../../types';
import CandidateProfile from '../../components/CandidateProfile';
import KanbanColumn from './KanbanColumn';
import CandidateCard from './CandidateCard';
import { APPLICATION_STATUS_STAGES } from '../../enums/application-status.enum';

// REC-004: Application Status stages for Kanban columns (based on Application.status field)
const STAGES = APPLICATION_STATUS_STAGES;

export default function CandidatePipelinePage() {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  // Fetch applications on mount
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getAllApplications();
      setApplications(data);
      setFilteredApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter applications based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredApplications(applications);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = applications.filter(app => {
      const candidateName = app.candidateId?.fullName ||
                           `${app.candidateId?.firstName || ''} ${app.candidateId?.lastName || ''}`.trim();
      const candidateNumber = app.candidateId?.candidateNumber || '';
      const jobTitle = app.requisitionId?.templateId?.title || '';
      const email = app.candidateId?.personalEmail || '';

      return candidateName.toLowerCase().includes(query) ||
             candidateNumber.toLowerCase().includes(query) ||
             jobTitle.toLowerCase().includes(query) ||
             email.toLowerCase().includes(query);
    });

    setFilteredApplications(filtered);
  }, [searchQuery, applications]);

  // Group filtered applications by application status (REC-004)
  const applicationsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredApplications.filter(app => app.status === stage.id);
    return acc;
  }, {} as Record<string, ApplicationWithDetails[]>);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end - Update application status (REC-004)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const applicationId = active.id as string;
    const newStatus = over.id as string;

    // Validate that the drop target is a valid status
    const validStatus = STAGES.find(stage => stage.id === newStatus);
    if (!validStatus) return;

    // Find the application being dragged
    const application = applications.find(app => app._id === applicationId);
    if (!application) return;

    const currentStatus = application.status;

    // If status hasn't changed, do nothing
    if (currentStatus === newStatus) return;

    // Optimistically update UI
    setApplications(prevApps =>
      prevApps.map(app =>
        app._id === applicationId
          ? {
              ...app,
              status: newStatus
            }
          : app
      )
    );

    // Update application status on backend
    try {
      await recruitmentApi.updateApplicationStatus(
        applicationId,
        newStatus,
        `Status changed from ${currentStatus} to ${newStatus}`
      );

      // Send email notification to candidate about status change
      const candidateEmail = application.candidateId?.personalEmail;
      const candidateName = application.candidateId?.fullName ||
        `${application.candidateId?.firstName || ''} ${application.candidateId?.lastName || ''}`.trim();
      const jobTitle = application.requisitionId?.templateId?.title || 'the position';
      const newStatusLabel = validStatus.label;

      if (candidateEmail) {
        const subject = `Application Status Update - ${jobTitle}`;
        const message = `Dear ${candidateName},

We wanted to inform you that your application status for ${jobTitle} has been updated.

Your application is now in the "${newStatusLabel}" stage.

Thank you for your interest in joining our team. We will keep you updated on any further developments.

Best regards,
HR Department`;

        emailService.sendCustomEmail(candidateEmail, subject, message)
          .then(success => {
            if (success) {
              console.log('Status update email sent to candidate:', candidateEmail);
            } else {
              console.warn('Failed to send status update email to candidate');
            }
          })
          .catch(err => {
            console.error('Error sending status update email:', err);
          });
      }
    } catch (err: any) {
      console.error('Error updating application status:', err);
      // Revert optimistic update on error
      setApplications(prevApps =>
        prevApps.map(app =>
          app._id === applicationId
            ? {
                ...app,
                status: currentStatus
              }
            : app
        )
      );
      alert('Failed to update application status. Please try again.');
    }
  };

  // Handle card click
  const handleCardClick = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setShowSidePanel(true);
  };

  // Handle when a candidate is marked as referral - reload applications to get updated data
  const handleReferralMarked = () => {
    loadApplications();
  };

  // Get the active application for drag overlay
  const activeApplication = activeId
    ? applications.find(app => app._id === activeId)
    : null;

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "1.5rem", color: "var(--recruitment)" }}>
          Candidate Pipeline
        </h1>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading applications...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "1.5rem", color: "var(--recruitment)" }}>
          Candidate Pipeline
        </h1>
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--error-bg)',
          borderRadius: '0.5rem',
          border: '1px solid var(--error)',
          color: 'var(--error)',
        }}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: "2rem",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
        flexShrink: 0,
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", color: "var(--recruitment)", margin: 0 }}>
          Candidate Pipeline
        </h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid var(--border-color)",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              minWidth: "250px",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
          />
          <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Showing: <strong>{filteredApplications.length}</strong> / {applications.length}
          </span>
          <button
            onClick={loadApplications}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "var(--recruitment)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{
          display: "flex",
          gap: "1rem",
          flex: 1,
          overflow: "hidden",
          alignItems: "stretch",
        }}>
          {STAGES.map(stage => (
            <SortableContext
              key={stage.id}
              id={stage.id}
              items={applicationsByStage[stage.id]?.map(app => app._id) || []}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={stage.id}
                title={stage.label}
                color={stage.color}
                count={applicationsByStage[stage.id]?.length || 0}
              >
                {applicationsByStage[stage.id]?.map(application => (
                  <CandidateCard
                    key={application._id}
                    application={application}
                    onClick={() => handleCardClick(application._id)}
                    isReferral={application.isReferral || false}
                    onReferralMarked={handleReferralMarked}
                  />
                ))}
              </KanbanColumn>
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeApplication ? (
            <div style={{ opacity: 0.8 }}>
              <CandidateCard
                application={activeApplication}
                onClick={() => {}}
                isReferral={activeApplication.isReferral || false}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Side Panel for Candidate Profile */}
      {showSidePanel && selectedApplicationId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "50%",
            height: "100vh",
            backgroundColor: "var(--bg-primary)",
            boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            overflow: "auto",
          }}
        >
          <div style={{
            position: "sticky",
            top: 0,
            backgroundColor: "var(--bg-primary)",
            borderBottom: "1px solid var(--border-color)",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 10,
          }}>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>
              Candidate Profile
            </h2>
            <button
              onClick={() => {
                setShowSidePanel(false);
                setSelectedApplicationId(null);
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "var(--text-secondary)",
              }}
            >
              ×
            </button>
          </div>
          <div style={{ padding: "1.5rem" }}>
            <CandidateProfile
              applicationId={selectedApplicationId}
              onStageUpdate={loadApplications}
            />
          </div>
        </div>
      )}

      {/* Backdrop overlay when side panel is open */}
      {showSidePanel && (
        <div
          onClick={() => {
            setShowSidePanel(false);
            setSelectedApplicationId(null);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "50%",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
}
