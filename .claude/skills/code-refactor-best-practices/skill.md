---
name: code-refactor-best-practices
description: Refactorize and improve code quality by applying SOLID principles, Single Responsibility Principle, DRY (Don't Repeat Yourself), clean naming conventions, and modular design patterns. Use this skill whenever the user wants to clean up code, improve architecture, apply design patterns, refactor for maintainability, reduce code duplication, or make code more readable and testable. Also trigger when the user mentions code quality, technical debt, refactoring, clean code, or improving existing code.
---

# Code Refactoring with Best Practices

This skill helps you refactor and improve existing code by applying professional software engineering principles and best practices.

## When to Use This Skill

- **Code Quality**: User wants to improve code readability, maintainability, or structure
- **Architecture**: User needs to apply design patterns or refactor large functions
- **Technical Debt**: User wants to reduce code duplication or improve organization
- **Standards Compliance**: User wants code to follow industry best practices (SOLID, DRY, SRP)
- **Refactoring**: User mentions "refactor", "clean up", "improve", or "rewrite"

## Best Practices Applied

### 1. **SOLID Principles**
- **S**ingle Responsibility: Each class/function has ONE reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subclasses should be substitutable
- **I**nterface Segregation: Many specific interfaces > one general
- **D**ependency Inversion: Depend on abstractions, not implementations

### 2. **DRY (Don't Repeat Yourself)**
- Extract repeated code into reusable functions/methods
- Use inheritance or composition to share behavior
- Create utility functions for common operations

### 3. **Code Organization**
- Functions: Maximum 20 lines (aim for 10-15)
- Meaningful variable/function names (no `x`, `temp`, `data1`)
- Clear separation of concerns
- One level of abstraction per function

### 4. **Testability**
- Functions should be pure (same input = same output)
- Minimize side effects
- Inject dependencies instead of creating them
- Easy to unit test

### 5. **Readability**
- Clear comments for WHY, not WHAT
- Self-documenting code through names
- Consistent formatting and style
- Logical grouping of related code

## How to Use

### Option 1: Refactor Current File
```bash
claude-code "refactor the current file using best practices:
- Apply SOLID principles
- Single Responsibility Principle
- DRY - eliminate duplication
- Clear, descriptive naming
- Functions under 15 lines
- Add docstrings"
```

### Option 2: Refactor with Specific Focus
```bash
claude-code "refactor focusing on:
- Extracting helper functions
- Improving error handling
- Adding type hints
- Better variable names
- Removing code duplication"
```

### Option 3: Refactor for Pattern
```bash
claude-code "refactor using:
- Factory Pattern for object creation
- Strategy Pattern for algorithm selection
- Dependency Injection for better testability"
```

## Example Refactoring

### Before (Bad)
```python
def process(d):
    total = 0
    for x in d:
        if x > 10:
            total += x * 1.1
    return total
```

### After (Good)
```python
def apply_premium(amount: float, premium_rate: float = 0.1) -> float:
    """Apply premium rate to eligible amounts."""
    return amount * (1 + premium_rate)

def calculate_total_premium(values: list[float], threshold: float = 10) -> float:
    """Calculate total premium for values exceeding threshold.
    
    Args:
        values: List of numeric values to process
        threshold: Minimum value to include in calculation
        
    Returns:
        Sum of premiums applied to eligible values
    """
    eligible_values = [v for v in values if v > threshold]
    return sum(apply_premium(v) for v in eligible_values)
```

## Key Improvements

1. **Clear Names**: `process` → `calculate_total_premium`
2. **Single Responsibility**: Separated premium calculation and filtering
3. **Type Hints**: Added for clarity and IDE support
4. **Docstrings**: Explained what, why, and parameters
5. **DRY**: Created `apply_premium` for reuse
6. **Testability**: Each function is independently testable
7. **Readability**: Business logic is clear at a glance

## Tips for Better Refactoring

- **Extract Methods**: If a function is hard to name, it does too much
- **Use Type Hints**: Makes code self-documenting
- **Write Docstrings**: Explain the WHY, not the HOW
- **Keep Functions Small**: A function that fits on screen is manageable
- **Eliminate Magic Numbers**: Use named constants
- **Test-Driven Refactoring**: Ensure tests pass after changes
- **Incremental Changes**: Refactor one thing at a time

## Common Anti-Patterns to Avoid

❌ **God Objects**: Classes doing too much
❌ **Long Parameters Lists**: Usually a sign of poor design
❌ **Deep Nesting**: More than 2-3 levels is too complex
❌ **Global State**: Makes testing and debugging harder
❌ **Hard-Coded Values**: Should be constants or parameters
❌ **Comments Explaining Bad Code**: Better to write clear code

## Output Format

The refactored code will include:

1. **Refactored Code**: Clean, improved version
2. **Explanation**: What changed and why
3. **Benefits**: How this improves the codebase
4. **Further Improvements**: Optional next steps
5. **Testing Notes**: How to verify the changes work

---

Use this skill whenever you want to level up code quality and maintainability! 🚀