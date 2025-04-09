import get from "lodash/get";

export enum ConditionOperator {
  Equals = "equals",
  NotEquals = "not_equals",
  GreaterThan = "greater_than",
  LessThan = "less_than",
  GreaterOrEqual = "greater_or_equal",
  LessOrEqual = "less_or_equal",
  Includes = "includes",
  NotIncludes = "not_includes",
}

interface Condition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: any;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: string;
  conditions: Condition[];
  // for condition statement structure, I'm using RPN (Reverse Polish Notation).
  visibilityLogic: string[];
}

function evaluateCondition(
  context: Record<string, string | number | unknown[]>,
  cond: Condition
) {
  const actual = get(context, cond.field);
  const expected = cond.value;

  switch (cond.operator) {
    case ConditionOperator.Equals:
      return actual === expected;
    case ConditionOperator.NotEquals:
      return actual !== expected;
    case ConditionOperator.GreaterThan:
      return actual > expected;
    case ConditionOperator.LessThan:
      return actual < expected;
    case ConditionOperator.GreaterOrEqual:
      return actual >= expected;
    case ConditionOperator.LessOrEqual:
      return actual <= expected;
    case ConditionOperator.Includes:
      return Array.isArray(actual) && actual.includes(expected);
    case ConditionOperator.NotIncludes:
      return Array.isArray(actual) && !actual.includes(expected);
  }
}

export function evaluateFieldVisibility(
  context: Record<string, string | number | unknown[]>,
  field: FieldConfig
): boolean {
  const { conditions, visibilityLogic } = field;

  const conditionValuesMap = new Map<string, boolean>();
  for (const condition of conditions) {
    conditionValuesMap.set(condition.id, evaluateCondition(context, condition));
  }

  const stack: boolean[] = [];

  for (const token of visibilityLogic) {
    // If token is condition operator, pull 2 item from stack and compute, then push back to stack.
    if (token === "AND" || token === "OR") {
      const firstCondition = stack.pop();
      const secondCondition = stack.pop();

      if (secondCondition === undefined || firstCondition === undefined) {
        console.warn("Invalid logic stack", stack);
        return false;
      }

      stack.push(
        token === "AND"
          ? firstCondition && secondCondition
          : firstCondition || secondCondition
      );
    } else if (token === "NOT") {
      const firstCondition = stack.pop();

      if (firstCondition === undefined) {
        console.warn("Invalid logic stack", stack);
        return false;
      }

      stack.push(!firstCondition);
    } else {
      // If token is id of condition, push away to stack
      if (!conditionValuesMap.has(token)) stack.push(false);
      stack.push(conditionValuesMap.get(token)!);
    }
  }

  return stack.pop() ?? true;
}
