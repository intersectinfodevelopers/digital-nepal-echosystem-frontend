export interface EligibilityRule {
  id: string;
  ruleName: string;
  benefitType: string;
  priority: number;
  isActive: boolean;
}


export type ConditionExpression = {
  field: string;
  operator: string;
  value: unknown;
  and?: ConditionExpression;
};
