# Authentico Frontend - Project Overview

## 1. Introduction

This document provides a comprehensive overview of the **authentico-frontend** codebase. It is designed to help developers and LLMs understand the project structure, architectural decisions, and key patterns used throughout the application.

## 2. Tech Stack

- **Framework**: [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (built on Radix UI)
- **Routing**: [React Router](https://reactrouter.com/) (v6)
- **State Management**: React Context + [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## 3. Project Structure

The project follows a standard Vite + React structure with a feature-based organization inside `src`.

```
src/
├── api/                # API layer configurations and endpoints
│   ├── endpoints/      # API URL definitions (e.g., users.ts, auth.ts)
│   └── client.ts       # Axios instance with interceptors
├── components/         # React components
│   ├── ui/             # Reusable primitive components (Shadcn)
│   ├── layout/         # Layout components (DashboardLayout, etc.)
│   └── shared/         # Shared business components (DataTable, FilterBar)
├── contexts/           # React Context providers (AuthContext, etc.)
├── data/               # Static data and mock definitions
├── hooks/              # Custom React hooks (useForm, useDialog)
├── lib/                # Utility functions and libraries (utils.ts)
├── pages/              # Application pages (Lazy loaded in App.tsx)
│   ├── auth/           # Authentication pages (Login)
│   ├── admin/          # Admin-specific pages
│   ├── issuer/         # Issuer-specific pages
│   └── ...             # Other role-based pages
├── services/           # Business logic and API calls (user.service.ts)
├── types/              # TypeScript type definitions (auth.ts, etc.)
└── App.tsx            # Main application component & Routing definitions
```

## 4. Architectural Patterns

### Authentication & Roles

- **AuthContext**: Manages user session, login/logout, and wallet connection state.
- **Role-Based Access Control (RBAC)**:
  - Users have one or more roles defined in `Roles` enum (ADMIN, ISSUER, STUDENT, etc.).
  - `ProtectedRoute` component restricts access based on `allowedRoles`.
  - `App.tsx` defines the route hierarchy and role protection.
  - `Dashboard.tsx` dynamically renders the correct dashboard based on the user's primary role.

### API & Data Fetching

- **Service Layer Pattern**: All API calls are encapsulated in `services/`.
  - Example: `userService.getAllUsers()` handles the HTTP request, response parsing, and error handling.
- **TanStack Query (Recommended)**: Used for data fetching, caching, and synchronization in newer components.
- **Axios Interceptors**: `api/client.ts` handles global headers (e.g., Content-Type) and response errors (401/403).

### State Management

- **Local State**: `useState` / `useReducer` for component-level state.
- **Global State**: React Context for app-wide state (Auth, Generation status).
- **Server State**: React Query for caching API responses.

### UI Architecture

- **Component Composition**: Uses small, reusable components (mostly from Shadcn).
- **Layouts**: `DashboardLayout` provides the common sidebar/header structure for authenticated pages.
- **Dialogs**: Managed via `useDialog` hook for cleaner open/close state logic.

## 5. Key Workflows

### Adding a New Page

1. Create the page component in `src/pages/`.
2. Add the route in `src/App.tsx`, wrapping it with `ProtectedRoute` if necessary.
3. Update specific role dashboards (e.g., `AdminDashboard`) if it needs to be accessible via navigation.

### Integrating a New API

1. Define the endpoint URL in `src/api/endpoints/`.
2. Create or update a service file in `src/services/` to handle the request.
3. Use the service in your component, preferably wrapping it in a custom hook or React Query.

### Adding a New UI Component

1. If it's a generic UI primitive, check `src/components/ui` or install via Shadcn.
2. If it's business-logic specific, place it in `src/components/shared` or a feature-specific folder.

## 6. Developing with LLMs

When asking an LLM to modify this codebase, providing reference to this document will ensure it respects the existing architecture:

- Prefer using **Services** for API calls.
- Use **Context** for global auth state.
- Follow the **folder structure** for new files.
- Stick to **Shadcn UI** for visual consistency.
