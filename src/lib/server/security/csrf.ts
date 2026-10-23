// BOHOK Phase 9 — CSRF & Origin Verification Helper
// Validates Origin/Referer headers on state-mutating requests

export const CsrfGuard = {
  /**
   * Validates request origin against allowed hostnames
   */
  validateRequestOrigin(request: Request): { valid: boolean; reason?: string } {
    const method = request.method.toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return { valid: true };
    }

    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    // If host is present and origin is provided, verify match
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host === host || originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1') {
          return { valid: true };
        }
        return { valid: false, reason: `Origin header mismatch: ${origin} vs ${host}` };
      } catch {
        return { valid: false, reason: 'Malformed origin header' };
      }
    }

    // Check Referer if Origin is omitted
    if (referer && host) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host === host || refererUrl.hostname === 'localhost' || refererUrl.hostname === '127.0.0.1') {
          return { valid: true };
        }
        return { valid: false, reason: `Referer header mismatch: ${referer} vs ${host}` };
      } catch {
        return { valid: false, reason: 'Malformed referer header' };
      }
    }

    // In local dev/testing without origin, pass cleanly
    return { valid: true };
  },
};
