import { RouteDefinition } from '../types';

export const authRoutes = {
  login: {
    id: 'login',
    name: 'Log In',
    path: '/login',
    title: 'Log In',
    description: 'Sign in to your PartsPeddle account.',
    visibility: 'public',
    layout: 'auth',
    sitemap: false,
  },
  register: {
    id: 'register',
    name: 'Register',
    path: '/register',
    title: 'Register',
    description: 'Create a PartsPeddle account.',
    visibility: 'public',
    layout: 'auth',
    sitemap: false,
  },
  forgotPassword: {
    id: 'forgot-password',
    name: 'Forgot Password',
    path: '/forgot-password',
    title: 'Forgot Password',
    description: 'Reset your PartsPeddle password.',
    visibility: 'public',
    layout: 'auth',
    sitemap: false,
  },
} satisfies Record<string, RouteDefinition>;
