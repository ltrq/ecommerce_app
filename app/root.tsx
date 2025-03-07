// app/root.tsx
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import React, { Suspense, useEffect, useState } from 'react';
import { lazy } from 'react';
import type { Route } from './+types/root';
import { UserProvider, useUser } from './context/userContext';
import { ProductProvider } from './context/productContext';
import { CartProvider } from './context/cartContext';
import Chatbox from './components/chatbox';

import './app.css';

const Cart = lazy(() => import('./routes/cart'));
const SignIn = lazy(() => import('./routes/sign-in'));
const SignUp = lazy(() => import('./routes/sign-up'));
const Product = lazy(() => import('./routes/product'));
const User = lazy(() => import('./routes/user'));
const Admin = lazy(() => import('./routes/AdminPanel'));
const E404 = lazy(() => import('./routes/e404'));
const Home = lazy(() => import('./routes/home'));
const Deals = lazy(() => import('./routes/deals'));
const NewArrivals = lazy(() => import('./routes/new-arrivals'));
const Packages = lazy(() => import('./routes/packages'));
const AIChatbox = lazy(() => import('./components/chatbox'));

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Wrapper to handle loading state
const AppContent: React.FC = () => {
  const { loading } = useUser();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading user authentication...
      </div>
    );
  }

  return (
    <ProductProvider>
      <CartProvider>
        <Outlet />
        <Chatbox />
      </CartProvider>
    </ProductProvider>
  );
};

export default function App() {
  console.log('Root Hydration check:', typeof document !== 'undefined');

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen text-gray-600">
          Lazy Loading...
        </div>
      }
    >
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Suspense>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
