/**
 * Same production / development URLs as kisko-mobile `src/api/config/config.ts`.
 * Flip IS_PRODUCTION when deploying.
 */
export const IS_PRODUCTION = false;

export const getBaseUrl = (): string => {
  if (IS_PRODUCTION) {
    return 'https://kisko.store';
  }
  // Local / tunnel for device testing
  return 'https://ztggj6tg-3000.inc1.devtunnels.ms';
};

/** Socket.IO server URL (same as kisko-mobile) */
export const getSocketUrl = (): string => {
  if (IS_PRODUCTION) {
    return 'https://socket.kisko.store';
  }
  // Windows LAN IP — phone on same Wi‑Fi (not ZeroTier)
  return 'http://192.168.0.159:4000';
};

/**
 * Must match Kisko-Web `SCHOOL_PICKUP_API_TOKEN`.
 */
export const SCHOOL_PICKUP_API_TOKEN = 'kisko-school-pickup-dev-token';

/** Optional default kiosk device_id for the form */
export const DEFAULT_DEVICE_ID = '';
