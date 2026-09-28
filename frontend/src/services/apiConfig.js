const LOCAL_API_URL = 'http://localhost:3000';
const configuredApiUrl = import.meta.env.VITE_BACKEND_URL?.trim().replace(/\/+$/, '');
const configuredUrlIsLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(
  configuredApiUrl || '',
);

export const API_BASE_URL =
  import.meta.env.PROD
    ? configuredApiUrl || 'https://vocabulary-app-mern.onrender.com'
    : configuredApiUrl && !configuredUrlIsLocal
      ? configuredApiUrl
      : LOCAL_API_URL;