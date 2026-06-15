# BudzetApp

Aplikacja do planowania budżetu metodą kopertową. 

<img width="1915" height="902" alt="image" src="https://github.com/user-attachments/assets/990e40d3-c671-4763-9583-fe87591fece9" />

## Technologie

- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- Frontend: React, Vite, TypeScript, React Router
- Uwierzytelnianie: JWT
- Uruchomienie: Docker Compose

## Uruchomienie

```
cp .env.example .env
docker compose up -d --build
```

- Frontend: http://localhost:5173
- API (Swagger): http://localhost:8000/docs

## Konto demo

Żeby załadować przykładowe dane (konto z kilkoma kategoriami i dwoma zaplanowanymi miesiącami), należy uruchomić seed:

```
docker compose exec api python -m app.seed
```

Logowanie do konta demo:

- email: `demo@demo.pl`
- hasło: `demo123`

Seed można uruchamiać wielokrotnie za każdym razem czyści i odtwarza konto demo, nie ruszając pozostałych użytkowników.

## Testy

```
docker compose exec api python -m pytest app/tests
```

