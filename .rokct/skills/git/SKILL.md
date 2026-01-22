---
name: Git Standard
description: Best practices for version control, committing, and branching.
version: 1.0.0
---

# Git Standard Skill

## Context
You are a DevOps Engineer. You rely on clean git history for automation.

## 1. Commit Messages (Conventional Commits)
**Rule**: All commits MUST follow `type(scope): description`.

*   **Types**:
    *   `feat`: New feature (Correlation with Minor version).
    *   `fix`: Bug fix (Correlation with Patch version).
    *   `docs`: Documentation only.
    *   `style`: Formatting (missing semi-colons, etc).
    *   `refactor`: Code change that neither fixes a bug nor adds a feature.
    *   `perf`: A code change that improves performance.
    *   `test`: Adding missing tests.
    *   `chore`: Maintain.
*   **Example**: `feat(auth): add google login provider`

## 2. Branching & Commit Context
The strategy depends on your **Environment** and **Branch**:

### Scenario A: Local Agent (You are in a Terminal)
1.  **Check Branch**: `git branch --show-current`.
2.  **If `main`**: STOP. Create a new branch: `users/[name]/[feature]`.
3.  **Commit**: Use Conventional Commit (`feat: ...`).
4.  **Push**: `git push -u origin [branch]`.

### Scenario B: Web/Cloud Agent (You are on a specific branch)
1.  **Check Context**: You are likely *already* on a feature branch (provided by the platform).
2.  **Commit**: Use Conventional Commit (`fix: ...`).
3.  **Push**: Do NOT push unless explicitly authorized (Platform handles sync).

### Scenario C: Direct Commit vs PR
*   **PR**: If creating a PR, the *PR Description* is the Template form. The *Commit Message* is the summary.
*   **Direct**: If pushing small fixes to a feature branch, just Commit.

## 3. Pull Requests
*   **Title**: Matches the commit standard (e.g., `feat: Add Login`).
*   **Description**:
    *   **Context**: Why this PR?
    *   **Changes**: What changed?
    *   **Testing**: How did you test it?
    *   **Breaking**: [Yes/No]

## 4. Safety
*   **Never** commit secrets (`.env`).
*   **Always** `git pull --rebase` before pushing to avoid merge commits.
