import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

// Initialize Posthog
export function initAnalytics() {
  if (!POSTHOG_KEY) {
    console.warn('Posthog key not found - analytics disabled');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: false, // We'll track events manually for better control
    capture_pageview: false, // We'll handle this manually
    disable_session_recording: false, // Enable session replay
    persistence: 'localStorage',
    
    // Privacy settings
    respect_dnt: true, // Respect Do Not Track
    opt_out_capturing_by_default: false,
  });

  console.log('✅ Analytics initialized');
}

// Identify user (call after login)
export function identifyUser(userId: string, traits?: {
  email?: string;
  displayName?: string;
  hasPro?: boolean;
  avatarId?: string;
}) {
  if (!POSTHOG_KEY) return;
  posthog.identify(userId, traits);
}

// Reset user (call after logout)
export function resetUser() {
  if (!POSTHOG_KEY) return;
  posthog.reset();
}

// Track custom events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!POSTHOG_KEY) return;
  posthog.capture(eventName, properties);
}

// Track page views
export function trackPageView(pageName: string) {
  if (!POSTHOG_KEY) return;
  posthog.capture('$pageview', { page: pageName });
}

// Feature flags (for A/B testing later)
export function getFeatureFlag(flagKey: string): boolean {
  if (!POSTHOG_KEY) return false;
  return posthog.isFeatureEnabled(flagKey) || false;
}

// Opt user out (for GDPR compliance)
export function optOut() {
  if (!POSTHOG_KEY) return;
  posthog.opt_out_capturing();
}

// Opt user back in
export function optIn() {
  if (!POSTHOG_KEY) return;
  posthog.opt_in_capturing();
}