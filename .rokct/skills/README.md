# Rokct Skills

This directory follows the **Anthropic Skills Standard** (`anthropics/skills`).
Each folder contains a self-contained capability for the Agent.

## Structure
```text
skills/
└── [skill_name]/
    ├──- **SKILL.md** (required): The main instruction file.
- **resources/** (optional): **Passive** assets (Templates, Checklists).
    - *Example*: `audit_template.md` (A form the Agent copies and fills).
- **scripts/** (optional): **Executable** tools.
    - *Example*: `scan_secrets.py` (A script the Agent runs to find API keys).
```

*Note*: Complex scripts (`scripts/`) are supported but not currently used in the Core Skills.

## How to Use
*   **Agent**: When asked to perform a specific task (e.g., "Security Audit"), look for a matching folder in `skills/` and follow `SKILL.md`.
*   **Humans**: specific skills by copying folders from the standard repo.
