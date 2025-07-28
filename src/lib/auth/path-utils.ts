// Path checking utilities for authentication and layout logic

// Test List Routes
const TEST_LIST_ROUTES = [
  '/test',
];

const PASSING_REQUIRED_ROUTES = [
  '/form',
];

const PREMIUM_TEST_ROUTES = [
  '/test/challenge',
  '/test/practice',
  '/test/live',
];

const STUDENT_ROUTES = [
  '/student',
  '/form',
  '/complete-profile',
  ...TEST_LIST_ROUTES,
];

const ADMIN_ROUTES = [
  '/admin',
];

export const PRIVATE_PATHS = [
  ...STUDENT_ROUTES,
  ...ADMIN_ROUTES,
];

export const NON_PREMIUM_STUDENT_ROUTES = [
  '/test',
  '/form',
  '/complete-profile',
];

export const PREMIUM_ROUTES = [
  ...STUDENT_ROUTES.filter(
    (route) => !NON_PREMIUM_STUDENT_ROUTES.includes(route)
  ),
  ...PREMIUM_TEST_ROUTES,
];

export const LOGIN_ROUTES = ['/login', '/signup'];

export function isPremiumPath(path: string) {
  return PREMIUM_ROUTES.some(route => path.startsWith(route));
}

export function isPassingRequiredPath(path: string) {
  return PASSING_REQUIRED_ROUTES.some(route => path.startsWith(route));
}

export function isPrivatePath(path: string) {
  return PRIVATE_PATHS.some(privatePath => path.startsWith(privatePath));
}

export function isAdminPath(path: string) {
  return ADMIN_ROUTES.some(route => path.startsWith(route));
}

export function isStudentPath(path: string) {
  return STUDENT_ROUTES.some(route => path.startsWith(route));
}

export function isTestPagePath(path: string) {
  const routeSegments = path.split('/');
  return routeSegments.length === 4 && routeSegments[1] === 'test';
}

export function isTestListPath(path: string) {
  return TEST_LIST_ROUTES.some(route => path.startsWith(route));
}

export function isLoginRoute(path: string) {
  return LOGIN_ROUTES.some(route => path.startsWith(route));
}