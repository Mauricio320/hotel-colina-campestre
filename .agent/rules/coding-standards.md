---
description: coding standards and rules for the project
---

# Project Coding Standards

To ensure high-quality, maintainable, and self-documenting code, follow these rules strictly:

## 1. No Comments Policy

- Do NOT add comments to the code (no single-line `//` or multi-line `/* */` comments).
- The code must be self-explanatory. If you feel a comment is needed, it means the code is not clear enough and should be refactored.
- **Exception**: Only use comments if the logic is extremely complex and cannot be reasonably described by a descriptive function name.

## 2. Descriptive Naming

- Use highly descriptive names for variables, functions, and classes.
- All names must be in **English**.
- Function names should clearly state what the function does (e.g., `calculateStayTotalWithTaxes` instead of `calcTotal`).

## 3. Single Responsibility Principle (SRP)

- Every function, component, or class must have one, and only one, reason to change.
- Break down large functions into smaller, specialized functions.
- Ensure each module handles a single piece of functionality.

## 4. Clean Code & Patterns

- Prioritize readability and simplicity.
- Use modern patterns and best practices relevant to the tech stack (React hooks, functional programming, etc.).
- Avoid "magic numbers" or strings; use constants or enums with descriptive names.
