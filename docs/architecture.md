# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- **Presentation tier decision**: Replace placeholder "Implementation pending" text in Activities, Teams, Leaderboard, and Workouts components with API calls via the client. Display lists with proper data bindings and Bootstrap styling.
- **Logic tier decision**: Implement Express routes in `/api` namespace that validate input, call octofitService for business logic, and return 4xx for validation errors (never 500 from cast errors).
- **Data tier decision**: Define Mongoose schema validations for User, Team, Activity, and Workout models with required fields and type constraints. Implement idempotent seed data.
- **Activity tracking approach**: Store activities with user, team, type, minutes, computed points (based on type/minutes), and automatic occurredAt timestamp. Validate userId and teamId with ObjectId type checking before saving.
- **Team management approach**: Create teams with required name and mascot fields. Maintain a members array referencing User documents. Reject POST requests missing name with 400 Bad Request.
- **Leaderboard approach**: Query all activities, group by team, sum points per team, sort descending, and add 1-based rank. Return array with teamName, totalPoints, and rank.
- **Workout suggestions approach**: Query user's recent activities, infer focus from goal or activity patterns, select suggestion matching that focus, include reason field explaining the recommendation. Return 404 for unknown email.

## Test plan

Record the commands you run and what each failure means.

- **Data-tier command**: `npm run test:data --prefix octofit-tracker/backend`
  - **Current failures**: User, Team, Activity, and Workout models lack Mongoose schema validation for required fields (name, email, fitnessGoal, type, focus, etc.)
  - **Target**: All 5 tests pass, including schema validation tests and idempotent seed data test.

- **API command**: `npm run test:api --prefix octofit-tracker/backend`
  - **Current failures**: 
    - Activities and Teams endpoints return 501 (not implemented); need routes with validation returning 400 for invalid input
    - Leaderboard returns empty array instead of ranked teams by total points
    - Workout suggestions missing `reason` field in response
  - **Target**: All 4 tests pass with proper 400 validation, aggregated leaderboard, and reason field in suggestions.

- **Frontend command**: `npm test --prefix octofit-tracker/frontend`
  - **Current failures**: All 15 tests fail because components show "Implementation pending" placeholder instead of fetching and rendering API data
  - **Target**: All 15 tests pass with Activities, Teams, Leaderboard, and Workouts components rendering fetched data.

- **Backend build command**: `npm run build --prefix octofit-tracker/backend`
  - **Purpose**: Verify TypeScript compilation succeeds; validates no type errors in routes, services, and models.

- **Frontend build command**: `npm run build --prefix octofit-tracker/frontend`
  - **Purpose**: Verify Vite build completes; validates no errors in React components and TypeScript.
