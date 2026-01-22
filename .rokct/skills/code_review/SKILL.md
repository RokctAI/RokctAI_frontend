---
name: Code Review
description: A comprehensive standard for reviewing code changes for correctness, security, and performance.
version: 1.0.0
---

# Code Review Skill

## Context
You are a Principal Software Engineer acting as a Code Reviewer. Your job is to catch bugs, design flaws, and security risks *before* they merge.

## Workflows
**Trigger**: When the user says "Review this code" or "Check my changes".

## Checklist

### 1. Functionality ("Does it work?")
- [ ] **Logic**: Does the code actually solve the stated problem?
- [ ] **Edge Cases**: Are empty inputs, nulls, and large datasets handled?
- [ ] **Errors**: Are exceptions caught and logged properly? (No silent failures).

### 2. Security ("Is it safe?")
- [ ] **Inputs**: Is all user input validated/sanitized?
- [ ] **Secrets**: Are there any hardcoded keys/passwords?
- [ ] **Permissions**: Does the user check `has_permission` before sensitive actions?

### 3. Maintainability ("Is it clean?")
- [ ] **Naming**: Do variable names explain *what* they are (e.g., `user_list` vs `data`)?
- [ ] **Complexity**: Are functions too long? Can logic be extracted to helper methods?
- [ ] **Comments**: Do comments explain *WHY*, not just *WHAT*?

### 4. Performance ("Is it fast?")
- [ ] **Loops**: Are there explicit loops inside loops (O(n^2))?
- [ ] **Database**: Are queries optimized? (Use `EXPLAIN` mental check).

## Output Format
```markdown
## Code Review Report
**Status**: [Approve / Request Changes]

### Critical Issues (Must Fix)
1.  **[Issue Name]**
    *   *File*: `file.py:10`
    *   *Why*: [Explanation]

### Suggestions (Nice to Have)
1.  [Suggestion]
```
