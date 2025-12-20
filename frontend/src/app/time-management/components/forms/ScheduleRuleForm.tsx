"use client";

import { useEffect, useState } from "react";

type ScheduleType = "WEEKLY" | "CYCLE" | "ALTERNATE";
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

interface Props {
  initialData?: {
    name: string;
    pattern: string;
    isActive: boolean;
  };

  onSubmit: (data: {
    name: string;
    pattern: string;
    isActive: boolean;
  }) => Promise<void>;

  disabled?: boolean;
}

export default function ScheduleRuleForm({
  initialData,
  onSubmit,
  disabled = false,
}: Props) {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [type, setType] = useState<ScheduleType>("WEEKLY");

  const [weeklyDays, setWeeklyDays] = useState<string[]>([]);
  const [onDays, setOnDays] = useState(5);
  const [offDays, setOffDays] = useState(2);
  const [weekA, setWeekA] = useState<string[]>([]);
  const [weekB, setWeekB] = useState<string[]>([]);

  useEffect(() => {
    if (!initialData) return;

    setName(initialData.name);
    setIsActive(initialData.isActive);

    const pattern = initialData.pattern;

    if (pattern.startsWith("WEEKLY:")) {
      setType("WEEKLY");
      setWeeklyDays(pattern.replace("WEEKLY:", "").split(","));
    }

    if (pattern.startsWith("CYCLE:")) {
      setType("CYCLE");
      const [on, off] = pattern
        .replace("CYCLE:", "")
        .split("_")
        .map(v => parseInt(v.replace(/\D/g, "")));

      setOnDays(on);
      setOffDays(off);
    }

    if (pattern.startsWith("ALTERNATE:")) {
      setType("ALTERNATE");
      const [, a, b] = pattern.split(":");
      setWeekA(a.replace("WEEK_A:", "").split(","));
      setWeekB(b.replace("WEEK_B:", "").split(","));
    }
  }, [initialData]);

  function toggleDay(list: string[], setList: Function, day: string) {
    if (disabled) return;
    setList(list.includes(day) ? list.filter(d => d !== day) : [...list, day]);
  }

  function buildPattern(): string {
    switch (type) {
      case "WEEKLY":
        return `WEEKLY:${weeklyDays.join(",")}`;
      case "CYCLE":
        return `CYCLE:${onDays}ON_${offDays}OFF`;
      case "ALTERNATE":
        return `ALTERNATE:WEEK_A:${weekA.join(",")}|WEEK_B:${weekB.join(",")}`;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;

    await onSubmit({
      name,
      pattern: buildPattern(),
      isActive,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Rule Name
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          disabled={disabled}
        />
      </label>

      <br />

      <label>
        Schedule Type
        <select
          value={type}
          onChange={e => setType(e.target.value as ScheduleType)}
          disabled={disabled}
        >
          <option value="WEEKLY">Fixed Weekly</option>
          <option value="CYCLE">Rotational</option>
          <option value="ALTERNATE">Alternating Weeks</option>
        </select>
      </label>

      <br />

      {type === "WEEKLY" &&
        DAYS.map(d => (
          <label key={d}>
            <input
              type="checkbox"
              checked={weeklyDays.includes(d)}
              onChange={() => toggleDay(weeklyDays, setWeeklyDays, d)}
              disabled={disabled}
            />
            {d}
          </label>
        ))}

      {type === "CYCLE" && (
        <>
          <input
            type="number"
            value={onDays}
            onChange={e => setOnDays(+e.target.value)}
            disabled={disabled}
          />
          <input
            type="number"
            value={offDays}
            onChange={e => setOffDays(+e.target.value)}
            disabled={disabled}
          />
        </>
      )}

      {type === "ALTERNATE" && (
        <>
          <p>Week A</p>
          {DAYS.map(d => (
            <label key={d}>
              <input
                type="checkbox"
                checked={weekA.includes(d)}
                onChange={() => toggleDay(weekA, setWeekA, d)}
                disabled={disabled}
              />
              {d}
            </label>
          ))}

          <p>Week B</p>
          {DAYS.map(d => (
            <label key={d}>
              <input
                type="checkbox"
                checked={weekB.includes(d)}
                onChange={() => toggleDay(weekB, setWeekB, d)}
                disabled={disabled}
              />
              {d}
            </label>
          ))}
        </>
      )}

      <p>Generated Pattern: {buildPattern()}</p>

      <label>
        <input
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
          disabled={disabled}
        />
        Active
      </label>

      <br />

      <button disabled={disabled}>Save</button>
    </form>
  );
}
