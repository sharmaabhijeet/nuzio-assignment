export const SESSION_COOKIE_NAME = 'nuzio_session';
export const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export function sessionCookieOptions(production) {
  return { httpOnly: true, sameSite: 'strict', secure: production, path: '/' };
}
