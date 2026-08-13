import { useMemo } from "react";
import type { Citizen } from "@/types/citizen";
import type {
  ConditionExpression,
  EligibilityRule,
} from "@/types/eligibility-rule";

import eligibilityRulesData from "../../data/eligibility-rules.json";

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function evaluateCondition(
  expr: ConditionExpression,
  citizen: Citizen,
  employment: Record<string, unknown> | null,
  disability: Record<string, unknown> | null,
  household: Record<string, unknown> | null,
): boolean {
  const { field, operator, value, and: andExpr } = expr;

  let actualValue: unknown;
  if (field === "age") {
    actualValue = calculateAge(citizen.dob);
  } else if (field.startsWith("employment.")) {
    const subPath = field.replace("employment.", "");
    actualValue = employment ? getValueByPath(employment, subPath) : undefined;
  } else if (field.startsWith("disability.")) {
    const subPath = field.replace("disability.", "");
    actualValue = disability ? getValueByPath(disability, subPath) : undefined;
  } else if (field.startsWith("household.")) {
    const subPath = field.replace("household.", "");
    actualValue = household ? getValueByPath(household, subPath) : undefined;
  } else {
    actualValue = getValueByPath(citizen as unknown as Record<string, unknown>, field);
  }

  let result = false;
  switch (operator) {
    case "=":
      result = String(actualValue) === String(value);
      break;
    case ">=":
      result = Number(actualValue) >= Number(value);
      break;
    case ">":
      result = Number(actualValue) > Number(value);
      break;
    case "<=":
      result = Number(actualValue) <= Number(value);
      break;
    case "<":
      result = Number(actualValue) < Number(value);
      break;
    default:
      result = false;
  }

  if (andExpr) {
    result = result && evaluateCondition(andExpr, citizen, employment, disability, household);
  }

  return result;
}

function getEligibleBenefits(
  citizen: Citizen,
  employmentRec: Record<string, unknown> | null,
  disabilityRec: Record<string, unknown> | null,
  householdRec: Record<string, unknown> | null,
): EligibilityRule[] {
  const rules = eligibilityRulesData as unknown as EligibilityRule[];
  return rules.filter((rule) => {
    if (!rule.isActive) return false;
    const expr = (rule as unknown as Record<string, unknown>).condition_expression as ConditionExpression;
    return evaluateCondition(expr, citizen, employmentRec, disabilityRec, householdRec);
  });
}

export function useEligibility(
  citizen: Citizen,
  employmentRec: Record<string, unknown> | null,
  disabilityRec: Record<string, unknown> | null,
  householdRec: Record<string, unknown> | null,
) {
  const eligible = useMemo(
    () => getEligibleBenefits(citizen, employmentRec, disabilityRec, householdRec),
    [citizen, employmentRec, disabilityRec, householdRec],
  );

  const age = calculateAge(citizen.dob);

  return { eligible, age };
}
