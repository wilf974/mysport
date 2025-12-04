/**
 * Logger utility for managing console output based on environment
 * Suppresses logs in production, keeps them in development
 */

const isProduction = process.env.NODE_ENV === 'production';
const isDebugMode = process.env.REACT_APP_DEBUG_MODE === 'true';

const logger = {
  log: (message, data) => {
    if (!isProduction || isDebugMode) {
      console.log(message, data);
    }
  },

  error: (message, error) => {
    // Always log errors
    console.error(message, error);
  },

  warn: (message, data) => {
    if (!isProduction || isDebugMode) {
      console.warn(message, data);
    }
  },

  debug: (message, data) => {
    if (!isProduction && isDebugMode) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  info: (message, data) => {
    if (!isProduction || isDebugMode) {
      console.info(message, data);
    }
  }
};

export default logger;
