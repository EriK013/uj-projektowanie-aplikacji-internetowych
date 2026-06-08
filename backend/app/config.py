import os


def _origins(value: str) -> list[str]:
    return [o.strip() for o in value.split(",") if o.strip()]


CORS_ORIGINS = _origins(os.getenv("CORS_ORIGINS", "http://localhost:5173"))
DATABASE_URL = os.getenv("DATABASE_URL", "")
