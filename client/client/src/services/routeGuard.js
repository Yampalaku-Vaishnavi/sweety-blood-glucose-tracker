const publicRoutes = ['/login', '/signup'];
const protectedRoutes = ['/dashboard', '/profile', '/readings/new', '/history', '/reports'];
const appRoutes = [...publicRoutes, ...protectedRoutes];

export function resolveRouteRedirect(pathname, isAuthenticated) {
  if (pathname === '/') return isAuthenticated ? '/dashboard' : '/login';
  if (protectedRoutes.includes(pathname) && !isAuthenticated) return '/login';
  if (publicRoutes.includes(pathname) && isAuthenticated) return '/dashboard';
  if (!appRoutes.includes(pathname)) return isAuthenticated ? '/dashboard' : '/login';
  return null;
}
