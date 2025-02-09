import React, { Suspense, useState } from 'react'
import Header from '../Components/Header'
import Loader from '../Components/Loader'
import Sidebar from '../Components/Sidebar'
import Breadcrumbs from '../Components/Breadcrumbs'
import useMediaQuery from '../utils/customHooks/mediaQuery'



export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  return (
    <div className='main-layout'>
      <Header isMobile={isMobile} />

      <div className={`sub_layout ${isMobile ? `flex-column` : 'flex-row'}`}>
        {(isMobile && !sidebarOpen) && <div className='breadcrums_container_Mobile '>
          <Breadcrumbs sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} />
        </div>
        }
        {!isMobile && <div className={`sidebar_container ${sidebarOpen ? 'sidebar_small' : 'sidebar_big'}`}>
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} />
        </div>}

        <div className={`${(isMobile && sidebarOpen) ? 'main_container_mobile' : 'main_container'}`}>
          {
            isMobile ? <>{
              sidebarOpen ?
                <div className={`sidebar_container`}>
                  <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} />
                </div> :
                <div className='page_container_mobile'>
                  <Suspense fallback={<Loader />}>
                    <main>{children}</main>
                  </Suspense>
                </div>
            }
            </> : <div>
              <div className='breadcrums_container ps-3'>
                <Breadcrumbs />
              </div>
              <div className='page_container'>
                <Suspense fallback={<Loader />}>
                  <main>{children}</main>
                </Suspense>
              </div>
            </div>
          }

        </div>

      </div>

    </div>
  )
}
