# Legacy Trivia — Backend (MVP Phase 1)

Express + MongoDB (Mongoose) backend for **Legacy Trivia** covering authentication and the Level 1 / Level 2 trivia game.

ESM (`"type": "module"`), JWT auth (access + refresh), Google Sign-In via ID token verification, OTP-based email verification + password reset.

---

## Setup

```bash
cp .env.example .env
# fill in MONGODB_URI, JWT secrets, SMTP, GOOGLE_CLIENT_ID

npm install
npm run seed        # seeds Level 1 & Level 2 question pools
npm run dev         # http://localhost:5000
```

### Environment

See `.env.example`. Required: `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`. For Google login set `GOOGLE_CLIENT_ID`. SMTP is optional in development — emails are logged to console when not configured.

---

## Project layout

```
src/
  config/        env, db, gameRules
  models/        User, Question, GameSession, Otp, RefreshToken, PasswordResetSession
  services/      email, otp, google, token (JWT + refresh rotation)
  middleware/    auth, validate, error, rateLimit
  validators/    Joi schemas
  controllers/   auth, user, game
  routes/        auth, user, game
  scripts/       seedQuestions
  utils/         ApiError, ApiResponse, asyncHandler, otp, shuffle
  app.js
  server.js
```

---

## Auth flow

### 1. Email/Password signup
1. `POST /api/auth/signup` → creates unverified user, sends 6-digit OTP to email
2. `POST /api/auth/verify-email` → consumes OTP, marks `isVerified=true`, returns access + refresh tokens
3. `POST /api/auth/resend-otp` if needed (60s cooldown, 1h rate limit)

### 2. Google
1. Frontend uses Google Identity Services to obtain an `idToken`
2. `POST /api/auth/google` with `{ idToken }` → server verifies via `google-auth-library`, creates / links user, returns tokens

### 3. Forgot password
1. `POST /api/auth/forgot-password` → OTP emailed (response is generic to prevent enumeration)
2. `POST /api/auth/verify-reset-otp` → returns short-lived `resetToken`
3. `POST /api/auth/reset-password` with `{ resetToken, newPassword, confirmPassword }` → updates password and revokes all refresh tokens

### 4. Refresh / logout
- `POST /api/auth/refresh` rotates refresh token (reuse-detection revokes the chain)
- `POST /api/auth/logout` revokes the supplied refresh token

---

## API reference

All responses: `{ success, message, data }` (or `success: false, message, details`).

### Auth — `/api/auth`
| Method | Path | Body | Notes |
|--------|------|------|-------|
| POST | `/signup` | `firstName, lastName, email, password, referralCode?` | Sends OTP |
| POST | `/verify-email` | `email, otp` | Returns tokens |
| POST | `/resend-otp` | `email, purpose` | `purpose ∈ {email_verification, password_reset}` |
| POST | `/login` | `email, password` | Returns tokens |
| POST | `/google` | `idToken, referralCode?` | Returns tokens |
| POST | `/forgot-password` | `email` | Sends OTP |
| POST | `/verify-reset-otp` | `email, otp` | Returns `resetToken` (15 min) |
| POST | `/reset-password` | `resetToken, newPassword, confirmPassword` | |
| POST | `/refresh` | `refreshToken` | Rotates token |
| POST | `/logout` | `refreshToken?` | |
| GET | `/me` | (auth) | Returns user profile |

### User — `/api/users` (auth)
| Method | Path | Body |
|--------|------|------|
| PATCH | `/me` | `firstName?, lastName?, profilePicture?, soundOn?, btcAddress?` |
| POST | `/change-password` | `currentPassword, newPassword, confirmPassword` |

### Game — `/api/game` (auth)
| Method | Path | Body / Params | Notes |
|--------|------|---------------|-------|
| GET | `/progress` | — | Levels, ladder, treasury, unlocked status |
| GET | `/history` | — | Last 20 sessions |
| POST | `/start` | `level: 1 \| 2` | Resumes existing in-progress session if present |
| GET | `/session/:sessionId` | — | Current state |
| POST | `/answer` | `sessionId, selectedOption (A\|B\|C\|D)` | Server verifies timer + correctness |
| POST | `/lifeline` | `sessionId, type` | `type ∈ ask_a_friend, ask_the_audience, the_reveal, time_freeze` |
| POST | `/session/:sessionId/cashout` | — | Ends with current prize |
| POST | `/session/:sessionId/abandon` | — | Marks abandoned |

#### Level config

| Level | Questions | Timer | Max Prize | Notes |
|-------|-----------|-------|-----------|-------|
| 1 | 15 | 35s | $15 | Free, lifelines free |
| 2 | 20 | 15s | $200 | Requires Level 1 complete |

#### Lifelines
- **ask_a_friend** — returns `{ eliminate: ['X','Y'] }` (50/50: 2 wrong options to remove).
- **ask_the_audience** — returns `{ distribution: { A: %, B: %, C: %, D: % } }`.
- **the_reveal** — returns `{ revealed: 'A'|'B'|'C'|'D' }`.
- **time_freeze** — resets `questionStartedAt` to now.
- **empress_guard** — automatic, one-time per game; first wrong answer is forgiven and the question is replayed.

Each non-guard lifeline can be used at most **once per game**.

#### Anti-cheat
- Question pool is securely shuffled per session (`crypto.randomInt`).
- Each question's option order is independently shuffled per session.
- Server validates the answer against the pinned `optionOrder` and elapsed time (`now - questionStartedAt ≤ timerSeconds + 2s tolerance`).
- Timeouts count as wrong answers (Empress's Guard still applies).

---

## Security posture

- Passwords hashed with bcrypt (cost 12 by default, configurable).
- JWT access tokens (short-lived, default 15m) + opaque refresh tokens (hashed at rest, default 30d) with **reuse detection**: if a revoked refresh token is presented, all of the user's tokens are revoked.
- OTPs are random 6-digit, hashed at rest, expire in 10 min, max 5 attempts, 60s resend cooldown, TTL-purged automatically.
- Forgot-password endpoint is enumeration-safe (uniform response).
- `helmet`, `express-mongo-sanitize`, JSON body limit, CORS allow-list, global rate-limit + per-route auth/OTP limiters.
- Validation via Joi; Mongoose validation surfaces as 400.
- Centralised error handler — never leaks stack traces in production.

---

## Notes on questions

The seed file `src/scripts/data/questions.js` contains the curated set of easy relationship questions parsed from the MVP source document. Both Level 1 and Level 2 are seeded from the same pool for the MVP — the admin panel (Phase 1) is intended to expand each pool to the 100-question target and to differentiate difficulty per level.

Run `npm run seed` to (re)populate.
