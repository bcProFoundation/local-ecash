import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import '../App.css';

const TanStackRouterDevtools = () => {
  if (process.env.NODE_ENV === 'production') return null; // Render nothing in production

  lazy(() =>
    // Lazy load in development
    import('@tanstack/router-devtools').then((res) => ({
      default: res.TanStackRouterDevtools,
      // For Embedded Mode
      // default: res.TanStackRouterDevtoolsPanel
    }))
  );
};

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  )
});

