import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface LoginResponse {
  token: string;
}

interface SignupResponse {
  message: string;
}

interface VerifyResponse {
  valid: boolean;
  userId: number;
  error?: string;
}

interface ErrorResponse {
  error: string;
}

export const signup = async (email: string, password: string): Promise<SignupResponse> => {
  try {
    const response = await api.post('/auth/signup', { email, password });
    return response.data;
  } catch (error: any) {
    const errorResponse: ErrorResponse = error.response?.data || { error: 'Signup failed' };
    throw new Error(errorResponse.error);
  }
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    const errorResponse: ErrorResponse = error.response?.data || { error: 'Login failed' };
    throw new Error(errorResponse.error);
  }
};

export const verifyToken = async (token: string): Promise<VerifyResponse> => {
  try {
    const response = await api.post('/auth/verify', { token });
    return response.data;
  } catch (error: any) {
    const errorResponse: ErrorResponse = error.response?.data || { error: 'Token verification failed' };
    throw new Error(errorResponse.error);
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
};