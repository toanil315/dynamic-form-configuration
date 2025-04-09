# 🧩 Dynamic Form Field Visibility (with RPN Logic)

This module allows you to control **form field visibility** dynamically using conditions and **Reverse Polish Notation (RPN)** to express logic between them.

---

## 📦 Features

- ✅ Define conditions based on form context (e.g., user role, location, type)
- 🔄 Support for logical operators like `AND`, `OR`, `NOT` in visibility expressions
- 🔍 Uses **RPN (Reverse Polish Notation)** to express logical relationships clearly
- ✨ Easily extendable to support `required`, `disabled`, or other dynamic attributes
- 🧪 Test-friendly and framework-agnostic

---

## 🏗️ How It Works

You define each field using a `FieldConfig`, which includes:

- A list of **conditions**
- A `visibilityLogic` array using **RPN format**

Then call:

```ts
evaluateFieldVisibility(context, fieldConfig);
```
