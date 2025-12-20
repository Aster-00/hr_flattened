"use client";

import { useEffect, useState } from "react";
import { Shift } from "../../types/shift";
import { getShiftTypes } from "../../api/shiftTypes";

interface Props {
  initialData?: Partial<Shift>;
  onSubmit: (data: any) => Promise<void>;
}

export function ShiftForm({ initialData, onSubmit }: Props) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [shiftType, setShiftType] = useState(
    (initialData?.shiftType as any)?._id ?? initialData?.shiftType ?? ""
  );
  const [startTime, setStartTime] = useState(initialData?.startTime ?? "");
  const [endTime, setEndTime] = useState(initialData?.endTime ?? "");
  const [punchPolicy, setPunchPolicy] = useState(
    initialData?.punchPolicy ?? "FIRST_LAST"
  );
  const [graceIn, setGraceIn] = useState(initialData?.graceInMinutes ?? 0);
  const [graceOut, setGraceOut] = useState(initialData?.graceOutMinutes ?? 0);
  const [requiresOvertimeApproval, setRequiresOvertimeApproval] =
    useState(initialData?.requiresApprovalForOvertime ?? false);

  const [shiftTypes, setShiftTypes] = useState<any[]>([]);

  useEffect(() => {
    getShiftTypes().then(setShiftTypes);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await onSubmit({
      name,
      shiftType,
      startTime,
      endTime,
      punchPolicy,
      graceInMinutes: graceIn,
      graceOutMinutes: graceOut,
      requiresApprovalForOvertime: requiresOvertimeApproval,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Shift Name
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </label>

      <br />

      <label>
        Shift Type
        <select
          value={shiftType}
          onChange={e => setShiftType(e.target.value)}
          required
        >
          <option value="">Select shift type</option>
          {shiftTypes.map(t => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <br />

      <label>
        Start Time
        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          required
        />
      </label>

      <br />

      <label>
        End Time
        <input
          type="time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          required
        />
      </label>

      <br />

      <label>
        Punch Policy
        <select
          value={punchPolicy}
          onChange={e => setPunchPolicy(e.target.value)}
        >
          <option value="FIRST_LAST">First In – Last Out</option>
          <option value="ALL_PUNCHES">All Punches</option>
        </select>
      </label>

      <br />

      <label>
        Grace In (minutes)
        <input
          type="number"
          value={graceIn}
          onChange={e => setGraceIn(+e.target.value)}
          min={0}
        />
      </label>

      <br />

      <label>
        Grace Out (minutes)
        <input
          type="number"
          value={graceOut}
          onChange={e => setGraceOut(+e.target.value)}
          min={0}
        />
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          checked={requiresOvertimeApproval}
          onChange={e => setRequiresOvertimeApproval(e.target.checked)}
        />
        Requires overtime approval
      </label>

      <br />

      <button type="submit">Save Shift</button>
    </form>
  );
}
