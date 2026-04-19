# FairGig — Software Design Document

**SOFTEC 2026 Web Dev Competition**  
Version 1.0 | April 2026

---

## 1. Executive Summary

FairGig is a microservice-based web platform that empowers Pakistan's gig economy workers to log, verify, and understand their earnings, and that gives labour advocates a dashboard to identify systemic unfairness at scale.

The system is composed of six independently deployable backend services (five Python FastAPI, one Node.js Express) and a React frontend. Services communicate over REST with JWT-authenticated requests. There is no mandatory Docker requirement; each service starts with a single command.

---

## 2. Goals and Non-Goals
![alt text](image.png)

### Goals

- Enable gig workers to log shifts and upload platform earnings screenshots for third-party verification.
- Detect statistically anomalous deductions or income drops and explain them in plain language.
- Generate a clean, print-ready income certificate that workers can share with landlords or banks.
- Give labour advocates an aggregate view of commission trends, income distribution, and vulnerability patterns — without exposing individual worker data.
- Host an anonymous worker community bulletin board moderated by advocates.

### Non-Goals

- Real-time platform API integration (screenshots are the verification mechanism).
- Mobile native app (the React frontend is mobile-responsive but web-only).
- Payroll or financial product features.
- Handling government or tax compliance.

---

## 3. System Architecture

### 3.1 High-Level Overview

```
Browser (React SPA)
        │
        │ HTTPS / REST + JWT Bearer token
        ▼
┌───────────────────────────────────────────────────────────┐
│                    API Boundary                            │
│                                                           │
│  auth-service     earnings-service    anomaly-service     │
│  (FastAPI :8001)  (FastAPI :8002)     (FastAPI :8003)     │
│                                                           │
│  grievance-service  analytics-service  certificate-service│
│  (Node.js :8004)    (FastAPI :8005)    (FastAPI :8006)    │
└───────────────────────────────────────────────────────────┘
        │                    │                   │
   PostgreSQL            MongoDB              Redis
  (auth, earnings,      (grievances)        (token blocklist)
   analytics)
```

All inter-service communication is synchronous REST. The frontend talks directly to each service (no API gateway required for the competition, but one can be added in production).

### 3.2 Service Decomposition

| Service | Responsibility | Tech |
|---|---|---|
| auth-service | JWT login/register, role management, token refresh | Python FastAPI, PostgreSQL |
| earnings-service | Shift CRUD, CSV import, screenshot upload/reference, verification workflow | Python FastAPI, PostgreSQL |
| anomaly-service | Statistical anomaly detection on earnings history, plain-language explanations | Python FastAPI, NumPy/SciPy |
| grievance-service | Complaint CRUD, freeform tagging, complaint clustering (text similarity), escalation workflow | Node.js, Express, MongoDB |
| analytics-service | Aggregate KPIs for advocate panel, city-wide median for worker dashboard | Python FastAPI, PostgreSQL |
| certificate-service | Generates print-ready HTML income certificate from verified earnings | Python FastAPI, Jinja2 |

---

## 4. Data Models

### 4.1 Auth Service (PostgreSQL)

**users**

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| email | VARCHAR UNIQUE | |
| password_hash | VARCHAR | bcrypt |
| role | ENUM | worker, verifier, advocate |
| city | VARCHAR | Lahore / Karachi / Islamabad |
| platform_category | VARCHAR | ride-hailing, food-delivery, freelance, domestic |
| created_at | TIMESTAMP | |

**refresh_tokens**

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| token_hash | VARCHAR | SHA-256 of token |
| expires_at | TIMESTAMP | |
| revoked | BOOLEAN | |

### 4.2 Earnings Service (PostgreSQL)

**shifts**

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| worker_id | UUID | references auth service user |
| platform | VARCHAR | Bykea, Careem, Foodpanda, etc. |
| shift_date | DATE | |
| hours_worked | DECIMAL(4,2) | |
| gross_earned | DECIMAL(10,2) | PKR |
| platform_deduction | DECIMAL(10,2) | PKR |
| net_received | DECIMAL(10,2) | PKR — derived field, stored for query speed |
| verification_status | ENUM | unverified, verified, disputed, unverifiable |
| verified_by | UUID NULL | verifier user id |
| verified_at | TIMESTAMP NULL | |
| screenshot_path | VARCHAR NULL | file path / object storage key |
| notes | TEXT NULL | |
| created_at | TIMESTAMP | |

Indexes: `(worker_id, shift_date)`, `(platform, shift_date)`, `(worker_id, verification_status)`

### 4.3 Grievance Service (MongoDB)

**complaints** (document schema)

```json
{
  "_id": "ObjectId",
  "worker_id": "UUID string",
  "platform": "Foodpanda",
  "category": "commission_rate_change",
  "description": "Commission jumped from 20% to 28% overnight with no notice",
  "city": "Lahore",
  "status": "open",
  "tags": ["commission", "no-notice", "lahore"],
  "cluster_id": "ObjectId | null",
  "escalated_by": "UUID | null",
  "resolved_at": "ISODate | null",
  "anonymous": true,
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

Text index on `description` and `tags` for similarity clustering.

### 4.4 Analytics Service

The analytics service does not own a database. It runs read-only aggregate queries against the earnings-service PostgreSQL database (separate read-only credentials) and calls the grievance-service REST API for complaint aggregates.

**Anonymisation rule:** any aggregate query that would expose a group smaller than `MIN_GROUP_SIZE` (default: 5) returns `null` for that bucket rather than the actual value. This is enforced at the SQL level using `HAVING COUNT(*) >= $MIN_GROUP_SIZE`.

---

## 5. Feature Design

### 5.1 Earnings Logger

Workers log shifts via a form or bulk CSV upload. The CSV format is documented and validated server-side. On import, each row is inserted as a separate shift record with `verification_status = unverified`.

### 5.2 Screenshot Verification Flow

1. Worker uploads a screenshot via `POST /shifts/{id}/screenshot` on the earnings service.
2. The file is stored in the local filesystem (or S3-compatible object store in production). The `screenshot_path` is recorded on the shift.
3. Verifiers see a queue of shifts with `verification_status = unverified` and an attached screenshot.
4. Verifier reviews and calls `PATCH /shifts/{id}/verify` with one of: `verified`, `disputed`, `unverifiable`, plus optional notes.
5. The worker's profile shows the aggregate count of verified/disputed/unverifiable records.

### 5.3 Anomaly Detection Service

The anomaly service accepts a worker's earnings history via `POST /detect` and returns flagged anomalies. Detection logic:

**Deduction rate anomaly:**
- Compute `deduction_rate = platform_deduction / gross_earned` for each shift.
- Calculate rolling mean and standard deviation over the worker's history (minimum 5 records required).
- Flag any shift where the z-score of `deduction_rate` exceeds `Z_SCORE_THRESHOLD` (default 2.5).

**Income drop anomaly:**
- Aggregate net income by week.
- Flag any week where income dropped more than 30% compared to the 4-week rolling average.

**Sudden deactivation proxy:**
- Flag any gap of 7+ consecutive days with zero shifts following a period of regular activity (5+ shifts/week average).

Each flag includes a z-score (or delta percentage), severity level (`low`, `medium`, `high`), and a plain-language explanation written without jargon.

**The `/detect` endpoint is fully documented and judges can call it directly with a crafted payload.**

### 5.4 Income Analytics Dashboard (Worker View)

- Weekly and monthly earnings charts (net received over time).
- Effective hourly rate: `net_received / hours_worked` trended over time.
- Platform commission rate tracker: `platform_deduction / gross_earned` per platform per month.
- City-wide median comparison: calls `GET /city-median?platform=Bykea&city=Lahore` on the analytics service, which computes the live median from seeded data using `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY net_received/hours_worked)`.

### 5.5 Shareable Income Certificate

A worker requests a certificate via `GET /certificate/{worker_id}?from=2026-01-01&to=2026-03-31`.

The certificate-service calls the earnings-service to fetch verified shifts in the date range, then renders a Jinja2 HTML template. The template uses `@media print` CSS to produce a clean printable layout. Fields shown:

- Worker name and city
- Date range
- Total verified shifts
- Total verified earnings (gross / net)
- Per-platform breakdown
- Certificate generation date and platform signature
- Disclaimer: "Income figures based on worker-logged and third-party-verified records. FairGig does not audit platform systems."

### 5.6 Grievance Board

Workers post complaints anonymously or with their city and platform attached. Advocates can:
- Add or edit tags on complaints.
- Cluster similar complaints: the grievance service uses MongoDB text search to find complaints with high lexical similarity and groups them under a `cluster_id`. Clustering is triggered manually by an advocate or run as a background job every 6 hours.
- Mark complaints as `escalated` or `resolved`.

### 5.7 Advocate Analytics Panel

All figures are aggregated with a minimum group size floor.

- Commission rate trend: average `deduction_rate` per platform per month.
- Income distribution by city zone: histogram of net hourly rates, broken out by platform and city.
- Top complaint categories this week.
- Vulnerability flag: workers whose net income dropped >20% compared to the previous month. The panel shows a count and the workers' city/platform categories (no names or IDs).

---

## 6. Authentication and Authorisation

JWT Bearer tokens. The auth service issues:
- Access token: 60-minute expiry, signed HS256.
- Refresh token: 7-day expiry, stored as a hash in PostgreSQL. Revocable via the blocklist.

Role claims are embedded in the JWT payload (`role: "worker" | "verifier" | "advocate"`). Every service validates the token by calling `GET /auth/verify` on the auth service (with response caching via Redis to avoid per-request round trips).

Endpoint protection matrix:

| Endpoint type | worker | verifier | advocate |
|---|---|---|---|
| Log/view own shifts | ✓ | | |
| Upload screenshot | ✓ | | |
| Review/verify screenshots | | ✓ | |
| View own analytics | ✓ | | |
| View city-wide median | ✓ | | |
| Post grievance | ✓ | | |
| View grievance board | ✓ | ✓ | ✓ |
| Moderate/tag grievances | | | ✓ |
| Advocate analytics panel | | | ✓ |
| Generate own certificate | ✓ | | |

---

## 7. Frontend Architecture

**Framework:** React 18 + Vite  
**Routing:** React Router v6  
**State:** Zustand (lightweight, no Redux overhead)  
**Data fetching:** TanStack Query (caching, background refetch)  
**Charts:** Recharts  
**Styling:** Tailwind CSS  

### 7.1 Route Structure

```
/                    → Landing page (public)
/login               → Login (public)
/register            → Register (public)

/worker/dashboard    → Earnings overview, anomaly alerts (worker)
/worker/shifts       → Shift log + CSV import (worker)
/worker/certificate  → Certificate generator (worker)

/verifier/queue      → Screenshot review queue (verifier)

/advocate/panel      → KPI dashboard, vulnerability flags (advocate)

/community           → Grievance board (all authenticated)
```

### 7.2 Key Design Decisions

- The frontend is split by role. After login, users are routed to their role-specific dashboard automatically.
- All API calls carry the JWT Bearer token from Zustand auth store.
- The city-wide median is fetched in the background and shown as a comparison overlay on the worker's earnings chart — not a separate screen.
- The income certificate page has a dedicated print stylesheet and a "Print / Save as PDF" button that calls `window.print()`.

---

## 8. Non-Functional Requirements

### Performance
- Aggregate analytics queries run against read-only replicas (or the same DB with separate credentials in dev) to avoid blocking write operations.
- City-wide median is cached for 15 minutes in Redis.
- Anomaly detection runs synchronously (median response time < 500ms for up to 365 records).

### Privacy
- Worker names and IDs are never exposed in aggregate endpoints.
- Grievance board posts can be fully anonymous (no worker_id stored in that document).
- Minimum group size of 5 enforced on all analytics aggregates.

### Resilience
- If the anomaly service is unreachable, the worker dashboard degrades gracefully (hides the anomaly section, shows a banner).
- If the analytics service is unreachable, the advocate panel shows the last cached response with a staleness warning.

### Print friendliness
- The income certificate uses `@media print` CSS with: white background, hidden nav/header/footer, A4-optimised margins, and `page-break-inside: avoid` on each earnings section.

---

## 9. Folder Structure (Detailed)

```
fairgig/
│
├── apps/
│   └── frontend/
│       ├── src/
│       │   ├── api/              # Typed API client functions (one file per service)
│       │   ├── components/       # Shared UI components
│       │   │   ├── EarningsChart.tsx
│       │   │   ├── AnomalyAlert.tsx
│       │   │   ├── ShiftTable.tsx
│       │   │   └── CityMedianOverlay.tsx
│       │   ├── pages/
│       │   │   ├── worker/
│       │   │   │   ├── Dashboard.tsx
│       │   │   │   ├── Shifts.tsx
│       │   │   │   └── Certificate.tsx
│       │   │   ├── verifier/
│       │   │   │   └── Queue.tsx
│       │   │   ├── advocate/
│       │   │   │   └── Panel.tsx
│       │   │   └── community/
│       │   │       └── GrievanceBoard.tsx
│       │   ├── store/            # Zustand stores (auth, shifts, grievances)
│       │   └── main.tsx
│       ├── index.html
│       └── vite.config.ts
│
├── services/
│   │
│   ├── auth-service/
│   │   ├── main.py              # FastAPI app entrypoint
│   │   ├── routers/
│   │   │   └── auth.py          # /register, /login, /refresh, /me, /verify
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── security.py          # JWT helpers, password hashing
│   │   ├── database.py          # DB session
│   │   ├── requirements.txt
│   │   ├── .env.example
│   │   └── README.md
│   │
│   ├── earnings-service/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── shifts.py        # CRUD, CSV import, screenshot upload
│   │   │   ├── verification.py  # Verifier endpoints
│   │   │   └── analytics.py     # Worker analytics (personal view)
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── csv_import.py        # CSV parsing + validation
│   │   ├── database.py
│   │   ├── requirements.txt
│   │   ├── .env.example
│   │   └── README.md
│   │
│   ├── anomaly-service/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   └── detect.py        # POST /detect — judges call this directly
│   │   ├── detectors/
│   │   │   ├── deduction_rate.py
│   │   │   ├── income_drop.py
│   │   │   └── deactivation_proxy.py
│   │   ├── schemas.py
│   │   ├── requirements.txt     # numpy, scipy, pandas
│   │   ├── .env.example
│   │   └── README.md
│   │
│   ├── grievance-service/
│   │   ├── src/
│   │   │   ├── app.js           # Express app
│   │   │   ├── routes/
│   │   │   │   └── complaints.js
│   │   │   ├── models/
│   │   │   │   └── Complaint.js  # Mongoose schema
│   │   │   ├── middleware/
│   │   │   │   └── auth.js       # JWT verification via auth-service
│   │   │   └── services/
│   │   │       └── clustering.js # Text-similarity complaint clustering
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── README.md
│   │
│   ├── analytics-service/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── advocate.py      # Aggregate KPIs, vulnerability flags
│   │   │   └── city_median.py   # City-wide median for worker dashboard
│   │   ├── queries.py           # All SQL queries (aggregate only, anon floor enforced)
│   │   ├── schemas.py
│   │   ├── requirements.txt
│   │   ├── .env.example
│   │   └── README.md
│   │
│   └── certificate-service/
│       ├── main.py
│       ├── routers/
│       │   └── certificate.py   # GET /certificate/{worker_id}
│       ├── templates/
│       │   └── certificate.html # Jinja2 + print-friendly CSS
│       ├── schemas.py
│       ├── requirements.txt     # fastapi, jinja2, httpx
│       ├── .env.example
│       └── README.md
│
├── shared/
│   ├── types/
│   │   └── index.ts             # Shift, Worker, Complaint, AnomalyResult types
│   └── api-contracts/
│       ├── fairgig.postman_collection.json
│       └── openapi/
│           ├── auth.yaml
│           ├── earnings.yaml
│           ├── anomaly.yaml
│           ├── grievance.yaml
│           ├── analytics.yaml
│           └── certificate.yaml
│
├── scripts/
│   ├── seed.py                  # Seeds 500 workers + 90 days earnings + 200 grievances
│   └── start-all.sh             # Starts all 6 services + frontend concurrently
│
├── docker-compose.yml           # Optional convenience
└── README.md
```

---

## 10. Technology Stack Summary

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React 18 + Vite | Required by competition. Vite for fast HMR. |
| Frontend state | Zustand | Lightweight, no boilerplate |
| Frontend data | TanStack Query | Caching, background refetch, stale-while-revalidate |
| Charts | Recharts | Composable, accessible, React-native |
| Auth backend | FastAPI (Python) | Required (at least 2 FastAPI services). JWT with PyJWT. |
| Earnings backend | FastAPI (Python) | Required FastAPI service. SQLAlchemy ORM. |
| Anomaly backend | FastAPI (Python) | Required by spec. NumPy/SciPy for stats. |
| Grievance backend | Node.js + Express | Required by spec. Mongoose for MongoDB. |
| Analytics backend | FastAPI (Python) | Required FastAPI service. Read-only aggregate queries. |
| Certificate backend | FastAPI + Jinja2 | HTML template rendering, print CSS. |
| Primary DB | PostgreSQL | ACID, relational earnings data, aggregate queries. |
| Grievance DB | MongoDB | Flexible document schema, text search for clustering. |
| Cache | Redis | Auth token blocklist, analytics cache. |
| Auth | JWT (HS256) | Stateless, role-embedded, short-lived access tokens. |

---

## 11. Risk and Mitigations

| Risk | Mitigation |
|---|---|
| Anomaly service slowness | Results capped at 365 records. NumPy vectorised operations. 500ms SLA. |
| Individual worker data exposed via analytics | `MIN_GROUP_SIZE` floor on all aggregates. Verified in tests. |
| Screenshot abuse (fake screenshots) | Verifiers are human reviewers. Status clearly shown as "community-verified, not platform-audited". |
| City-wide median hardcoded | CI test asserts the median endpoint reads from DB. Seed data is required to start. |
| JWT secret compromise | Secret in `.env`, never committed. Rotation invalidates all sessions via blocklist. |

---

*End of Software Design Document*
