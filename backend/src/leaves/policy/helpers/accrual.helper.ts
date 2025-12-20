import { applyRounding } from './rounding.helper';

export function calculateAccrual(policy: any, lastAccrual: Date) {
  const now = new Date();

  if (policy.accrualMethod === 'monthly') {
    const months =
      (now.getFullYear() - lastAccrual.getFullYear()) * 12 +
      (now.getMonth() - lastAccrual.getMonth());

    const raw = months * policy.monthlyRate;
    return applyRounding(raw, policy.roundingRule);
  }

  if (policy.accrualMethod === 'yearly') {
    const years = now.getFullYear() - lastAccrual.getFullYear();
    const raw = years * policy.yearlyRate;
    return applyRounding(raw, policy.roundingRule);
  }

  return 0;
}
