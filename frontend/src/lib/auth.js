import { jwtDecode } from 'jwt-decode';

// JWT payload shape (section 3.3):
// { userId, role, name, branchId, permissions: ["invoices:read", ...], iat, exp }

export function decodeToken(token) {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function getTokenFromCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )accessToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getCurrentUser() {
  const token = getTokenFromCookie();
  return decodeToken(token);
}

export function isTokenExpired(payload) {
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
}

// Client-side permission check — for conditional UI rendering ONLY.
// The server enforces real permissions on every request (section 2).
export function hasPermission(user, resource, action) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const perms = user.permissions || [];
  return perms.includes(`${resource}:${action}`) || perms.includes(`${resource}:*`);
}

export function hasRole(user, ...roles) {
  if (!user) return false;
  return roles.includes(user.role);
}

// Default dashboard route per role (section 3.4)
export const ROLE_HOME = {
  admin: '/dashboard/admin',
  trip_manager: '/dashboard/trips',
  finance_manager: '/dashboard/finance',
  account_manager: '/dashboard/accounts/clients',
  driver: '/dashboard/driver',
};

export function roleHome(role) {
  return ROLE_HOME[role] || '/dashboard/admin';
}

// Set / clear the demo access cookie (client-side helper for the standalone demo).
export function setDemoSession(token) {
  if (typeof document === 'undefined') return;
  document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=86400; samesite=lax`;
}

export function clearSession() {
  if (typeof document === 'undefined') return;
  document.cookie = 'accessToken=; path=/; max-age=0';
}

// Build a demo JWT (unsigned) so the standalone app can route by role without a backend.
export function buildDemoToken(role, name = 'Demo User') {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      userId: 1,
      role,
      name,
      branchId: 1,
      permissions: [],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  );
  return `${header}.${payload}.demo`;
}
