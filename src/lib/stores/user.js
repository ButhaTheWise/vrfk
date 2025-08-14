// src/lib/stores/user.js
import { writable, derived } from 'svelte/store';

export const user = writable(null);

export const loggedIn = derived(user, $user => !!$user);
export const userRole = derived(user, $user => $user?.role ?? null);

export async function fetchUser() {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      user.set(null);
      return;
    }
    const data = await res.json();
    user.set(data.user ?? null);
  } catch {
    user.set(null);
  }
}

export function clearUser() {
  user.set(null);
}