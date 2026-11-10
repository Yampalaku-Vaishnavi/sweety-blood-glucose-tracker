const publicRoutes = ['/login', '/signup'];
const appRoutes = [...publicRoutes, '/dashboard'];

export function resolveRouteRedirect(pathname, isAuthenticated) {
  if (pathname === '/') return isAuthenticated ? '/dashboard' : '/login';
  if (pathname === '/dashboard' && !isAuthenticated) return '/login';
  if (publicRoutes.includes(pathname) && isAuthenticated) return '/dashboard';
  if (!appRoutes.includes(pathname)) return isAuthenticated ? '/dashboard' : '/login';
  return null;
}
