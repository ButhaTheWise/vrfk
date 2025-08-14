import { writable } from 'svelte/store';

export const toasts = writable([]);

/**
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} timeout
 */
export function showToast(message, type = 'info', timeout = 3000) {
  const id = Date.now() + Math.random();
  toasts.update(all => [...all, { id, message, type }]);
  setTimeout(() => {
    toasts.update(all => all.filter(t => t.id !== id));
  }, timeout);
}
