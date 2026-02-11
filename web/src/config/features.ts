export const FEATURES = {
  LEAGUES: true,      // Toggle to enable for everyone
  CHALLENGES: false,   // Toggle to enable for everyone
} as const;

// Pro features that require upgrade (when enabled)
export const PRO_FEATURES = {
  LEAGUES: true,
  CHALLENGES: true,
} as const;

// Whitelist of user IDs who get Pro features for free (beta testers, etc)
export const PRO_WHITELIST: string[] = [  // ← Changed from `as const` to `: string[]`
  'xY92P6mRmra3VtXj9Rs1azmVC412', // Your user ID
  // Add more user IDs here
];

/**
 * Check if a user has Pro access
 */
export function hasProAccess(userId: string | undefined, hasPurchased: boolean = false): boolean {
  if (!userId) return false;
  
  // Whitelist users always have access
  if (PRO_WHITELIST.includes(userId)) return true;
  
  // Check if they've purchased Pro
  return hasPurchased;
}

/**
 * Check if a specific feature requires Pro
 */
export function requiresPro(feature: keyof typeof PRO_FEATURES): boolean {
  return PRO_FEATURES[feature];
}