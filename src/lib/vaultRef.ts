/** Shared mutable ref so any store can get the current vault path without importing vaultStore. */
export const vaultRef = { path: null as string | null };
