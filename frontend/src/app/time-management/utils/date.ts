export const isExpired = (end?: string) =>
  end ? new Date(end) < new Date() : false;

export const isNearExpiry = (end?: string, days = 7) => {
  if (!end) return false;
  const diff = new Date(end).getTime() - Date.now();
  return diff > 0 && diff <= days * 86400000;
};
