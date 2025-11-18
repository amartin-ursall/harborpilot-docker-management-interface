import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { DashboardPage } from '@/pages/DashboardPage';
import { ContainersPage } from '@/pages/ContainersPage';
import { ImagesPage } from '@/pages/ImagesPage';
import { VolumesPage } from '@/pages/VolumesPage';
import { NetworksPage } from '@/pages/NetworksPage';
import { GlobalLogsPage } from '@/pages/GlobalLogsPage';
import { SettingsPage } from '@/pages/SettingsPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "containers", element: <ContainersPage /> },
      { path: "images", element: <ImagesPage /> },
      { path: "volumes", element: <VolumesPage /> },
      { path: "networks", element: <NetworksPage /> },
      { path: "logs", element: <GlobalLogsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ]
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)