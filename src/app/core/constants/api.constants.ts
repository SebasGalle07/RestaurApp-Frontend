const DEFAULT_API_BASE_URL = 'https://restaurapp-backend.onrender.com/api';
const VERCEL_PROXY_BASE_URL = '/api';

const resolveBaseUrl = (): string => {
  const envValue = import.meta.env?.NG_APP_API_BASE_URL?.trim();
  if (envValue) {
    return envValue;
  }

  // When running on Vercel we route through /api to avoid cross-origin errors.
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')) {
    return VERCEL_PROXY_BASE_URL;
  }

  return DEFAULT_API_BASE_URL;
};

export const API_BASE_URL = resolveBaseUrl();
