export const STORAGE_KEYS = {
  authToken: 'geo_auth_token',
  userProfile: 'geo_user_profile',
  deviceUuid: 'geo_device_uuid',
} as const;

export function getOrCreateDeviceUuid(): string {
  if (typeof localStorage === 'undefined') {
    return `ssr-${Date.now()}`;
  }

  let uuid = localStorage.getItem(STORAGE_KEYS.deviceUuid);
  if (!uuid) {
    uuid =
      globalThis.crypto?.randomUUID?.() ??
      `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(STORAGE_KEYS.deviceUuid, uuid);
  }
  return uuid;
}

export function decodeJwtExpiry(token: string): Date | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) {
      return null;
    }
    const payload = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'))) as {
      exp?: number;
    };
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch {
    return null;
  }
}
