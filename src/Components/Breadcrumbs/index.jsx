import React from 'react'
import { BlocksIcon, CubeIcon, SideBarIcon } from '../../Assets/SVGs'

function Breadcrumbs({ sidebarOpen, setSidebarOpen, isMobile }) {
    return (
        <div className='breadcrumbs d-flex justify-content-start align-items-center'>
            {isMobile && <span className='px-3' onClick={() => setSidebarOpen(!sidebarOpen)} ><SideBarIcon /></span>}
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item cursor-pointer"><BlocksIcon /> <span className='ms-2'>Lev1</span></li>
                    <li className="breadcrumb-item cursor-pointer"><CubeIcon /><span className='ms-2'>Lev2</span></li>
                    <li className="breadcrumb-item cursor-pointer"><span>Lev3</span></li>
                    <li className="breadcrumb-item cursor-pointer"><span className='fw-bold'>Lev4</span></li>
                </ol>
            </nav>

        </div>
    )
}

export default Breadcrumbs