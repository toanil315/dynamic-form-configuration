import {
  ConditionOperator,
  FieldConfig,
  evaluateFieldVisibility,
} from "./eval-field";

const fieldConfigs: FieldConfig[] = [
  {
    name: "fcm_otd_optional",
    label: "FCM(OTD) - Optional",
    type: "text",
    conditions: [
      {
        id: "isUSCountry",
        field: "country",
        operator: ConditionOperator.Equals,
        value: "US",
      },
      {
        id: "isNotBCO",
        field: "type",
        operator: ConditionOperator.NotEquals,
        value: "BCO",
      },
    ],
    visibilityLogic: ["isUSCountry", "isNotBCO", "AND"],
  },
  {
    name: "fcm_otd_required",
    label: "FCM(OTD) - Required",
    type: "text",
    conditions: [
      {
        id: "isUSCountry",
        field: "country",
        operator: ConditionOperator.Equals,
        value: "US",
      },
      {
        id: "isBCO",
        field: "type",
        operator: ConditionOperator.Equals,
        value: "BCO",
      },
    ],
    visibilityLogic: ["isUSCountry", "isBCO", "AND"],
  },
  {
    name: "showForAsiaNonBCO",
    label: "Special Rule for VN or TH, but not BCO",
    type: "text",
    conditions: [
      {
        id: "isVN",
        field: "country",
        operator: ConditionOperator.Equals,
        value: "VN",
      },
      {
        id: "isTH",
        field: "country",
        operator: ConditionOperator.Equals,
        value: "TH",
      },
      {
        id: "isNotBCO",
        field: "type",
        operator: ConditionOperator.NotEquals,
        value: "BCO",
      },
    ],
    visibilityLogic: ["isVN", "isTH", "OR", "isNotBCO", "AND"], // (isVN OR isTH) AND isNotBCO
  },
  {
    name: "fallbackField",
    label: "Default Field for Others",
    type: "text",
    conditions: [
      {
        id: "isUSCountry",
        field: "country",
        operator: ConditionOperator.Equals,
        value: "US",
      },
      {
        id: "isVN",
        field: "country",
        operator: ConditionOperator.Equals,
        value: "VN",
      },
      {
        id: "isTH",
        field: "country",
        operator: ConditionOperator.Equals,
        value: "TH",
      },
    ],
    visibilityLogic: ["isUSCountry", "isVN", "OR", "isTH", "OR", "NOT"], // NOT (isUS OR isVN OR isTH)
  },
];

const contextWithUSAndBCO = {
  id: 1,
  country: "US",
  type: "BCO",
};

const contextWithUSAndNonBCO = {
  id: 1,
  country: "US",
  type: "NBCO",
};

const contextWithVN = {
  id: 1,
  country: "VN",
  type: "CUSTOMER",
};

const contextWithTH_BCO = {
  id: 1,
  country: "TH",
  type: "BCO",
};

const contextWithAU = {
  id: 1,
  country: "AU",
  type: "OTHER",
};

const allContexts = [
  { label: "US + BCO", context: contextWithUSAndBCO },
  { label: "US + Non-BCO", context: contextWithUSAndNonBCO },
  { label: "VN + Customer", context: contextWithVN },
  { label: "TH + BCO", context: contextWithTH_BCO },
  { label: "AU (fallback)", context: contextWithAU },
];

for (const { label, context } of allContexts) {
  console.log(`\n--- Context: ${label} ---`);
  console.table(
    fieldConfigs.map((config) => ({
      name: config.name,
      visible: evaluateFieldVisibility(context, config),
    }))
  );
}
