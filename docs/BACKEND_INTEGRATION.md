# APIChange Radar — Backend Integration Reference

> **Integration Scope:** Verified contract between the APIChange Radar Backend (`http://localhost:5001`) and the Admin Portal Frontend (`http://localhost:3000`).  
> **Source Verification:** Directly verified against backend route handlers, middleware, services, and models in `/Users/poojasd/Desktop/Ptojects/APIChange_radar_backend`.  
> **Initial Integration Focus:** Authentication & User Profile (`/api/auth/*`).

---

## 1. Global API Conventions & Protocol

| Parameter | Configuration |
|---|---|
| **Base URL** | `http://localhost:5001` (configured via `VITE_API_BASE_URL` in frontend `.env`) |
| **Content-Type** | `application/json` (requests & responses) |
| **Authentication Scheme** | Bearer Token via standard HTTP header: `Authorization: Bearer <token>` |
| **Token Format** | Signed JSON Web Token (JWT) with standard claims (`userId`, `email`, `role`) |
| **Account Model** | **Individual user accounts only**. No multi-tenant organizations or cross-user permissions. |
| **Data Isolation & IDOR** | All private resources are strictly scoped to the authenticated `req.userId`. Attempting to access or modify a resource owned by another user consistently returns **`404 Not Found`** to prevent enumeration. |

### Standard Error Response Shape
All non-2xx responses from the backend follow a uniform structure:

```json
{
  "error": "BadRequest | Unauthorized | Forbidden | NotFound | Conflict | ServiceUnavailable | Internal Server Error",
  "message": "Human-readable description of the error"
}
```

---

## 2. Authentication & User Profile Endpoints (Stage 1)

These are the primary endpoints required for initial frontend integration.

### 2.1 User Registration

Registers a new individual developer account and returns an access token.

- **HTTP Method & URL:** `POST /api/auth/register`
- **Authentication Required:** No (Public)
- **Status:** Implemented & Available

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "Alice Developer",
  "email": "alice@example.com",
  "password": "StrongPassword123!"
}
```

#### Field Validation Rules
| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | String | Yes | Trimmed length between 2 and 50 characters |
| `email` | String | Yes | Valid email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), normalized to lowercase |
| `password` | String | Yes | Minimum 8 characters |

#### Successful Response (`201 Created`)
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "6718d1a2b3c4d5e6f7a8b9c0",
    "name": "Alice Developer",
    "email": "alice@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-10-23T10:00:00.000Z",
    "updatedAt": "2026-10-23T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
- **`400 Bad Request`**:
  ```json
  { "error": "BadRequest", "message": "Name is required and must be between 2 and 50 characters" }
  ```
  ```json
  { "error": "BadRequest", "message": "A valid email address is required" }
  ```
  ```json
  { "error": "BadRequest", "message": "Password is required and must be at least 8 characters long" }
  ```
- **`409 Conflict`**:
  ```json
  { "error": "Conflict", "message": "Email is already registered" }
  ```
- **`503 Service Unavailable`**:
  ```json
  { "error": "ServiceUnavailable", "message": "Database connection is unavailable" }
  ```

---

### 2.2 User Login

Authenticates user credentials and returns a JWT access token.

- **HTTP Method & URL:** `POST /api/auth/login`
- **Authentication Required:** No (Public)
- **Status:** Implemented & Available

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "alice@example.com",
  "password": "StrongPassword123!"
}
```

#### Field Validation Rules
| Field | Type | Required | Constraints |
|---|---|---|---|
| `email` | String | Yes | Non-empty string, normalized to lowercase |
| `password` | String | Yes | Non-empty string |

#### Successful Response (`200 OK`)
```json
{
  "message": "Login successful",
  "user": {
    "id": "6718d1a2b3c4d5e6f7a8b9c0",
    "name": "Alice Developer",
    "email": "alice@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-10-23T10:00:00.000Z",
    "updatedAt": "2026-10-23T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
- **`400 Bad Request`**:
  ```json
  { "error": "BadRequest", "message": "Email and password are required" }
  ```
- **`401 Unauthorized`** *(Generic message to prevent user enumeration)*:
  ```json
  { "error": "Unauthorized", "message": "Invalid email or password" }
  ```
- **`503 Service Unavailable`**:
  ```json
  { "error": "ServiceUnavailable", "message": "Database connection is unavailable" }
  ```

---

### 2.3 Get Current User Profile (`me`)

Retrieves the profile of the currently authenticated user. Used on app startup to rehydrate authentication state from a stored token.

- **HTTP Method & URL:** `GET /api/auth/me`
- **Authentication Required:** Yes (`Authorization: Bearer <token>`)
- **Status:** Implemented & Available

#### Request Headers
```http
Authorization: Bearer <token>
```

#### Successful Response (`200 OK`)
```json
{
  "user": {
    "id": "6718d1a2b3c4d5e6f7a8b9c0",
    "name": "Alice Developer",
    "email": "alice@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-10-23T10:00:00.000Z",
    "updatedAt": "2026-10-23T10:00:00.000Z"
  }
}
```

#### Error Responses
- **`401 Unauthorized`** *(No token provided)*:
  ```json
  { "error": "Unauthorized", "message": "Authentication required. No token provided." }
  ```
- **`401 Unauthorized`** *(Malformed header)*:
  ```json
  { "error": "Unauthorized", "message": "Invalid authorization header format. Expected Bearer <token>" }
  ```
- **`401 Unauthorized`** *(Token expired)*:
  ```json
  { "error": "Unauthorized", "message": "Authentication token has expired" }
  ```
- **`401 Unauthorized`** *(Invalid signature / malformed token)*:
  ```json
  { "error": "Unauthorized", "message": "Invalid or malformed authentication token" }
  ```
- **`401 Unauthorized`** *(Account missing or deactivated)*:
  ```json
  { "error": "Unauthorized", "message": "User account not found" }
  ```
  ```json
  { "error": "Unauthorized", "message": "User account has been deactivated" }
  ```
- **`503 Service Unavailable`**:
  ```json
  { "error": "ServiceUnavailable", "message": "Database connection is unavailable" }
  ```

---

### 2.4 User Logout

Confirms logout. Because JWTs are stateless on the backend, the client must discard the token from memory / storage.

- **HTTP Method & URL:** `POST /api/auth/logout`
- **Authentication Required:** No
- **Status:** Implemented & Available

#### Successful Response (`200 OK`)
```json
{
  "message": "Logged out successfully. Please discard the authorization token on the client."
}
```

---

## 3. Backend Health Probe Endpoint

- **HTTP Method & URL:** `GET /api/health`
- **Authentication Required:** No (Public)
- **Status:** Implemented & Available

#### Successful Response (`200 OK`)
```json
{
  "status": "ok",
  "message": "APIChange Radar service is running",
  "timestamp": "2026-10-23T10:00:00.000Z",
  "uptime": 124,
  "environment": "development"
}
```

---

## 4. Complete Backend Endpoint Map (For Subsequent Stages)

All remaining routes have been inspected in the backend codebase for future stage implementation:

### 4.1 Endpoint Management (`/api/endpoints`) — Protected
| Method | Path | Description | Key Body / Query Params |
|---|---|---|---|
| `GET` | `/api/endpoints` | Paginated list of user's endpoints | `page` (int, default 1), `limit` (int 1-100, default 20), `isActive` ('true'\|'false') |
| `GET` | `/api/endpoints/:id` | Single endpoint details & latest check | ID parameter (Mongo ObjectId). Returns 404 if owned by another user. |
| `POST` | `/api/endpoints` | Register monitored endpoint (SSRF validated) | Body: `{ name: string, url: string, method?: string, isActive?: boolean }` |
| `PATCH` | `/api/endpoints/:id` | Update endpoint settings | Body: `{ name?: string, isActive?: boolean }` (only allowed update fields) |

### 4.2 Check History & Execution (`/api/checks`) — Protected
| Method | Path | Description | Key Body / Query Params |
|---|---|---|---|
| `POST` | `/api/checks/mock-product` | Trigger immediate contract check on demo API | Body: `{ scenario?: string, delay?: number, timeoutMs?: number }` |
| `GET` | `/api/checks/history` | Paginated check audit logs | `page` (int, default 1), `limit` (int 1-100, default 20) |
| `GET` | `/api/checks/history/latest`| Most recent check run for user | None. Returns 404 if no check runs exist yet. |

### 4.3 Incident Management (`/api/incidents`) — Protected
| Method | Path | Description | Key Body / Query Params |
|---|---|---|---|
| `GET` | `/api/incidents` | List user's incidents sorted by latest activity | `status` ('open'\|'resolved'), `page`, `limit` |
| `GET` | `/api/incidents/:id` | Single incident details | ID parameter. Returns 404 if not found or not owned. |

### 4.4 Status Page Management (`/api/status-page`) — Protected
| Method | Path | Description | Key Body / Query Params |
|---|---|---|---|
| `POST` | `/api/status-page` | Create initial status page (unpublished) | Body: `{ title?: string, description?: string }` (409 if exists) |
| `GET` | `/api/status-page/me` | Fetch user's status page config | None. Returns 404 if not configured yet. |
| `PATCH` | `/api/status-page/me` | Update title, description, or publishing | Body: `{ title?: string, description?: string, isPublished?: boolean }` |
| `PUT` | `/api/status-page/me/services` | Select active endpoints to publish | Body: `{ endpointIds: string[] }` (all must be owned & active) |
| `POST` | `/api/status-page/me/regenerate-slug` | Regenerate public URL slug | None. Immediately invalidates old public link. |

### 4.5 Public Status API (`/api/public/status`) — Public
| Method | Path | Description | Key Features |
|---|---|---|---|
| `GET` | `/api/public/status/:slug` | Public read-only status for published page | Rate-limited (60 req/min/IP), 30s cache headers, returns aggregate status & sanitized 24h uptime. Returns 404 if unpublished. |

---

## 5. Frontend Integration Architecture Guidelines

### Token Lifecycle & Storage
1. **Token In-Memory & Secure Storage:**
   - On successful `login` or `register`, store the returned `token` in client state and persist it to `sessionStorage` or `localStorage`.
   - Update `setAuthTokenGetter(() => token)` in `src/lib/api-client.js`.
2. **Rehydration on Application Boot:**
   - When the frontend loads, if a token exists in storage, call `GET /api/auth/me`.
   - If `200 OK`, set authenticated user state.
   - If `401 Unauthorized` (e.g. token expired), remove the stored token and redirect to `/login`.
3. **Automatic 401 Interceptor:**
   - In `src/lib/api-client.js`, on receiving a `401 Unauthorized` response with message `"Authentication token has expired"` or `"Authentication required. No token provided."`, clear the stored token and dispatch a session timeout event.

### Error Handling & User Feedback
- Display backend error messages (`err.message`) in MUI `<Alert severity="error">` components.
- For form validation failures (`400 Bad Request`), render error feedback adjacent to the input fields.
- For email conflicts (`409 Conflict`), alert the user that the email is already in use and link directly to `/login`.
