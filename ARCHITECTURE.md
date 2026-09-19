# Architecture Notes

A short tour of how the Healthcare Scale Platform is put together. Setup and API reference are in [`README.md`](README.md).

## Shape

```
React SPA (Vite, :5173)  ──JSON + Bearer JWT──▶  Rails API (:3000)  ──▶  PostgreSQL
```

Two separate apps. The React client holds no business logic beyond presentation. Scoring, validation, authorization and analysis all live in the Rails API.

## Domain Model

The central idea is that a **`Scale` is data, not code**:

- A `Scale` has ordered `Question`s (`position` unique per scale, each with its own `min_value`/`max_value`).
- A `Scale` carries `scoring_bands`, a jsonb array such as `[{"label":"Low","min":0,"max":4}, ...]`, validated for labels, whole-number ranges and overlaps.
- Publishing locks a scale. Its questions and scoring bands can no longer change, so every response to it is scored against the same instrument. A scale needs at least one question to be published.
- A `Response` stores one `Answer` per question. `Answer#value` is validated against that question's range, and `(response_id, question_id)` is unique at the database level.
- `Response#calculate_score` is `answers.sum(:value)`. `Response#severity_band` looks that score up in the scale's bands.

So Beck Depression, PHQ-9 or GAD-7 are just different rows. Adding an instrument needs no new code.

`Survey` is one distribution of a scale, and `Analysis` records a statistical run over a survey's responses.

## Authentication

- `POST /api/v1/session` checks email and password (`has_secure_password` / BCrypt) and returns a JWT signed by `JsonWebToken` (`app/lib/json_web_token.rb`).
- `ApplicationController#authenticate_request!` runs before every action, decodes `Authorization: Bearer <token>`, loads `current_user`, and renders `401` otherwise. Login, registration and public response submission skip it.
- The API is stateless. There is no session table.
- The React client keeps the token in `AuthContext` and sends it from `frontend/src/api/client.js`.

## Authorization and Data Exposure

- **Pundit policies** (`app/policies/`) enforce ownership: only a scale's owner can update, publish or delete it, only a survey's owner can read its responses or run analyses on it, and users can only edit themselves. Failures render `403`.
- **Mass assignment is locked down.** `role` and `credits` are never client-settable, and `user_id` always comes from `current_user`. Registration cannot create an admin or grant credits.
- **Jbuilder views** (`app/views/api/v1/`) whitelist serialized fields, so `password_digest` cannot leak the way bare `render json: model` allowed in the original scaffold.

## Analysis Engine

`Analysis#execute_analysis` dispatches on `analysis_type` to plain service objects in `app/services/analyses/`:

| Service | What it does |
|---|---|
| `DescriptiveStats` | mean, median, standard deviation, min/max, n over response scores |
| `Correlation` | Pearson correlation between two questions across all responses |
| `FactorSummary` | per-question average/min/max. Deliberately not real factor analysis, and the output includes a `note` saying so. |

Results are stored in `analyses.results` (jsonb).

Analyses are gated by credits. `Analysis::CREDIT_COSTS` sets the price (5/10/15), a `sufficient_credits` validation returns `422` with a clear message when the balance is too low, and credits are deducted only after a successful create. A correlation without both questions fails validation instead of erroring inside the service.

## API Conventions

- Versioned under `/api/v1`, resources nested where ownership demands it (`scales/:scale_id/questions`).
- `page`/`per` pagination on every `index`, with no extra gem.
- Destroy guards return `422` instead of cascading or hitting a foreign-key error. Submitted responses are immutable.

## Testing Layers

| Layer | Tool | Covers |
|---|---|---|
| Request tests | Minitest (`test/controllers/api/v1/`) | every action: auth failures, Pundit denials, validation errors, destroy guards |
| E2E / BDD | Cypress + Cucumber (`cypress/e2e/features/`) | authentication, scale management, survey responses, analysis, API security, against the running React app |
| API collection | Postman + Newman | auth-first collection (register, login) using bearer tokens |
| CI | GitHub Actions | Brakeman, RuboCop, Minitest |

## Known Limitations

- JWTs carry no expiry claim and there is no refresh or revocation.
- `Survey#generate_link` still returns a placeholder host (`scale-platform.com`). The React app builds its own `/take/:id` link.
- `json` is pinned `< 3.0` in the Gemfile because Rails 8.0.5.1's `render json:` still passes a keyword `json` 3.0 removed.
- `test/models/*_test.rb` are still empty scaffolds. Coverage comes from the request tests.
- The `factor` analysis is a summary, not a statistical factor analysis.
- Deployment (Kamal/Docker) is scaffolded but untested for this rebuild.
