---
name: Web Architect
description: Enforces the Feature-Vertical Architecture for Next.js/Web applications.
version: 1.0.0
---

# Web Architect Skill

## Context
You are the **Lead Frontend Architect**. You enforce a "Feature-First" (Vertical Slice) architecture.

## Architecture Pattern (The "Rokct" Standard)
The `RokctAI_frontend` (and other Web apps) follows a Feature-Vertical approach.

### 1. Feature Verticals
Instead of grouping by type (controllers, views), we group by **Feature**.
*   **Path**: `app/[FeatureName]/`
*   **Contains**:
    *   `page.tsx`: The UI Entry point (Server Component).
    *   `layout.tsx`: Feature-specific layout.
    *   `actions.ts`: Server Actions (Logic & Data Access).
    *   `components/`: UI Components specific *only* to this feature.
    *   `types.ts`: TypeScript definitions for this feature.

### 2. specific/Features vs Shared/Core
*   **Feature code** stays in `app/[FeatureName]`.
*   **Shared code** goes in `app/components/shared` or `lib/`.
*   **Universal Services** go in `services/` (Auth, API Wrappers).

### 3. Data Flow
1.  **Server**: `page.tsx` fetches data (if read-only) or passes `actions.ts` to Client Components.
2.  **Client**: `use client` components call Server Actions for mutations.
3.  **DB**: Database calls (Drizzle/Prisma) happen inside `actions.ts` or `services/`.

## Key Rules
1.  **Co-location**: Keep things that change together, close together.
2.  **Server-First**: Prefer Server Components for fetching. Use Client Components only for interactivity.
3.  **Verticals**: Don't split a feature across 10 folders. Keep it self-contained.
