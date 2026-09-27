// Web implementation of the storage utility.
// Uses localStorage instead of expo-secure-store (which is native-only).
// localStorage is synchronous but we expose the same async interface so
// the rest of the codebase doesn't need to know about the platform.

const TOKEN_KEY = 'bam_bam_customer_token';

export const storage = {
  async getToken(): Promise<string | null> {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async setToken(token: string): Promise<void> {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Storage may be blocked (private browsing, quota exceeded)
    }
  },
  async clearToken(): Promise<void> {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // best-effort
    }
  }
};
