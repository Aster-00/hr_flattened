export type AssignmentExpiryStatus =
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "EXPIRED";

export const getAssignmentExpiryStatus = (
  endDate?: string
): AssignmentExpiryStatus => {
  if (!endDate) return "ACTIVE";

  const today = new Date();
  const end = new Date(endDate);

  const diffDays =
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "EXPIRED";
  if (diffDays <= 7) return "EXPIRING_SOON";
  return "ACTIVE";
};
