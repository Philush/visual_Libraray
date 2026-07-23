import { API_BASE_URL } from './client';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@visual-library/types';

async function authRequest<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message =
      typeof data?.message === 'string' ? data.message : `HTTP ${res.status}`;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export const login = (payload: LoginPayload) =>
  authRequest<AuthResponse>('/auth/login', payload);

export const register = (payload: RegisterPayload) =>
  authRequest<AuthResponse>('/auth/register', payload);

export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json() as Promise<User>;
}
