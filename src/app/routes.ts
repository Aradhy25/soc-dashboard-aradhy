import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import MainLayout from './layout/main-layout';

const Dashboard = lazy(() => import('./pages/dashboard'));
const Alerts = lazy(() => import('./pages/alerts'));
const Logs = lazy(() => import('./pages/logs'));
const Network = lazy(() => import('./pages/network'));
const Users = lazy(() => import('./pages/users'));
const Endpoints = lazy(() => import('./pages/endpoints'));
const ThreatIntel = lazy(() => import('./pages/threat-intel'));
const IncidentResponse = lazy(() => import('./pages/incident-response'));
const Reports = lazy(() => import('./pages/reports'));
const Settings = lazy(() => import('./pages/settings'));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "alerts", Component: Alerts },
      { path: "logs", Component: Logs },
      { path: "network", Component: Network },
      { path: "users", Component: Users },
      { path: "endpoints", Component: Endpoints },
      { path: "threat-intel", Component: ThreatIntel },
      { path: "incidents", Component: IncidentResponse },
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
    ],
  },
]);
