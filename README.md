# APIChange Radar — Admin Portal

A private web dashboard for individual users to monitor APIs, detect contract changes and schema drifts, triage incidents, and configure public status pages.

This frontend represents **Stage 4** of the APIChange Radar project. It operates as an independent web client communicating with the backend over REST endpoints.

---

## 🛠 Technology Stack

- **Core & Runtime:** React 18 (JavaScript / JSX), Vite
- **Component System:** Material-UI (MUI v6) with `@emotion/react` & `@emotion/styled`
- **Navigation:** React Router v6
- **State Management & Data Fetching:** TanStack Query v5 (React Query)
- **HTTP Client:** Centralized Axios instance with sanitized interceptors
- **Styling:** Custom MUI Dark Theme (`#030712`, `#0f172a`, `#3b82f6`) + Tailwind CSS, Lucide React icons
- **Forms & Validation:** React Hook Form, Zod
- **Data Visualization:** Recharts
- **Testing:** Vitest, React Testing Library, jsdom
- **Code Quality:** ESLint (flat config for JS/JSX), Prettier

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js:** v18.0.0 or higher (v26+ supported)
- **npm:** v9.0.0 or higher
- **Backend Service:** Running separately at `http://localhost:5001`

### 2. Environment Setup

Copy `.env.example` to create your local `.env` configuration file:

```bash
cp .env.example .env
```

The default environment variable is:

```env
VITE_API_BASE_URL=http://localhost:5001
```

> **Note:** `.env` is ignored by Git to prevent leaking local settings or secrets. Only `.env.example` is committed to version control.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will launch on **`http://localhost:3000`**.

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Starts Vite dev server with hot module replacement on port 3000 |
| `npm run build` | `vite build` | Compiles the production bundle into `dist/` |
| `npm run preview` | `vite preview` | Locally previews the production build on port 3000 |
| `npm run lint` | `eslint .` | Runs ESLint across all JavaScript and JSX files |
| `npm run format` | `prettier --write ...` | Formats source files with Prettier |
| `npm run format:check` | `prettier --check ...` | Verifies code formatting compliance |
| `npm run test` | `vitest run` | Runs all unit and component tests once |
| `npm run test:watch` | `vitest` | Runs Vitest in interactive watch mode |

---

## 🏗 Architecture & Project Structure

```
api-change-radar-admin/
├── public/
│   └── radar-icon.svg
├── src/
│   ├── app/
│   │   ├── App.jsx          # Root React component
│   │   ├── router.jsx       # Route definitions (public & guarded)
│   │   └── providers.jsx    # MUI ThemeProvider, CssBaseline & TanStack Query
│   ├── components/
│   │   ├── common/          # StarterScreen, ProtectedRoute, LoadingSpinner, NotFoundPage
│   │   ├── layout/          # AuthLayout, DashboardLayout (MUI Drawer & App Bar)
│   │   └── ui/              # Button, Card, Badge primitives
│   ├── features/            # Domain-driven feature modules
│   │   ├── auth/            # Sign in and registration views
│   │   ├── dashboard/       # Metrics overview
│   │   ├── endpoints/       # Monitored API endpoints CRUD foundation
│   │   ├── checks/          # Check execution history & diffs foundation
│   │   ├── incidents/       # Incident triage & resolution foundation
│   │   └── status-page/     # Public status page configuration foundation
│   ├── hooks/               # Custom hooks (useHealth, useAuth)
│   ├── lib/
│   │   ├── api-client.js    # Centralized Axios client & interceptors
│   │   ├── env.js           # Zod-validated environment config
│   │   ├── query-client.js  # TanStack Query configuration
│   │   └── utils.js         # Tailwind class merging (cn)
│   ├── services/            # Backend API communication services (health.service.js)
│   ├── styles/
│   │   └── index.css        # Tailwind directives, CSS variables & design tokens
│   ├── test/
│   │   └── setup.js         # Testing library & jsdom setup
│   ├── theme/
│   │   └── theme.js         # MUI custom dark developer tool theme
│   └── main.jsx             # Application DOM mount entry point
├── .env.example             # Safe environment variable template
├── .gitignore               # Strict ignore rules (ignores .env, secrets, node_modules)
├── .prettierrc              # Prettier style settings
├── eslint.config.js         # ESLint 9 flat configuration for JS/JSX
├── jsconfig.json            # Path alias mapping (@/* -> src/*)
├── index.html               # HTML entry point with modern typography
├── package.json             # Dependencies and scripts (React, MUI, Vite)
├── tailwind.config.js       # Tailwind CSS configuration with theme tokens
├── vite.config.js           # Vite configuration with port 3000 & path alias
└── vitest.config.js         # Vitest + jsdom test configuration
```

---

## 🔒 Security & Backend Integration Rules

1. **Centralized HTTP Client:** All requests flow through `src/lib/api-client.js`. Backend URLs are never hardcoded.
2. **Credential Sanitization:** Console logs never print JWT tokens, secrets, or passwords.
3. **Pluggable Auth Storage:** JWT tokens are not dumped into `localStorage` by default; a pluggable token getter is prepared for review during Stage 5 auth implementation.
4. **Architectural Guarding:** Route guarding (`ProtectedRoute`) is implemented for UX flow. Real security is enforced at the backend through JWT signature verification.
5. **Verified Health Probe:** The initial screen tests the verified backend route: `GET /api/health`.

---

## 📦 Repository Separation

This project is prepared for independent version control in a separate repository named `api-change-radar-admin`. It does not contain any backend code or shared repository bindings.
