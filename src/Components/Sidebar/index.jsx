import React from 'react'
import { DownArrowIcon, GearIcon, Iicon, SideBarIcon } from '../../Assets/SVGs'

function Sidebar({ isMobile, sidebarOpen, setSidebarOpen }) {
    return (
        <div className='sidebar'>
            <div className='s_space_view d-flex justify-content-between  align-items-center px-3'>
                {(isMobile || !sidebarOpen) &&
                    <div className='d-flex justify-content-center align-items-center gap-1 cursor-pointer'>
                        <span className='fw-bold'>
                            Space title
                        </span>
                        <DownArrowIcon height={18} width={18} fill='#212529' />
                    </div>
                }

                <span className='cursor-pointer' onClick={() => setSidebarOpen(!sidebarOpen)} ><SideBarIcon /></span>
            </div>


            {(isMobile || !sidebarOpen) ? <>
                <div className='s_navigation d-flex flex-column align-items-center'>
                    <span className='d-flex flex-row justify-content-center align-items-center'>↓↓ SCROLL HERE ↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓</span>
                    <span>↓↓↓↓</span>

                </div>
                <div className='s_footer d-flex justify-content-center align-items-center gap'>
                    <span className='w-50 d-flex justify-content-center align-items-center gap-2 cursor-pointer'><Iicon height={20} width={20} fill='#6C757D' /><span>Versione</span></span>
                    <span className='h_line'></span>
                    <span className='w-50 d-flex justify-content-center align-items-center gap-2 cursor-pointer'><GearIcon height={20} width={20} /><span>Aiuto</span></span>

                </div>
            </> : <>
                <div className='s_navigation d-flex flex-column align-items-center'></div>
                <div className='s_footer_none'></div>
            </>}

        </div>
    )
}

export default Sidebar