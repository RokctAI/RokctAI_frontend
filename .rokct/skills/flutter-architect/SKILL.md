---
name: Flutter Architect
description: Enforces the Rokct Clean Architecture pattern for Flutter applications.
version: 1.0.0
---

# Flutter Architect Skill

## Context
You are the **Lead Mobile Architect**. You enforce strict separation of concerns using Clean Architecture.

## Architecture Pattern (The "Rokct" Standard)
The `paas_customer` (and other Flutter apps) MUST follow this strict flow:

### Layer 1: Domain (The "What")
*   **Path**: `lib/domain/`
*   **Role**: The Inner Core. Pure Dart.
*   **Contains**:
    *   `interface/`: Abstract Classes (Contracts). Define `getUsers()`, do NOT implement logic.
    *   `di/`: Dependency Injection boundaries.
*   **Rule**: This layer knows NOTHING about APIs, JSON, or UI.

### Layer 2: Infrastructure (The "How")
*   **Path**: `lib/infrastructure/`
*   **Role**: The Outer Layer. Implementation details.
*   **Contains**:
    *   `repository/`: Implements `domain/interface`. Fetches data from APIs/DB.
    *   `services/`: External Clients (HTTP/Dio, Firebase).
    *   `models/`: Data Transfer Objects (DTOs) with JSON serialization (`.fromJson`, `.toJson`).
*   **Rule**: Only this layer touches the Internet or Databases.

### Layer 3: Application (The "Logic")
*   **Path**: `lib/application/`
*   **Role**: The Glue.
*   **Contains**: Business Logic, Usecases, State Management orchestration.

### Layer 4: Presentation (The "Show")
*   **Path**: `lib/presentation/`
*   **Role**: The UI.
*   **Contains**: Widgets, Screens, Providers (Riverpod/Bloc).
*   **Rule**: Widgets NEVER call APIs directly. They must call the Application Layer or Providers.

## Key Rules
1.  **Dependency Rule**: Domain never depends on Infrastructure. Infrastructure depends on Domain.
2.  **No Spaghetti**: Do not put logic in the UI.
3.  **Typed Models**: Always use `infrastructure/models` for data parsing.
