# TicketGenie Platform

TicketGenie is a full-stack event discovery, venue booking, ticket reservation, and demonstration checkout platform. A unified account system supports **Customer**, **Artist**, and **Venue** roles while role-specific profiles, route guards, JWT authentication, and service-layer authorization enforce each workflow.

The project contains a responsive React and Vite frontend, a Spring Boot REST API, PostgreSQL persistence, an optional H2 development profile, deterministic demonstration data, local visual assets, and comprehensive automated test suites.

## Feature Coverage

| Experience | Implemented capabilities |
|---|---|
| Public | Event, Artist, and Venue discovery; text and location filters, plus genre filters for Events and Artists; details, including artist and venue bio pages with their upcoming shows; real minimum tier prices; local artwork; responsive navigation; loading, error, and empty states |
| Customer | Registration, login, home, profile, order history, digital tickets, quantity and exact-seat selection, five-minute holds, Card/PayPal/USDC demonstration checkout, and ticket transfer |
| Artist | Profile management, date/location/capacity Venue filtering, open-slot selection, booking requests, pending workflow feedback, profile-owned Event listings, and creating up to four priced ticket tiers (General Admission, VIP, or custom-named) per confirmed Event |
| Venue | Analytics ranges, responsive calendar navigation, add/cancel availability, pending booking details, approve/reject decisions, profile editing, explicit publish/unpublish state, and seating inventory |
| Security | BCrypt password hashes, stateless JWT bearer authentication, `@PreAuthorize`, ownership checks, configurable credentialed CORS, validation, and structured error responses |
| Reliability | Transactional booking and inventory mutation, pessimistic/optimistic locking, idempotent checkout, reservation cleanup, and business-operation logging |

### Payment Demonstrations

All payment paths are intentionally non-production. Card and PayPal complete immediately after valid demonstration data is submitted. USDC creates a pending order, displays a locally rendered non-production QR code, waits 30 seconds, and then confirms through the backend status endpoint. No processor, wallet, blockchain, or real funds are used.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Mantine |
| Forms and validation | React Hook Form, Zod |
| Server state | TanStack Query, Axios |
| Visualization | Nivo and Visx |
| Standalone API | Mock Service Worker |
| Frontend testing | Vitest, Testing Library, MSW, V8 coverage |
| Backend | Java 17, Spring Boot 3, Spring MVC, Spring Data JPA, Spring AOP |
| Security | Spring Security, JWT, BCrypt, method security |
| Mapping and validation | MapStruct, Jakarta Bean Validation |
| Database | PostgreSQL 16; H2 PostgreSQL mode for local development and automated tests |
| Backend testing | JUnit 5, Mockito, Spring Boot Test, MockMvc, AssertJ, JaCoCo |

## Repository Layout

```text
.
├── backend/
│   ├── data-population.sql
│   ├── pom.xml
│   └── src/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── mocks/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── design/
│   └── requirements/
├── docker-compose.yml
└── README.md
```

## Prerequisites

| Requirement | Supported version or alternative |
|---|---|
| Java Development Kit | Java 17 or later |
| Maven | Apache Maven 3.9 or later, or the included Maven Wrapper (`mvnw`/`mvnw.cmd`) |
| Node.js | Node.js 20 or later with npm |
| PostgreSQL option | Docker with Docker Compose, Podman-compatible Compose, or an existing PostgreSQL 16-compatible server |
| H2 option | No external database process is required; H2 is included as a runtime dependency for the `h2` profile |

## Quick Start: Standalone Frontend

The standalone mode uses MSW and does not require Java or a database.

```bash
cd frontend
cp .env.example .env
npm install
VITE_USE_MOCKS=true npm run dev
```

Open `http://localhost:5173`. The highlighted Customer, Artist, and Venue demonstration credentials work in this mode.

## Quick Start: Full Stack with PostgreSQL

### 1. Start PostgreSQL

**With Docker**, from the project root:

```bash
docker compose up -d postgres
```

The service creates the `ticketgenie` database with the local credentials defined in `docker-compose.yml`.

**Without Docker**, using an existing local PostgreSQL 16+ install, connect with an admin account (e.g. `psql -U postgres`) and run:

```sql
CREATE ROLE ticketgenie LOGIN PASSWORD 'ticketgenie';
CREATE DATABASE ticketgenie OWNER ticketgenie;
```

This creates the same role, password, and database name the backend's defaults expect — no further configuration needed.

### 2. Start Spring Boot and create the schema

```bash
cd backend
cp .env.example .env
set -a
source .env
set +a
./mvnw spring-boot:run
```

The Maven Wrapper downloads the required Maven distribution when necessary. The API starts at `http://localhost:8080`, and Hibernate creates or updates the PostgreSQL schema.

> **Windows (PowerShell or cmd, not Git Bash):** `set -a` / `source` are bash syntax and silently do nothing outside a bash shell — skip that block. If the defaults above already match your local PostgreSQL (they will if you followed step 1's non-Docker path), just run `.\mvnw.cmd spring-boot:run`. Only set variables individually first (`$env:DATABASE_PASSWORD = "..."`) if you actually need to override a default.

### 3. Load demonstration data

After Spring Boot has created the tables, run from the project root.

**With Docker:**

```bash
docker compose exec -T postgres \
  psql -U ticketgenie -d ticketgenie < backend/data-population.sql
```

**Without Docker**, against a local PostgreSQL install:

```bash
psql -h localhost -U ticketgenie -d ticketgenie -f backend/data-population.sql
```

The SQL is PostgreSQL-specific, deterministic, foreign-key ordered, and safe to rerun in a dedicated development database. It truncates only TicketGenie tables, inserts related records, and resets every populated identity sequence.

### 4. Start the frontend against Spring

```bash
cd frontend
cp .env.example .env
VITE_USE_MOCKS=false \
VITE_API_BASE_URL=http://localhost:8080/api \
npm run dev
```

The production adapter maps Spring DTOs into the UI domain, enriches Events with ticket-tier prices and Artist genres, stores the JWT after login, sends it on protected requests, and removes it on logout.

## Quick Start: Backend with H2

H2 provides a zero-setup backend development option when PostgreSQL is not required. It uses a local file database under `backend/data/` and starts with an empty TicketGenie schema.

```bash
cd backend
./mvnw -Dspring-boot.run.profiles=h2 spring-boot:run
```

The API remains available at `http://localhost:8080`. Create accounts and records through the REST API. The comprehensive `data-population.sql` must only be loaded into PostgreSQL because it uses PostgreSQL-specific reset and population behavior.

To reset local H2 development data, stop Spring Boot and delete `backend/data/`.

## Demonstration Accounts

All seeded accounts use the password **`TicketGenie1!`**. Login accepts either the username or email. Passwords are stored as BCrypt hashes rather than plaintext.

| Default UI account | Role | Username | Email | Related records |
|---|---|---|---|---|
| Yes | Customer | `customer.alex` | `alex@ticketgenie.test` | Orders, reservations, issued tickets, and transfer history |
| Yes | Artist | `artist.neon` | `neon@ticketgenie.test` | Artist profile and confirmed Events |
| Yes | Venue | `venue.demo` | `venue.demo@ticketgenie.test` | Full Venue profile, publication state, availability, bookings, and seats |

| Additional role | Usernames | Emails |
|---|---|---|
| Customers | `customer.demo`, `customer.jordan`, `customer.riley`, `customer.morgan`, `customer.sky` | `customer.demo@ticketgenie.test`, `jordan@ticketgenie.test`, `riley@ticketgenie.test`, `morgan@ticketgenie.test`, `sky@ticketgenie.test` |
| Artists | `artist.demo`, `artist.jazz`, `artist.folk`, `artist.pulse`, `artist.classical` | `artist.demo@ticketgenie.test`, `jazz@ticketgenie.test`, `folk@ticketgenie.test`, `pulse@ticketgenie.test`, `classical@ticketgenie.test` |
| Venues | `venue.harbor`, `venue.garden`, `venue.riverside`, `venue.loft`, `venue.opera` | `harbor@ticketgenie.test`, `garden@ticketgenie.test`, `riverside@ticketgenie.test`, `loft@ticketgenie.test`, `opera@ticketgenie.test` |

## Seed Data Scope

The verified PostgreSQL population contains the following connected data. Every public Venue includes an address, capacity, description, and explicit publication state; ticket tiers belong to the Artist on each confirmed Event, not to the Venue.

| Entity or state | Seeded data |
|---|---|
| Accounts | 18 total: 6 Customer, 6 Artist, and 6 Venue accounts |
| Profiles | 6 Artist profiles and 6 published Venue profiles |
| Availability | 18 slots across open, booked, and cancelled states |
| Events | 10 across confirmed, pending, rejected, and cancelled states |
| Ticket inventory | 18 tiers and 96 seats across available, held, and sold states |
| Reservations | 18 across active, converted, expired, and released states |
| Orders | 12 across Card, PayPal, and USDC; paid, pending, failed, and cancelled states |
| Issued tickets | 6 valid, transferred, and cancelled ticket records |

The script was validated by loading it twice consecutively into PostgreSQL 16 and then checking all row counts, foreign-key relationships, lifecycle distributions, profile fields, and payment-method distributions.

## Configuration

### Backend

| Environment variable | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | HTTP server port |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/ticketgenie` | PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | `ticketgenie` | Database username |
| `DATABASE_PASSWORD` | `ticketgenie` | Database password |
| `JWT_SECRET` | Development-only value | Base64-encoded JWT signing key; replace outside local development |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Comma-separated allowed credentialed origins |
| `DDL_AUTO` | `update` | Hibernate schema behavior |
| `RESERVATION_MINUTES` | `5` | Server-side reservation expiration period |

### Frontend

| Environment variable | Default | Purpose |
|---|---|---|
| `VITE_USE_MOCKS` | `false` when absent | Enables the standalone MSW API when set to `true` |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Spring REST base URL |

All active images are stored under `frontend/src/assets`. Runtime pages do not depend on remote image services.

## REST API Overview

| Area | Representative endpoints |
|---|---|
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/me` |
| Public discovery | `GET /api/events`, `GET /api/events/{id}`, `GET /api/artists`, `GET /api/venues` |
| Role profiles | `GET/PUT /api/artists/me`, `GET/PUT /api/venues/me`, `POST /api/venues` |
| Artist workflow | `GET /api/artist/events`, `POST /api/artist/slots/{slotId}/book` |
| Venue workflow | `GET /api/venue/slots`, `GET /api/venue/bookings`, `PATCH /api/venue/bookings/{eventId}/approve`, `PATCH /api/venue/bookings/{eventId}/reject` |
| Inventory | `GET/POST /api/events/{eventId}/tiers`, `GET/POST /api/events/{eventId}/seats` |
| Commerce | `POST /api/reservations`, `DELETE /api/reservations/{id}`, `POST /api/checkout`, `GET /api/orders/{id}/status` |
| Customer records | `GET /api/orders`, `GET /api/tickets`, `POST /api/tickets/{id}/transfer` |

Public browse endpoints require no token. Protected routes enforce role and ownership constraints in service methods. Booking, reservation, inventory, and checkout mutations use transactions and locking where concurrent updates matter.

## Automated Testing

### Frontend

```bash
cd frontend
npm ci
npm run format
npm run lint
npm run build
npm run test:run
npm run coverage
```

The frontend suite contains **413 passing Vitest invocations** covering production DTO adapters, MSW behavior, schemas, formatters, local assets, authentication, role guards, public routes, role dashboards, calendar controls, analytics ranges, booking approval/rejection, reservation switching and expiry, centered seating sections, Venue publication, and checkout redirects.

| Frontend V8 metric | Result | Enforced minimum |
|---|---:|---:|
| Statements | 74.90% | 70% |
| Branches | 63.46% | 60% |
| Functions | 68.94% | 65% |
| Lines | 76.21% | 75% |

Reports are written to `frontend/test-results.json` and `frontend/coverage/`.

### Backend

```bash
cd backend
./mvnw clean test
```

The backend suite contains **348 passing JUnit 5 invocations** covering end-to-end MockMvc workflows, JWT and role rules, Venue publication visibility, profile persistence, booking decisions, validation, inventory, reservation expiry, payment readiness, BCrypt seed verification, and SQL referential checks.

| Backend JaCoCo metric | Result |
|---|---:|
| Instructions | 85.16% |
| Branches | 55.15% |
| Lines | 88.49% |
| Methods | 83.25% |

JaCoCo writes its HTML report to `backend/target/site/jacoco/index.html`.

## Security and Operational Notes

Passwords are BCrypt-encoded, JWT authentication is stateless, and protected services use method-level role and ownership checks. Credentialed CORS uses a configurable exact-origin allowlist and supports the authorization, content type, idempotency, and request-correlation headers used by the application. Validation and domain failures return structured HTTP responses. Business-operation logging records operation name, actor, outcome, and duration without logging passwords, tokens, payment data, or full request bodies.

The included credentials and signing key are development values. Before production deployment, replace secrets, use controlled database migrations, terminate TLS at a trusted proxy, connect a real payment provider, add managed observability, and configure deployment-specific CORS origins.
