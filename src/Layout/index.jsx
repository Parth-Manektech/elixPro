import React, { Suspense } from 'react'
import Header from '../Components/Header'
import Loader from '../Components/Loader'
import Sidebar from '../Components/Sidebar'
import Breadcrumbs from '../Components/Breadcrumbs'



export default function MainLayout({ children }) {
  return (
    <div className='main-layout'>
      <Header />
      <div className='sub_layout'>

        <div className='sidebar_container'>
          <Sidebar />
        </div>

        <div className='main_container'>
          <div className='breadcrums_container'>
            <Breadcrumbs />
          </div>
          <div className='page_container'>
            <Suspense fallback={<Loader />}>
              <main>{children}</main>
            </Suspense>
          </div>
        </div>
      </div>

    </div>
  )
}
