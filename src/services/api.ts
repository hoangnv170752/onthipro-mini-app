/**
 * API service for Ôn Thi Pro
 * Handles API requests with authentication for Zalo Mini App
 */

import { getToken, refreshToken } from './auth';

import { API_BASE_URL } from '@/config/env';

/**
 * Create headers with authentication token
 * @returns Headers object with auth token
 */
const createAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Make an authenticated API request
 * @param endpoint API endpoint
 * @param options Fetch options
 * @returns Promise with response data
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add auth headers to the request
  const headers = {
    ...options.headers,
    ...createAuthHeaders()
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401) {
      try {
        // Try to refresh the token
        await refreshToken();
        
        // Retry the request with new token
        const newHeaders = {
          ...options.headers,
          ...createAuthHeaders()
        };
        
        const retryResponse = await fetch(url, {
          ...options,
          headers: newHeaders
        });
        
        if (!retryResponse.ok) {
          throw new Error(`API error: ${retryResponse.status}`);
        }
        
        return await retryResponse.json();
      } catch (refreshError) {
        // If refresh fails, throw the original error
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * GET request with authentication
 * @param endpoint API endpoint
 * @returns Promise with response data
 */
export const get = <T>(endpoint: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: 'GET' });
};

/**
 * POST request with authentication
 * @param endpoint API endpoint
 * @param data Request body data
 * @returns Promise with response data
 */
export const post = <T>(endpoint: string, data: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

/**
 * PUT request with authentication
 * @param endpoint API endpoint
 * @param data Request body data
 * @returns Promise with response data
 */
export const put = <T>(endpoint: string, data: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

/**
 * DELETE request with authentication
 * @param endpoint API endpoint
 * @returns Promise with response data
 */
export const del = <T>(endpoint: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
};

export default {
  get,
  post,
  put,
  delete: del
};
