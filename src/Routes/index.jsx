import React, { Suspense } from 'react'
import { Route, BrowserRouter, Routes, Navigate, Outlet } from 'react-router-dom'
import MainLayout from '../Layout'
import RoutesDetails from './Router'
import Loader from '../Components/Loader'

function AllRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout><Outlet /></MainLayout>}>
          {RoutesDetails?.map(({ path, Component, exact }) => {
            return (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense fallback={<Loader />}>
                    <Component />
                  </Suspense>
                }
                exact={exact}
              />
            )
          })}
        </Route>
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </BrowserRouter>
  )
}
export default React.memo(AllRoutes)