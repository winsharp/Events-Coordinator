# Events Coordinator
Middleman that coordinates artists, venues, and patrons. 

## Quickstart Setup + Run

The app is two pieces that run side by side: a Spring Boot backend (port `8080`) and a React frontend (port `5173`). You'll need **Java 17**, **Node.js**, and a local **PostgreSQL** install before starting.

### 1. Configure the frontend

Copy the example env file:

```
cd frontend
cp .env.example .env
```

The default value (`VITE_API_URL=http://localhost:8080/api`) already matches the backend setup below, so you shouldn't need to change anything unless you change the backend's port.

### 2. Set up the database

Create the database the backend expects (default name `eventscoordinator`):

```
psql -U postgres -c "CREATE DATABASE eventscoordinator;"
```

You'll need a local PostgreSQL server running first — install it if you don't already have one. On Windows, make sure `psql` is on your `PATH` (it lives under `C:\Program Files\PostgreSQL\<version>\bin` by default).

### 3. Configure the backend

Copy the example config and fill in your own local Postgres password:

```
cd backend/src/main/resources
cp application.properties.example application.properties
```

Open `application.properties` and set `spring.datasource.password` to whatever you set for your local `postgres` user. Leave everything else as-is unless your Postgres setup differs (different port, username, etc.).

### 4. Run the backend

**Windows:**
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

**Unix/Linux:**
```bash
cd backend
./mvnw spring-boot:run
```

`mvnw`/`mvnw.cmd` are two different wrapper scripts checked into the repo — use whichever matches your OS, not both.

On first run, this automatically creates all the tables (`ddl-auto: update` — no separate migration step needed) and seeds a few sample venues/artists/events so there's something to look at right away. Leave this running — it serves the API at `http://localhost:8080`.

### 5. Run the frontend

In a separate terminal:

```
cd frontend
npm install
npm run dev
```

Then open your browser to `http://localhost:5173`.

### Troubleshooting

- **Backend won't start / connection refused**: make sure PostgreSQL is actually running (`pg_isready`) and that `eventscoordinator` exists (`psql -U postgres -l`).
- **Wrong password errors**: double check `application.properties` matches your actual local Postgres credentials — this file is gitignored on purpose since it holds a real password, so every teammate sets their own copy.
- **Frontend loads a blank/white page**: almost always means `frontend/.env` is missing (step 1) — without it, every API call breaks and the page fails to render. Check the browser console for `events.map is not a function` or similar as a telltale sign.
