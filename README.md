# Wanderlust

A responsive property listing app built with Node.js, Express, EJS, MongoDB, Bootstrap, Passport.js, and JWT.

## Run locally

1. Install Node.js and run `npm install`.
2. Copy `.env.example` to `.env`, set `MONGODB_URI`, and replace both secrets with long random values.
3. Start MongoDB locally, then run `npm run seed` to load example listings (optional).
4. Run `npm run dev` and open `http://localhost:8080`.

Registration and login use Passport Local with MongoDB-backed sessions. Signed-in users can create listings and reviews; only listing owners can edit/delete their listings, and only review authors can delete their reviews.

## JSON API

- `GET /api/listings` returns public listings.
- `POST /api/auth/token` accepts `{ "username": "...", "password": "..." }` and returns a one-hour JWT.
- `POST /api/listings` requires `Authorization: Bearer <token>` and a listing JSON object (or `{ "listing": { ... } }`).

## Deploy to Render

Create a Render Web Service from this repository, set the build command to `npm install` and the start command to `npm start`. Configure `MONGODB_URI` with a reachable MongoDB Atlas URI, plus unique random `SESSION_SECRET` and `JWT_SECRET` values, and set `NODE_ENV=production`. Render supplies `PORT` automatically. The app uses secure, HTTP-only session cookies in production and stores sessions in MongoDB, so it works across service restarts and instances.
