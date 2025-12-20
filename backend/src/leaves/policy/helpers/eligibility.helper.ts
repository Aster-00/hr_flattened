export function checkEligibility(employee: any, policy: any): boolean {
  const rules = policy.eligibility;

  if (!rules) return true;

  if (rules.minTenureMonths) {
    const joined = new Date(employee.joinDate);
    const months =
      (Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (months < rules.minTenureMonths) return false;
  }

  if (rules.positionsAllowed?.length) {
    if (!rules.positionsAllowed.includes(employee.position))
      return false;
  }

  if (rules.contractTypesAllowed?.length) {
    if (!rules.contractTypesAllowed.includes(employee.contractType))
      return false;
  }

  return true;
}
