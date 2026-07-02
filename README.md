# Subrat Chandra Naha Portfolio

A production-ready personal portfolio with a React frontend and a Go backend. The Go server exposes portfolio data, stores contact form submissions locally, and serves the built React app as a single deployable service.

## Run Locally

```bash
pnpm --dir frontend install
pnpm --dir frontend build
go run ./cmd/server
```

Open `http://localhost:8080`.

## API

- `GET /api/health`
- `GET /api/profile`
- `POST /api/contact`
- `GET /api/messages`

Contact messages are written to `data/contact-messages.jsonl`.

## Deploy

Build the frontend first, then run the Go server from the repository root:

```bash
pnpm --dir frontend build
PORT=8080 go run ./cmd/server
```

Any Go-friendly host works well: Render, Fly.io, Railway, a VPS, or a Docker-based deployment. The server serves `frontend/dist`, so the deployed service only needs the compiled frontend folder plus the Go binary.
