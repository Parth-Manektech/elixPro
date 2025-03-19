import React from 'react'
import { BlocksIcon, FlowIcon, SideBarIcon } from '../../Assets/SVGs'
import { Link, useLocation } from 'react-router-dom';

function Breadcrumbs({ sidebarOpen, setSidebarOpen, isMobile }) {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    return (
        <div className='breadcrumbs d-flex justify-content-start align-items-center'>
            {isMobile && <span className='px-3' onClick={() => setSidebarOpen(!sidebarOpen)} ><SideBarIcon /></span>}
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    {/* <li className="breadcrumb-item cursor-pointer"><BlocksIcon /> <span className='ms-2'>Lev1</span></li>
                    <li className="breadcrumb-item cursor-pointer"><CubeIcon /><span className='ms-2'>Lev2</span></li>
                    <li className="breadcrumb-item cursor-pointer"><span>Lev3</span></li>
                    <li className="breadcrumb-item cursor-pointer"><span className='fw-bold'>Lev4</span></li> */}

                    {pathnames.map((name, index) => {
                        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                        const isLast = index === pathnames.length - 1;

                        return (
                            <li key={routeTo} className="breadcrumb-item cursor-pointer">
                                {name === 'tutti-i-procedimenti' ? <BlocksIcon className='me-2' /> : name === 'procedimento-x' ? <FlowIcon className='me-2 ' /> : ''}
                                {isLast ? (
                                    <span className="fw-bold">{name?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                                ) : (
                                    <Link to={routeTo} className="text-decoration-none text-dark">
                                        {name?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>

        </div>
    )
}

export default Breadcrumbs