"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ScheduleRuleForm from "@/app/time-management/components/forms/ScheduleRuleForm";
import {
  getScheduleRuleById,
  updateScheduleRule,
} from "@/app/time-management/api/scheduleRules";
import { ScheduleRule } from "@/app/time-management/types/ScheduleRule";

export default function EditScheduleRulePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [rule, setRule] = useState<ScheduleRule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getScheduleRuleById(id)
      .then(setRule)
      .catch(() =>
        setError("You do not have permission to edit this schedule rule.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <h1>Edit Schedule Rule</h1>

      {loading && <p>Loading…</p>}
      {error && <p>{error}</p>}

      {rule && (
        <ScheduleRuleForm
          initialData={{
            name: rule.name,
            pattern: rule.pattern,
            isActive: rule.active,
          }}
          disabled={!!error}
          onSubmit={async (data) => {
            await updateScheduleRule(id, {
              name: data.name,
              pattern: data.pattern,
              active: data.isActive,
            });

            router.push("/time-management/schedule-rules");
          }}
        />
      )}
    </div>
  );
}
