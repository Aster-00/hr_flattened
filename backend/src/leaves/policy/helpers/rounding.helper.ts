import { RoundingRule } from '../../enums/rounding-rule.enum';

export function applyRounding(value: number, rule: RoundingRule): number {
  switch (rule) {
    case RoundingRule.ROUND:
      return Math.round(value);

    case RoundingRule.ROUND_UP:
      return Math.ceil(value);

    case RoundingRule.ROUND_DOWN:
      return Math.floor(value);

    default:
      return value;
  }
}
