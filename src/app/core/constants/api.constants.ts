const DEFAULT_API_BASE_URL = 'https://restaurapp-backend.onrender.com/api';

// Prefer Vercel/Angular NG_APP_* env vars but fall back to the default backend.
export const API_BASE_URL =
  import.meta.env?.NG_APP_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
