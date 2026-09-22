# Crop Disease Dashboard

Full-stack crop health reporting app with an Express/MongoDB backend and a React/Vite frontend.

## Run locally

```bash
cd backend
npm install
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Set `MONGO_URI` and `JWT_SECRET` in `backend/.env`. The frontend reads its API URL from `frontend/.env`. The report matcher compares submitted symptoms with the seeded disease library and stores the best match.
