// src/App.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";

import Dashboard from "@pages/Dashboard";
import MasterLayout from "@components/layouts/MasterLayout";
import Analysis from "@pages/Analysis";
import MeterDetail from "@pages/MeterDetail";
import Map from "@pages/Map";
import Billing from "@pages/Billing";
import Prediction from "@pages/Prediction";
import AdminDashboard from "@pages/AdminDashboard";
import SuperAdminDashboard from "@pages/SuperAdminDashboard";
import { useMeterStore } from "@stores/meterStore";
import MapAdmin from "@pages/MapAdmin";
import { useLatestDataStore } from "@stores/latestDataStore";
import ProtectedRoute from "@components/auth/ProtectedRoute";
import Profile from "./pages/Profile";

/*
 * Application Routes
 */

const router = createBrowserRouter([
  {
    element: <MasterLayout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
        handle: { title: "Dashboard" },
      },
      {
        path: "/analysis",
        element: <Analysis />,
        handle: { title: "Analysis" },
      },
      {
        path: "/prediction",
        element: <Prediction />,
        handle: { title: "Prediction" },
      },
      {
        path: "/map",
        element: <Map />,
        handle: { title: "Map" },
      },
      {
        path: "/map/admin",
        element: (<ProtectedRoute requireAuth>
          <MapAdmin />
        </ProtectedRoute>),
        handle: { title: "Map Admin" },
      },
      {
        path: "/meter/:meterId",
        element: <MeterDetail />,
        handle: { title: "Meter Details" },
      },
      {
        path: "/billing",
        element: <Billing />,
        handle: { title: "Billing" },
      },
      {
        path: "/profile",
        element: (<ProtectedRoute requireAuth><Profile /></ProtectedRoute>),
        handle: { title: "User Profile" },

      },
      // Admin Routes
      {
        path: "/admin/dashboard",
        element: (
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        ),
        handle: { title: "Admin Dashboard" },
      },
      {
        path: "/admin/super-admin-dashboard",
        element: (
          <ProtectedRoute requireSuperAdmin>
            <SuperAdminDashboard />
          </ProtectedRoute>
        ),
        handle: { title: "Super Admin Dashboard" },
      },
    ],
  },
]);

export default function App() {
  const { fetchMeters, meters } = useMeterStore();
  const { fetchLatestData } = useLatestDataStore();

  useEffect(() => {
    fetchMeters();
  }, [fetchMeters]);

  useEffect(() => {
    if (meters.length > 0) {
      fetchLatestData();
      const intervalId = setInterval(() => {
        fetchLatestData();
      }, 5 * 60 * 1000);

      return () => clearInterval(intervalId);
    }
  }, [meters.length, fetchLatestData]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}