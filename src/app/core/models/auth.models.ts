export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string | null;
}

export interface LoginResponse {
  success: boolean;
  data: TokenPair;
  message?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    expiresIn: number;
  };
  message?: string;
}
