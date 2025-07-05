/**
 * Authentication service for Ôn Thi Pro
 * Handles login, registration, and session management
 */

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: UserData;
}

export interface UserData {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthError {
  message: string;
  statusCode: number;
}

// API base URL
const API_BASE_URL = 'https://api.onthipro.com';

// Safe localStorage access
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

/**
 * Login user with email and password
 * @param credentials User login credentials
 * @returns Promise with login response or error
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw {
        message: errorData.message || 'Login failed',
        statusCode: response.status,
      };
    }

    const data = await response.json();
    
    // Store tokens in localStorage for session management
    safeLocalStorage.setItem('token', data.token);
    safeLocalStorage.setItem('refreshToken', data.refreshToken);
    safeLocalStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user and clear session data
 */
export const logout = (): void => {
  safeLocalStorage.removeItem('token');
  safeLocalStorage.removeItem('refreshToken');
  safeLocalStorage.removeItem('user');
};

/**
 * Check if user is authenticated
 * @returns Boolean indicating if user has a valid token
 */
export const isAuthenticated = (): boolean => {
  return !!safeLocalStorage.getItem('token');
};

/**
 * Get current user data
 * @returns The current user data or null
 */
export const getCurrentUser = (): UserData | null => {
  const user = safeLocalStorage.getItem('user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Format the join date from ISO format to a more readable format
 * @param isoDate ISO date string from API
 * @returns Formatted date string (DD/MM/YYYY)
 */
export const formatJoinDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

/**
 * Get current authentication token
 * @returns The current access token or null
 */
export const getToken = (): string | null => {
  return safeLocalStorage.getItem('token');
};

/**
 * Refresh the access token using the refresh token
 * @returns Promise with new tokens
 */
export const refreshToken = async (): Promise<{ token: string, refreshToken: string }> => {
  try {
    const currentRefreshToken = safeLocalStorage.getItem('refreshToken');
    
    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: currentRefreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    // Update stored tokens
    safeLocalStorage.setItem('token', data.token);
    safeLocalStorage.setItem('refreshToken', data.refreshToken);
    
    return {
      token: data.token,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    // Force logout on refresh token failure
    logout();
    throw error;
  }
};

export default {
  login,
  logout,
  isAuthenticated,
  getToken,
  refreshToken,
};
