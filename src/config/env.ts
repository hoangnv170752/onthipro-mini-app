/**
 * Environment configuration for Ôn Thi Pro Mini App
 * Handles different API URLs for development and production
 */

// Determine if we're in development or production
// Check for localhost or if we're running in a development environment
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

// For Zalo Mini App, we need to use the direct URL regardless of environment
// This is because the proxy only works in local development, not in the Zalo Mini App environment
const isZaloMiniApp = window.location.hostname.includes('zdn.vn') || 
                      window.location.hostname.includes('zalo.me');

// API URLs
export const API_BASE_URL = isDevelopment && !isZaloMiniApp
  ? '/api'  // Use proxy in development (configured in vite.config.js)
  : 'https://onthipro-backend.onrender.com';  // Direct URL in production and Zalo Mini App

// App configuration
export const APP_CONFIG = {
  appName: 'Ôn Thi Pro',
  apiUrl: API_BASE_URL,
  isDevelopment,
  isZaloMiniApp
};

export default APP_CONFIG;
