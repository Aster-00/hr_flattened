// utils/scheduleRulePattern.ts

export function describePattern(pattern: string): string {
  if (pattern.startsWith("WEEKLY")) {
    return (
      "Weekly: " +
      pattern.replace("WEEKLY:", "").replaceAll(",", ", ")
    );
  }

  if (pattern.startsWith("CYCLE")) {
    return (
      "Cycle: " +
      pattern.replace("CYCLE:", "").replace("_", " / ")
    );
  }

  if (pattern.startsWith("ALTERNATE")) {
    return "Alternating weeks";
  }

  return pattern;
}
