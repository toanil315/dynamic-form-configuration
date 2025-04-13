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

interface Validation {
  id: string;

  // 3 fields below can be omitted only in case combine validation.
  field?: string;
  operator?: ConditionOperator;
  value?: any;

  // Error message to show if validation fails
  message: string;

  // Conditional Statement for combine validation
  logic?: string[];
}

export interface FieldConfig {
  name: string;
  label: string;
  type: string;

  // For condition/validation statement structure, I'm using RPN (Reverse Polish Notation).
  conditions: Condition[];
  visibilityLogic: string[];
  validations?: Validation[];
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
      return (
        (Array.isArray(actual) || typeof actual === "string") &&
        actual.includes(expected)
      );
    case ConditionOperator.NotIncludes:
      console.log(
        cond,
        (Array.isArray(actual) || typeof actual === "string") &&
          !actual.includes(expected)
      );
      return (
        (Array.isArray(actual) || typeof actual === "string") &&
        !actual.includes(expected)
      );
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

  return proceedRpnConditionalStatement(conditionValuesMap, visibilityLogic);
}

export function evaluateFieldValidation(
  context: Record<string, string | number | unknown[]>,
  field: FieldConfig
) {
  const { validations } = field;

  if (!validations || !validations.length) return null;

  const validationValuesMap = new Map<string, boolean>();
  for (const validation of validations) {
    if (validation.logic) continue;

    const validationEval = evaluateCondition(context, validation as Condition);
    // short circuit evaluation
    if (!validationEval && validation.message) return validation.message;

    validationValuesMap.set(validation.id, validationEval);
  }

  for (const validation of validations) {
    if (!validation.logic) continue;

    const complexValidationEval = proceedRpnConditionalStatement(
      validationValuesMap,
      validation.logic
    );

    // short circuit evaluation
    if (!complexValidationEval && validation.message) return validation.message;
  }

  return null;
}

function proceedRpnConditionalStatement(
  conditionalValues: Map<string, boolean>,
  logic: string[]
) {
  const stack: boolean[] = [];

  for (const token of logic) {
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
      if (!conditionalValues.has(token)) stack.push(false);
      stack.push(conditionalValues.get(token)!);
    }
  }

  return stack.pop() ?? true;
}
