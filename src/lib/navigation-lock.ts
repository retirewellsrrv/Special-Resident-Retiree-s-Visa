let locked = false;
const listeners = new Set<() => void>();

export function setNavigationLocked(value: boolean) {
  if (locked === value) return;
  locked = value;
  listeners.forEach((l) => l());
}

export function isNavigationLocked() {
  return locked;
}

export function subscribeNavigationLock(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
