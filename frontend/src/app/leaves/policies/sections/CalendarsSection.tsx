// Calendars Section
"use client";

import React, { useState } from 'react';
import { useCalendars } from '../../hooks/queries/useCalendars';
import EmptyState from '../../components/common/EmptyState';
import BlockedPeriodsManager from '../../components/calendars/BlockedPeriodsManager';
import HolidaysManager from '../../components/calendars/HolidaysManager';

export function CalendarsSection() {
	const { calendars, isLoading, isError, refetch } = useCalendars();
	const [selectedCalendar, setSelectedCalendar] = useState<any>(null);
	const [showManagement, setShowManagement] = useState(false);

	const hasCalendars = calendars.length > 0;

	return (
		<div className="leaves-card" style={{ boxShadow: 'var(--shadow-md)', padding: '1.5rem' }}>
			<h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
				Company calendars
			</h2>
			<p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
				Calendars define working days, weekends and public holidays used when
				calculating leave durations.
			</p>

			{isLoading && (
				<div style={{ padding: '1.5rem 0', color: 'var(--text-secondary)' }}>
					Loading calendars…
				</div>
			)}

			{!isLoading && isError && (
				<div style={{ marginTop: '0.5rem' }}>
					<EmptyState
						title="Could not load calendars"
						description="The calendar service is currently unavailable or you do not have access. Please try again."
						icon="⚠️"
					/>
				</div>
			)}

			{!isLoading && !isError && !hasCalendars && (
				<div style={{ marginTop: '0.5rem' }}>
					<EmptyState
						title="No calendars found"
						description="No company calendars are configured yet. HR can create calendars in the admin tools."
						icon="🗓️"
					/>
				</div>
			)}

			{!isLoading && !isError && hasCalendars && (
				<>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
						{calendars
							.slice()
							.sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
							.map((calendar) => {
								const blockedCount = calendar.blockedPeriods?.length ?? 0;
								const holidaysCount = Array.isArray(calendar.holidays)
									? calendar.holidays.length
									: 0;
								const isSelected = selectedCalendar?._id === calendar._id;

								return (
									<div
										key={String(calendar._id)}
										className="p-4 rounded-xl"
										style={{
											background: 'var(--bg-primary)',
											border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
											boxShadow: 'var(--shadow-sm)',
											cursor: 'pointer',
											transition: 'all 0.15s',
										}}
										onClick={() => {
											setSelectedCalendar(calendar);
											setShowManagement(true);
										}}
										onMouseEnter={(e) => {
											if (!isSelected) {
												e.currentTarget.style.borderColor = 'var(--primary-300)';
											}
										}}
										onMouseLeave={(e) => {
											if (!isSelected) {
												e.currentTarget.style.borderColor = 'var(--border-light)';
											}
										}}
									>
										<div className="flex items-center justify-between gap-4">
											<div>
												<div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
													{calendar.year}
												</div>
												<div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
													{holidaysCount} holidays • {blockedCount} blocked periods
												</div>
											</div>
											<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
												<div
													className="text-xs px-2 py-1 rounded-lg"
													style={{
														background: 'var(--leaves-50)',
														color: 'var(--leaves-700)',
													}}
												>
													Active
												</div>
												{isSelected && (
													<div style={{
														fontSize: '0.875rem',
														color: 'var(--primary-600)',
														fontWeight: '500'
													}}>
														Managing ↓
													</div>
												)}
											</div>
										</div>
									</div>
								);
							})}
					</div>

					{/* Management Section */}
					{showManagement && selectedCalendar && (
						<div style={{ marginTop: '1.5rem' }}>
							<div style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								marginBottom: '1rem'
							}}>
								<h3 style={{
									fontSize: '1rem',
									fontWeight: '600',
									color: 'var(--text-primary)'
								}}>
									Managing {selectedCalendar.year} Calendar
								</h3>
								<button
									onClick={() => {
										setShowManagement(false);
										setSelectedCalendar(null);
									}}
									style={{
										padding: '0.375rem 0.75rem',
										borderRadius: '0.375rem',
										border: '1px solid var(--border-light)',
										backgroundColor: 'white',
										color: 'var(--text-primary)',
										fontSize: '0.75rem',
										fontWeight: '500',
										cursor: 'pointer',
									}}
								>
									Close
								</button>
							</div>

							{/* Holidays Manager */}
							<HolidaysManager
								calendarId={selectedCalendar._id}
								holidays={selectedCalendar.holidays || []}
								onRefetch={refetch}
							/>

							{/* Blocked Periods - Reuse existing component */}
							<div style={{ marginTop: '1.5rem' }}>
								<BlockedPeriodsManager />
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
