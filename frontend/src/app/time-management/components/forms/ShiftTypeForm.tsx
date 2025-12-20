"use client";

import { useState } from "react";
import { ShiftType } from "../../types/shiftType";

interface Props {
  initialData?: Partial<ShiftType>;
  onSubmit: (data: Partial<ShiftType>) => void;
}

export const ShiftTypeForm = ({ initialData = {}, onSubmit }: Props) => {
  const [name, setName] = useState(initialData.name ?? "");
  const [active, setActive] = useState(initialData.active ?? true);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, active });
      }}
    >
      <input
        placeholder="Shift type name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <label>
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Active
      </label>

      <button type="submit">Save</button>
    </form>
  );
};
