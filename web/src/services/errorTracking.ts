import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.MODE; // 'development' or 'production'

export function initErrorTracking() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not found - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    
    // Only track errors in production
    enabled: ENVIRONMENT === 'production',
    
    // Performance monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true, // Privacy: mask sensitive text
        blockAllMedia: true, // Privacy: don't capture images/video
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // Capture 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Always capture sessions with errors
    
    // Filter out noisy errors
    beforeSend(event, hint) {
      const error = hint.originalException;
      
      // Ignore browser extension errors
      if (error && error.toString().includes('chrome-extension://')) {
        return null;
      }
      
      // Ignore Firebase connection errors (user went offline)
      if (error && error.toString().includes('Failed to get document because the client is offline')) {
        return null;
      }
      
      return event;
    },
  });

  console.log('✅ Error tracking initialized');
}

// Set user context (call after login)
export function setErrorTrackingUser(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

// Clear user context (call after logout)
export function clearErrorTrackingUser() {
  Sentry.setUser(null);
}

// Manually capture an error
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Capture a message (not an error)
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

// Add breadcrumb (track user actions leading to error)
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  });
}