export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  expiresIn: number;
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
}
