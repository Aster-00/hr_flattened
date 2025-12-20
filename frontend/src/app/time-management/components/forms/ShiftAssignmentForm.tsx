"use client";

import { useState, useEffect } from "react";
import { useShifts } from "../../hooks/useShifts";
import { useScheduleRules } from "../../hooks/useScheduleRules";

type Props = {
  onSubmit: (data: {
    shiftId: string;
    startDate: string;
    endDate?: string;
    scheduleRuleId?: string;
  }) => Promise<void>;

  initialData?: {
    shiftId: string;
    startDate: string;
    endDate?: string;
    scheduleRuleId?: string;
  };

  disabled?: boolean;
};

export default function ShiftAssignmentForm({
  onSubmit,
  initialData,
  disabled = false,
}: Props) {
  const { data: shifts, loading: shiftsLoading } = useShifts();
  const { data: scheduleRules } = useScheduleRules();

  const [shiftId, setShiftId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState<string | undefined>();
  const [scheduleRuleId, setScheduleRuleId] = useState<string | undefined>();

  useEffect(() => {
    if (initialData) {
      setShiftId(initialData.shiftId);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
      setScheduleRuleId(initialData.scheduleRuleId);
    }
  }, [initialData]);

  if (shiftsLoading) return <p>Loading shifts…</p>;

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        if (disabled) return;

        await onSubmit({
          shiftId,
          startDate,
          endDate,
          scheduleRuleId,
        });
      }}
    >
      <label>
        Shift
        <select
          value={shiftId}
          onChange={e => setShiftId(e.target.value)}
          required
          disabled={disabled}
        >
          <option value="">Select shift</option>
          {shifts.map(s => (
            <option
              key={s._id as unknown as string}
              value={s._id as unknown as string}
            >
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <br />

      <label>
        Start Date
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          required
          disabled={disabled}
        />
      </label>

      <br />

      <label>
        End Date
        <input
          type="date"
          value={endDate ?? ""}
          onChange={e =>
            setEndDate(e.target.value ? e.target.value : undefined)
          }
          disabled={disabled}
        />
      </label>

      <br />

      <label>
        Schedule Rule
        <select
          value={scheduleRuleId ?? ""}
          onChange={e => setScheduleRuleId(e.target.value || undefined)}
          disabled={disabled}
        >
          <option value="">None</option>
          {scheduleRules.map(r => (
            <option
              key={r._id as unknown as string}
              value={r._id as unknown as string}
            >
              {r.name}
            </option>
          ))}
        </select>
      </label>

      <br />

      <button type="submit" disabled={disabled}>
        Save Assignment
      </button>
    </form>
  );
}
