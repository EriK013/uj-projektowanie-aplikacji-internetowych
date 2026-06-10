const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

type Options = {
  method?: string;
  body?: unknown;
  form?: boolean;
};

export async function request<T>(path: string, options: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let body: string | undefined;
  if (options.form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = options.body as string;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? "Wystapil blad");
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}
