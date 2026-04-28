# Student Quick Survey

Lightweight mobile-first interactive survey to collect where students go outside campus, how often, and spending behavior.

How to run (development)

1. Install dependencies

```bash
npm install
```

2. Run the Vite dev server and the mock backend in separate terminals

Client (React + Vite):

```bash
npm run dev
```

Server (mock Express endpoint):

```bash
npm run server
```

Open http://localhost:5173 (Vite will show the exact URL). The client POSTs to `/api/survey` which is proxied to the server if you run both locally.

What we implemented

- One-question-per-screen flow with progress bar
- Amharic translations under each question
- Single-choice, multi-select, slider and text inputs
- Business name collection with quick suggestion chips and an "add your own" input
- Smooth transitions and mobile-first styling

Backend

- A minimal Express server is provided at `server/server.js` that saves submissions to `server/submissions.json` (mock DB). Replace with your real DB integration as needed.

Next steps

- Hook to your existing backend/database by replacing the `/api/survey` handler or forwarding requests
- Add authentication or CAPTCHA if required
- Add analytics and aggregation export
