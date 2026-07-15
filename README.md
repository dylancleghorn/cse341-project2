# Ward Activity Board

## Local setup

```shell
npm install
npm run swagger
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
