const localUrl = import.meta.env.VITE_LOCAL_BACKEND_URL || 'http://localhost:3000';
const prodUrl = import.meta.env.VITE_PROD_BACKEND_URL;
const isProd = import.meta.env.VITE_IS_PROD === 'true';

let activeUrl = localUrl

if (isProd) {
  activeUrl = prodUrl || localUrl;
}

export const API_BASE_URL = activeUrl