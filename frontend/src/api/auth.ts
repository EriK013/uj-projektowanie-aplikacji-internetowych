import { request, setToken } from "./client";

export type User = {
  id: number;
  email: string;
};

type TokenResponse = {
  access_token: string;
};

export async function login(email: string, password: string): Promise<void> {
  const params = new URLSearchParams();
  params.set("username", email);
  params.set("password", password);

  const data = await request<TokenResponse>("/auth/login", {
    method: "POST",
    form: true,
    body: params.toString(),
  });
  setToken(data.access_token);
}

export async function register(email: string, password: string): Promise<User> {
  return request<User>("/auth/register", {
    method: "POST",
    body: { email, password },
  });
}

export async function me(): Promise<User> {
  return request<User>("/auth/me");
}
