# SOP: Workspace Handshake (Session Start)

**Trigger**: You are starting a session or waking up in a specific repo.

## Procedure
1.  **Identity Check**: (Implicit) You are a Local Agent (because you have this file).
2.  **Discovery Scan**:
    *   Check `../.rokct` (Parent).
    *   Check `../../.rokct` (Grandparent).
    *   Check `../../../.rokct` (Great-Grandparent).
3.  **Branch Logic**:
    *   **IF FOUND** (e.g. at `../.rokct`):
        *   **Mode**: `[WORKSPACE DETECTED]`
        *   **Log**: Open `../.rokct/active_session.txt`.
        *   **Action**: Append your log entry there.
        *   **Note**: "Logging to Global Workspace Buffer."
    *   **IF NOT FOUND**:
        *   **Mode**: `[ISOLATED]`
        *   **Log**: Open `.rokct/sessions/YYYY-MM-DD_Task.md`.
        *   **Note**: "No Workspace found. Logging locally."

## Security
*   Do NOT scan outside your drive.
*   Do NOT write to parents if you lack permission.
