import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

const connectionString = (import.meta.env.VITE_NEON_CONNECTION_STRING as string | undefined)?.trim();

let client: NeonQueryFunction<false, false> | null = null;

if (connectionString) {
  try {
    client = neon(connectionString, { disableWarningInBrowsers: true });
  } catch (error) {
    console.error('[TITANS FC] Invalid VITE_NEON_CONNECTION_STRING.', error);
  }
}

/**
 * Neon HTTP query function. `null` when the project is not configured, in which
 * case the app keeps working with its built-in localStorage database (see `db.ts`).
 */
export const sql = client;

export const isNeonEnabled = sql !== null;
