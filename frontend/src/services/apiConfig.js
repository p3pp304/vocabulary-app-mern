const localUrl = import.meta.env.VITE_LOCAL_BACKEND_URL || 'http://localhost:3000';
const prodUrl =
  import.meta.env.VITE_PROD_BACKEND_URL;

export const API_BASE_URL = import.meta.env.DEV ? localUrl : prodUrl;