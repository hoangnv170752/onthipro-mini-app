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

import { API_BASE_URL } from "@/config/env";

import { getStorage, setStorage } from "zmp-sdk";

// Auth store for Zalo Mini App using both in-memory and ZMP storage
class AuthStore {
  private static instance: AuthStore;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: any = null;
  private initialized: boolean = false;
  private storageKeys = {
    token: "onthipro_token",
    refreshToken: "onthipro_refresh_token",
    user: "onthipro_user"
  };

  private constructor() {
    // Try to load data from ZMP storage on initialization
    this.loadFromStorage();
  }

  public static getInstance(): AuthStore {
    if (!AuthStore.instance) {
      AuthStore.instance = new AuthStore();
    }
    return AuthStore.instance;
  }

  // Load auth data from ZMP storage
  private async loadFromStorage(): Promise<void> {
    try {
      // Get token
      const tokenResult = await getStorage({
        keys: [this.storageKeys.token]
      });
      if (tokenResult && tokenResult.data && tokenResult.data[this.storageKeys.token]) {
        this.token = tokenResult.data[this.storageKeys.token];
      }

      // Get refresh token
      const refreshTokenResult = await getStorage({
        keys: [this.storageKeys.refreshToken]
      });
      if (refreshTokenResult && refreshTokenResult.data && refreshTokenResult.data[this.storageKeys.refreshToken]) {
        this.refreshToken = refreshTokenResult.data[this.storageKeys.refreshToken];
      }

      // Get user data
      const userResult = await getStorage({
        keys: [this.storageKeys.user]
      });
      if (userResult && userResult.data && userResult.data[this.storageKeys.user]) {
        try {
          this.user = JSON.parse(userResult.data[this.storageKeys.user]);
        } catch (e) {
          console.error("Error parsing user data from storage", e);
        }
      }

      // Mark as initialized if we have a token
      if (this.token) {
        this.initialized = true;
        console.log("Auth data loaded from storage");
      }
    } catch (error) {
      console.error("Error loading auth data from storage", error);
    }
  }

  // Token management
  public async setToken(token: string): Promise<void> {
    this.token = token;
    try {
      await setStorage({
        data: { [this.storageKeys.token]: token }
      });
    } catch (error) {
      console.error("Error saving token to storage", error);
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public async setRefreshToken(token: string): Promise<void> {
    this.refreshToken = token;
    try {
      await setStorage({
        data: { [this.storageKeys.refreshToken]: token }
      });
    } catch (error) {
      console.error("Error saving refresh token to storage", error);
    }
  }

  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  // User data management
  public async setUser(userData: any): Promise<void> {
    this.user = userData;
    try {
      await setStorage({
        data: { [this.storageKeys.user]: JSON.stringify(userData) }
      });
    } catch (error) {
      console.error("Error saving user data to storage", error);
    }
  }

  public getUser(): any {
    return this.user;
  }

  // Clear all auth data
  public async clear(): Promise<void> {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.initialized = false;
    
    try {
      // Clear from ZMP storage
      await setStorage({
        data: { 
          [this.storageKeys.token]: "",
          [this.storageKeys.refreshToken]: "",
          [this.storageKeys.user]: ""
        }
      });
    } catch (error) {
      console.error("Error clearing auth data from storage", error);
    }
  }

  // Check if the store has been initialized
  public isInitialized(): boolean {
    return this.initialized;
  }

  // Mark the store as initialized
  public setInitialized(): void {
    this.initialized = true;
  }
}

// Get singleton instance
const authStore = AuthStore.getInstance();

/**
 * Login user with email and password
 * @param credentials User credentials
 * @returns Promise with login response
 */
export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  try {
    console.log("Attempting login with API URL:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();
    console.log("Login successful, storing auth data");

    // Store tokens in memory and ZMP storage
    const authStore = AuthStore.getInstance();
    await Promise.all([
      authStore.setToken(data.token),
      authStore.setRefreshToken(data.refreshToken),
      authStore.setUser(data.user)
    ]);
    authStore.setInitialized();

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Logout user and clear auth data
 */
export const logout = async (): Promise<void> => {
  await authStore.clear();
};

/**
 * Check if user is authenticated
 * @returns Boolean indicating if user has a valid token
 */
export const isAuthenticated = (): boolean => {
  const authStore = AuthStore.getInstance();
  return !!authStore.getToken() && authStore.isInitialized();
};

/**
 * Get current user data
 * @returns The current user data or null
 */
export const getCurrentUser = (): UserData | null => {
  return authStore.getUser();
};

/**
 * Format the join date from ISO format to a more readable format
 * @param isoDate ISO date string from API
 * @returns Formatted date string (DD/MM/YYYY)
 */
export const formatJoinDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

/**
 * Get current authentication token
 * @returns The current access token or null
 */
export const getToken = (): string | null => {
  return authStore.getToken();
};

/**
 * Refresh the access token using the refresh token
 * @returns Promise with new tokens
 */
export const refreshToken = async (): Promise<{
  token: string;
  refreshToken: string;
}> => {
  try {
    const currentRefreshToken = authStore.getRefreshToken();

    if (!currentRefreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: currentRefreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();

    // Update stored tokens
    authStore.setToken(data.token);
    authStore.setRefreshToken(data.refreshToken);

    return {
      token: data.token,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    // Force logout on refresh token failure
    logout();
    throw error;
  }
};

/**
 * Create an authenticated fetch function that automatically includes the auth token
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Promise with fetch response
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 errors (unauthorized) - token might be expired
    if (response.status === 401) {
      // Try to refresh the token
      try {
        await refreshToken();
        const newToken = getToken();

        // Retry the request with the new token
        if (newToken) {
          const newHeaders = {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
          };

          return fetch(url, {
            ...options,
            headers: newHeaders,
          });
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // If refresh fails, redirect to login
        logout();
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export default {
  login,
  logout,
  isAuthenticated,
  getToken,
  refreshToken,
  authenticatedFetch,
};
