/**
 * API Client with retry logic, timeouts, and error handling
 * Provides reliable HTTP requests with automatic retries for failed requests
 */

import axios from 'axios';
import logger from './logger';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504]; // Retriable errors

// Create base axios instance with timeout
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT
});

// Add JWT token to request headers if it exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors by redirecting to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after the specified time
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determine if an error is retriable
 * @param {Error} error - The error to check
 * @returns {boolean} True if the error should be retried
 */
const isRetriableError = (error) => {
  // Network errors are retriable
  if (!error.response) {
    return true;
  }

  // Check if status code is in retriable list
  return RETRY_STATUS_CODES.includes(error.response.status);
};

/**
 * Perform a request with retry logic
 * @param {Function} requestFn - Function that performs the request
 * @param {number} retryCount - Current retry attempt (default 0)
 * @returns {Promise} Promise that resolves with the response data
 */
const withRetry = async (requestFn, retryCount = 0) => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    if (isRetriableError(error) && retryCount < MAX_RETRIES) {
      const delayMs = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      logger.warn(`Request failed, retrying in ${delayMs}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`, error.message);
      await sleep(delayMs);
      return withRetry(requestFn, retryCount + 1);
    }

    // If not retriable or max retries exceeded, throw error
    logger.error('API request failed after retries:', error.message);
    throw error;
  }
};

/**
 * Wrapper around axios.get with retry logic
 * @param {string} url - The URL to GET
 * @param {object} config - Additional axios config
 * @returns {Promise} Promise that resolves with the response data
 */
export const apiGet = (url, config = {}) => {
  return withRetry(() => axiosInstance.get(url, config));
};

/**
 * Wrapper around axios.post with retry logic
 * @param {string} url - The URL to POST to
 * @param {object} data - The data to send
 * @param {object} config - Additional axios config
 * @returns {Promise} Promise that resolves with the response data
 */
export const apiPost = (url, data, config = {}) => {
  return withRetry(() => axiosInstance.post(url, data, config));
};

/**
 * Wrapper around axios.put with retry logic
 * @param {string} url - The URL to PUT to
 * @param {object} data - The data to send
 * @param {object} config - Additional axios config
 * @returns {Promise} Promise that resolves with the response data
 */
export const apiPut = (url, data, config = {}) => {
  return withRetry(() => axiosInstance.put(url, data, config));
};

/**
 * Wrapper around axios.delete with retry logic
 * @param {string} url - The URL to DELETE
 * @param {object} config - Additional axios config
 * @returns {Promise} Promise that resolves with the response data
 */
export const apiDelete = (url, config = {}) => {
  return withRetry(() => axiosInstance.delete(url, config));
};

// Export axiosInstance for direct use with JWT interceptors
export { axiosInstance };

export default {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  axiosInstance
};
