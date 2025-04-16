import React, { Suspense, useState } from 'react';
import Header from '../Components/Header';
import Loader from '../Components/Loader';
import Sidebar from '../Components/Sidebar';
import Breadcrumbs from '../Components/Breadcrumbs';
import useMediaQuery from '../utils/customHooks/mediaQuery';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <div className="main-layout">
      <Header isMobile={isMobile} />

      <div className={`sub_layout ${isMobile ? 'flex-column' : 'flex-row'}`}>
        {/* Breadcrumbs for mobile when sidebar is closed */}
        {isMobile && !sidebarOpen && (
          <div className="breadcrums_container_Mobile">
            <Breadcrumbs
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              isMobile={isMobile}
            />
          </div>
        )}

        {/* Sidebar - always rendered, visibility controlled by classes */}
        <div
          className={`sidebar_container ${isMobile
              ? sidebarOpen
                ? 'sidebar_mobile_open'
                : 'sidebar_mobile_closed'
              : sidebarOpen
                ? 'sidebar_small'
                : 'sidebar_big'
            }`}
        >
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={isMobile}
          />
        </div>

        {/* Main content */}
        <div
          className={`main_container ${isMobile && sidebarOpen ? 'main_container_hidden' : ''
            }`}
        >
          {!isMobile && (
            <div className="breadcrums_container ps-3">
              <Breadcrumbs />
            </div>
          )}
          <div className={isMobile ? 'page_container_mobile' : 'page_container'}>
            <Suspense fallback={<Loader />}>
              <main>{children}</main>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}