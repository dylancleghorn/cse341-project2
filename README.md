# Ward Activity Board

A student-scale full-stack activity board built with Node.js, Express, MongoDB Atlas, Mongoose, EJS, GitHub OAuth, and Swagger. Users can browse activities publicly. Authenticated users can create activities and RSVP as participants; only the activity owner or an administrator can edit or delete an activity.

## Course requirement coverage

- Two MongoDB collections: `activities` and `users`.
- The Activity model has more than seven fields.
- Complete GET, POST, PUT, and DELETE APIs with validation and centralized error handling.
- GitHub OAuth account creation, login, logout, MongoDB-backed sessions, and user roles.
- Protected write endpoints plus owner/admin authorization checks.
- Swagger UI with request/response schemas and documented security behavior.
- Render blueprint and environment-variable configuration.
- EJS pages for listing, viewing, creating, editing, and deleting activities.

The remaining course deliverables are operational rather than code: deploy the app, record a 5–8 minute rubric demonstration, and submit the GitHub, Render `/api-docs`, and YouTube links in Canvas.

## Local setup

1. Install Node.js 20 or newer and create a MongoDB Atlas database.
2. Create a GitHub OAuth App at **GitHub → Settings → Developer settings → OAuth Apps**.
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/auth/github/callback`
3. Copy `.env.example` to `.env` and provide all credentials. Use a long random `SESSION_SECRET`.
4. Run:

```shell
npm install
npm run swagger
npm run seed   # optional example data
npm run dev
```

Open `http://localhost:3000`. API documentation is at `http://localhost:3000/api-docs`.

## Environment variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string including database name |
| `SESSION_SECRET` | Long random value used to sign session cookies |
| `GITHUB_CLIENT_ID` | GitHub OAuth application client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth application secret |
| `GITHUB_CALLBACK_URL` | Exact OAuth callback URL for local or deployed app |
| `ADMIN_EMAILS` | Comma-separated GitHub email addresses that receive the admin role |
| `NODE_ENV` | Set to `production` on Render to enable secure cookies |
| `PORT` | Local port; Render supplies this automatically |

Never commit `.env`. It is ignored by Git.

## API routes

| Method | Route | Access |
|---|---|---|
| GET | `/api/activities` | Public |
| GET | `/api/activities/:id` | Public |
| POST | `/api/activities` | Authenticated |
| PUT | `/api/activities/:id` | Owner or admin |
| DELETE | `/api/activities/:id` | Owner or admin |
| POST | `/api/activities/:id/participants` | Authenticated |
| DELETE | `/api/activities/:id/participants` | Authenticated |
| GET | `/api/users/me` | Authenticated |

To test protected endpoints in Swagger, first open `/auth/github` in the same browser and log in. Swagger requests then use the secure session cookie.

## Validation and security

Activity input is allow-listed. Required strings are trimmed and length-limited; category and status use enums; date must be today or later; time uses 24-hour `HH:mm`; and participant limit must be a non-negative integer. MongoDB IDs are validated before controller execution.

Security controls include Helmet headers, rate limiting, 20 KB body limits, server-side MongoDB sessions, `httpOnly`/`sameSite` cookies (`secure` in production), OAuth rather than local passwords, environment-only secrets, authentication checks, owner/admin authorization, and generic production-safe HTTP errors.

## Deploy to Render

1. Push this project to a GitHub repository.
2. In MongoDB Atlas, permit connections from Render and create a least-privilege database user.
3. In Render, choose **New → Blueprint**, connect the repository, and select `render.yaml`.
4. Enter the secret environment variables listed by the blueprint. Set:
   - `GITHUB_CALLBACK_URL=https://YOUR-SERVICE.onrender.com/auth/github/callback`
5. Add that same callback URL to the GitHub OAuth App. Deploy and verify the homepage, OAuth login, every Swagger route, and MongoDB writes.

For Canvas, submit the GitHub repository URL, `https://YOUR-SERVICE.onrender.com/api-docs`, and the 5–8 minute YouTube demonstration URL.

## Project structure

```text
src/
  config/       database and Passport configuration
  controllers/  API and page request handlers
  middleware/   authentication, validation, and errors
  models/       Mongoose Activity and User schemas
  public/       CSS assets
  routes/       API, OAuth, and page routes
  views/        EJS pages and partials
scripts/        seed and verification utilities
server.js       process entry point
swagger.js      Swagger generator configuration
render.yaml     Render deployment blueprint
```
