/**
 * UPI Feature Flags
 * Centralized feature flag management for UPI functionality
 */

export const ENABLE_UPI_AUTOSYNC = 
  (import.meta.env.VITE_ENABLE_UPI_AUTOSYNC === 'true');

// Default behavior: keep VITE_ENABLE_UPI_AUTOSYNC unset/false in .env.production
// so AutoSync is DISABLED by default until we explicitly turn it on.
