import React, { Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import MainLayout from "../Layout";
import RoutesDetails from "./Router";
import Loader from "../Components/Loader";

const routes = [
  {
    path: "/",
    element: <MainLayout><Outlet /></MainLayout>,
    children: RoutesDetails.map(({ path, Component }) => ({
      path: path === "/" ? "/" : path.replace(/^\//, ""),
      element: (
        <Suspense fallback={<Loader />}>
          <Component />
        </Suspense>
      ),
    })),
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
];

const router = createBrowserRouter(routes, {
  basename: "/elixPro_react",
});

function AllRoutes() {
  return <RouterProvider router={router} />;
}

export default React.memo(AllRoutes);
