"use client";

import { useRouter } from "next/navigation";
import ScheduleRuleForm from "../../components/forms/ScheduleRuleForm";
import { createScheduleRule } from "../../api/scheduleRules";

export default function CreateScheduleRulePage() {
  const router = useRouter();

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Create Schedule Rule</h1>

      <ScheduleRuleForm
        onSubmit={async (data) => {
          await createScheduleRule({
            name: data.name,
            pattern: data.pattern,
            active: data.isActive,
          });

          router.push("/time-management/schedule-rules");
        }}
      />
    </div>
  );
}
