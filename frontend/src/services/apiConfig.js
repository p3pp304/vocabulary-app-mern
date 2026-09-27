const LOCAL_API_URL = 'http://localhost:3000';
const PRODUCTION_API_URL = 'https://vocabulary-app-mern.onrender.com';
const configuredApiUrl = import.meta.env.VITE_BACKEND_URL?.trim().replace(/\/+$/, '');
const configuredUrlIsLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(
  configuredApiUrl || '',
);

export const API_BASE_URL =
  import.meta.env.PROD && configuredUrlIsLocal
    ? PRODUCTION_API_URL
    : configuredApiUrl || (import.meta.env.DEV ? LOCAL_API_URL : PRODUCTION_API_URL);