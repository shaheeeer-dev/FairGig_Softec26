# FairGig — Gig Worker Income & Rights Platform

> SOFTEC 2026 Web Dev Competition submission.  
> A platform for Pakistan's gig workers to log, verify, and understand their earnings — and for labour advocates to spot systemic unfairness at scale.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [User Personas](#user-personas)
3. [Monorepo Structure](#monorepo-structure)
4. [Services at a Glance](#services-at-a-glance)
5. [Getting Started (all services)](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Inter-Service API Contracts](#inter-service-api-contracts)
8. [Database Choices & Justification](#database-choices--justification)
9. [Seeded Data & City-Wide Median](#seeded-data--city-wide-median)
10. [Running Tests](#running-tests)
11. [Deployment Notes](#deployment-notes)

---

## Project Overview

Pakistan has millions of gig workers — ride-hailing drivers, food delivery riders, freelance designers, domestic workers — who operate across multiple platforms with no unified income record, no payslip, and no recourse when platforms change commission rates overnight.

**FairGig** solves three concrete problems:

| Problem | FairGig solution |
|---|---|
| Workers cannot prove income to landlords or banks | Verifiable income certificates generated from logged and screenshot-verified earnings |
| Workers cannot tell if platform deductions are fair | Anomaly detection service flags statistically unusual deductions with plain-language explanations |
| Advocates cannot see systemic patterns | Aggregate analytics dashboard — commission trends, income distribution by city zone, vulnerability flags |

---

## User Personas

### Gig Worker
Logs shifts, uploads platform earnings screenshots for verification, views personal income analytics, generates a shareable income certificate.

### Verifier
Reviews uploaded screenshots, flags discrepancies, approves or disputes a worker's submitted earnings record. Verification status is shown on the worker's profile.

### Advocate / Analyst
Monitors aggregate trends: commission rate changes across platforms, income volatility by city zone, deactivation complaint clusters, and workers whose income dropped >20% month-on-month (vulnerability flag).

### Worker Community
Anonymous bulletin board. Workers post rate intelligence, platform complaints, and support requests. Advocates moderate and escalate.

---

## Monorepo Structure

```
fairgig/
│
├── apps/
│   └── frontend/                   # React (Vite) — worker, verifier, advocate views
│
├── services/
│   ├── auth-service/               # FastAPI — JWT, roles, token refresh
│   ├── earnings-service/           # FastAPI — shift logs, CSV import, screenshot refs
│   ├── anomaly-service/            # FastAPI — statistical anomaly detection (ML)
│   ├── grievance-service/          # Node.js (Express) — complaints, tagging, escalation
│   ├── analytics-service/          # FastAPI — aggregate KPIs, advocate panel
│   └── certificate-service/        # FastAPI — printable HTML income certificate
│
├── shared/
│   ├── types/                      # Shared TypeScript types (used by frontend + grievance)
│   └── api-contracts/              # Postman collection + OpenAPI specs
│
├── scripts/
│   ├── seed.py                     # Seeds realistic worker, earnings, and grievance data
│   └── start-all.sh                # Convenience: starts all services in parallel
│
├── docker-compose.yml              # Optional convenience — not required by judges
└── README.md
```

---

## Services at a Glance

| Service | Language / Framework | Default Port | Database |
|---|---|---|---|
| auth-service | Python / FastAPI | 8001 | PostgreSQL |
| earnings-service | Python / FastAPI | 8002 | PostgreSQL |
| anomaly-service | Python / FastAPI | 8003 | — (reads via earnings-service API) |
| grievance-service | Node.js / Express | 8004 | MongoDB |
| analytics-service | Python / FastAPI | 8005 | PostgreSQL (read-only aggregates) |
| certificate-service | Python / FastAPI | 8006 | — (reads via earnings-service API) |
| frontend | React / Vite | 5173 | — |

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- MongoDB 7+

### 1. Clone and install

```bash
git clone https://github.com/your-team/fairgig.git
cd fairgig
```

### 2. Set up each service

Every service has its own `README.md` and a single start command.

**Python services (auth, earnings, anomaly, analytics, certificate):**

```bash
cd services/auth-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DB credentials
uvicorn main:app --reload --port 8001
```

**Grievance service (Node.js):**

```bash
cd services/grievance-service
npm install
cp .env.example .env   # fill in MongoDB URI
npm start
```

**Frontend:**

```bash
cd apps/frontend
npm install
cp .env.example .env   # fill in VITE_API_BASE_URL etc.
npm run dev
```

### 3. Seed the database

```bash
cd scripts
python seed.py
```

This inserts ~500 realistic worker records across Lahore, Karachi, and Islamabad with 90 days of earnings history. The city-wide median figures on the worker dashboard are computed live from this seeded data, not hardcoded.

### 4. Start everything at once (convenience)

```bash
bash scripts/start-all.sh
```

---

## Environment Variables

Each service ships with a `.env.example`. Key variables:

```dotenv
# Auth service
DATABASE_URL=postgresql://user:pass@localhost:5432/fairgig_auth
JWT_SECRET=change-me-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Earnings service
DATABASE_URL=postgresql://user:pass@localhost:5432/fairgig_earnings
AUTH_SERVICE_URL=http://localhost:8001
ANOMALY_SERVICE_URL=http://localhost:8003

# Anomaly service
EARNINGS_SERVICE_URL=http://localhost:8002
Z_SCORE_THRESHOLD=2.5          # flag deductions beyond this many std-devs

# Grievance service
MONGODB_URI=mongodb://localhost:27017/fairgig_grievances
AUTH_SERVICE_URL=http://localhost:8001

# Analytics service
DATABASE_URL=postgresql://user:pass@localhost:5432/fairgig_earnings
GRIEVANCE_SERVICE_URL=http://localhost:8004
MIN_GROUP_SIZE=5               # anonymity floor for aggregate queries

# Certificate service
EARNINGS_SERVICE_URL=http://localhost:8002
AUTH_SERVICE_URL=http://localhost:8001

# Frontend
VITE_AUTH_URL=http://localhost:8001
VITE_EARNINGS_URL=http://localhost:8002
VITE_ANOMALY_URL=http://localhost:8003
VITE_GRIEVANCE_URL=http://localhost:8004
VITE_ANALYTICS_URL=http://localhost:8005
VITE_CERTIFICATE_URL=http://localhost:8006
```

---

## Inter-Service API Contracts

A full Postman collection lives at `shared/api-contracts/fairgig.postman_collection.json`.

### Key endpoints

| Service | Method | Path | Description |
|---|---|---|---|
| auth | POST | `/auth/register` | Register worker/verifier/advocate |
| auth | POST | `/auth/login` | Returns access + refresh tokens |
| auth | POST | `/auth/refresh` | Refresh access token |
| auth | GET | `/auth/me` | Current user profile |
| earnings | GET | `/shifts` | List worker's shifts (paginated) |
| earnings | POST | `/shifts` | Log a new shift |
| earnings | POST | `/shifts/import` | Bulk CSV import |
| earnings | POST | `/shifts/{id}/screenshot` | Upload screenshot for verification |
| earnings | PATCH | `/shifts/{id}/verify` | Verifier approves/disputes/unverifiable |
| earnings | GET | `/analytics/worker` | Personal weekly/monthly trends |
| anomaly | POST | `/detect` | **Judges call this directly** — see below |
| grievance | GET | `/complaints` | List complaints (filtered by platform, category) |
| grievance | POST | `/complaints` | Post a new complaint |
| grievance | PATCH | `/complaints/{id}` | Tag / escalate / resolve (advocate only) |
| analytics | GET | `/advocate/overview` | Commission trends, income distribution |
| analytics | GET | `/advocate/vulnerability` | Workers with >20% income drop |
| analytics | GET | `/city-median` | Anonymised city-wide median (used by worker dashboard) |
| certificate | GET | `/certificate/{worker_id}` | Printable HTML income certificate |

### Anomaly detection endpoint — judges payload

```
POST http://localhost:8003/detect
Content-Type: application/json

{
  "worker_id": "optional-string",
  "earnings": [
    {
      "date": "2026-03-01",
      "platform": "Bykea",
      "gross_earned": 1800,
      "platform_deduction": 540,
      "net_received": 1260,
      "hours_worked": 6
    }
    // ... more records
  ]
}
```

Response:

```json
{
  "anomalies": [
    {
      "date": "2026-03-01",
      "type": "high_deduction_rate",
      "z_score": 3.1,
      "explanation": "Platform deducted 30% of gross earnings on this shift. Your recent average is 20%. This is statistically unusual (3.1 standard deviations above your mean).",
      "severity": "high"
    }
  ],
  "summary": "1 anomaly detected across 1 record.",
  "clean": false
}
```

---

## Database Choices & Justification

### PostgreSQL — Auth, Earnings, Analytics

Chosen because earnings data is highly relational (workers → shifts → screenshots → verification events) and we need ACID guarantees. The `analytics-service` runs aggregate queries against the earnings database using `GROUP BY` with a minimum group size of 5 (`MIN_GROUP_SIZE` env var) to prevent individual record exposure through queries such as city-wide median. All aggregate endpoints return counts alongside the aggregate so advocates can assess statistical reliability.

### MongoDB — Grievance

Complaints are semi-structured: each platform has different complaint categories, tags are freeform, and clustering similar complaints benefits from a flexible document model. MongoDB's text index is used for complaint clustering.

### Redis — Session cache (optional)

Used by the auth service to store refresh token blocklist for fast revocation. Falls back gracefully if Redis is unavailable (stateless JWT mode).

### Anonymisation approach

The `city-median` endpoint never returns data for groups smaller than `MIN_GROUP_SIZE`. All aggregate queries strip `worker_id` before returning. The frontend only shows aggregate figures to workers — never individual peer records.

---

## Seeded Data & City-Wide Median

`scripts/seed.py` inserts:

- 500 worker profiles across Lahore, Karachi, Islamabad
- 90 days of shift data per worker, across platforms: Bykea, Careem, Foodpanda, Daraz, Upwork
- Intentional anomalies in ~5% of records (sudden commission spikes, deactivation events) to demonstrate anomaly detection
- 200 grievances with platform tags and complaint categories

The city-wide median on the worker dashboard is computed at query time from this seeded data using a SQL `PERCENTILE_CONT(0.5)` aggregate — never hardcoded.

---

## Running Tests

```bash
# Python services
cd services/auth-service
pytest

# Node.js grievance service
cd services/grievance-service
npm test

# Frontend
cd apps/frontend
npm run test
```

---

## Deployment Notes

- No Docker is required. Each service runs with a single `uvicorn` or `npm start` command.
- All ports are configurable via `.env`.
- For production, place an Nginx reverse proxy in front of all services and serve the React frontend as static files.
- The income certificate page uses `@media print` CSS rules — it is print-friendly out of the box.



```
fairgig/
│
├── apps/
│   └── frontend/
│       ├── public/
│       ├── src/
│       │   ├── api/
│       │   │   ├── auth.ts
│       │   │   ├── earnings.ts
│       │   │   ├── anomaly.ts
│       │   │   ├── grievance.ts
│       │   │   ├── analytics.ts
│       │   │   └── certificate.ts
│       │   ├── components/
│       │   │   ├── EarningsChart.tsx
│       │   │   ├── AnomalyAlert.tsx
│       │   │   ├── ShiftTable.tsx
│       │   │   ├── ShiftForm.tsx
│       │   │   ├── CsvImport.tsx
│       │   │   ├── CityMedianOverlay.tsx
│       │   │   ├── ScreenshotUpload.tsx
│       │   │   ├── VerificationBadge.tsx
│       │   │   ├── GrievanceCard.tsx
│       │   │   └── VulnerabilityFlag.tsx
│       │   ├── pages/
│       │   │   ├── Landing.tsx
│       │   │   ├── Login.tsx
│       │   │   ├── Register.tsx
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
│       │   ├── store/
│       │   │   ├── authStore.ts
│       │   │   ├── shiftsStore.ts
│       │   │   └── grievanceStore.ts
│       │   ├── router.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       ├── package.json
│       ├── .env.example
│       └── README.md
│
├── services/
│   │
│   ├── auth-service/                  ← FastAPI (Python)
│   │   ├── main.py
│   │   ├── routers/
│   │   │   └── auth.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── security.py
│   │   ├── database.py
│   │   ├── alembic/                   ← DB migrations
│   │   │   └── versions/
│   │   ├── tests/
│   │   │   └── test_auth.py
│   │   ├── requirements.txt
│   │   ├── .env.example
│   │   └── README.md
│   │
│   ├── earnings-service/              ← FastAPI (Python)
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── shifts.py
│   │   │   ├── verification.py
│   │   │   └── analytics.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── csv_import.py
│   │   ├── database.py
│   │   ├── alembic/
│   │   │   └── versions/
│   │   ├── uploads/                   ← Screenshot storage (local dev)
│   │   ├── tests/
│   │   │   ├── test_shifts.py
│   │   │   └── test_csv_import.py
│   │   ├── requirements.txt
│   │   ├── .env.example
│   │   └── README.md
│   │
│   ├── anomaly-service/               ← FastAPI (Python) — judges call /detect directly
│   │   ├── main.py
│   │   ├── routers/
│   │   │   └── detect.py
│   │   ├── detectors/
│   │   │   ├── __init__.py
│   │   │   ├── deduction_rate.py
│   │   │   ├── income_drop.py
│   │   │   └── deactivation_proxy.py
│   │   ├── schemas.py
│   │   ├── tests/
│   │   │   └── test_detect.py
│   │   ├── requirements.txt           ← numpy, scipy, pandas
│   │   ├── .env.example
│   │   └── README.md
│   │
│   ├── grievance-service/             ← Node.js + Express (required by spec)
│   │   ├── src/
│   │   │   ├── app.js
│   │   │   ├── server.js
│   │   │   ├── routes/
│   │   │   │   └── complaints.js
│   │   │   ├── models/
│   │   │   │   └── Complaint.js       ← Mongoose schema
│   │   │   ├── middleware/
│   │   │   │   └── auth.js
│   │   │   └── services/
│   │   │       └── clustering.js
│   │   ├── tests/
│   │   │   └── complaints.test.js
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── README.md
│   │
│   ├── analytics-service/             ← FastAPI (Python)
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── advocate.py
│   │   │   └── city_median.py
│   │   ├── queries.py
│   │   ├── schemas.py
│   │   ├── tests/
│   │   │   └── test_analytics.py
│   │   ├── requirements.txt
│   │   ├── .env.example
│   │   └── README.md
│   │
│   └── certificate-service/           ← FastAPI + Jinja2 (Python)
│       ├── main.py
│       ├── routers/
│       │   └── certificate.py
│       ├── templates/
│       │   └── certificate.html       ← Print-friendly HTML template
│       ├── static/
│       │   └── certificate.css        ← @media print rules
│       ├── schemas.py
│       ├── tests/
│       │   └── test_certificate.py
│       ├── requirements.txt
│       ├── .env.example
│       └── README.md
│
├── shared/
│   ├── types/
│   │   └── index.ts                   ← Shared TS types (Worker, Shift, Complaint, Anomaly)
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
│   ├── seed.py                        ← Inserts 500 workers + 90 days earnings + 200 grievances
│   └── start-all.sh                   ← Starts all services concurrently
│
├── docker-compose.yml                 ← Optional convenience (not required)
├── .gitignore
└── README.md
```