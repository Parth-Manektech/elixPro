import React from 'react'
import { ArrowSidebySide, AzioniIcon, BlocksIcon, DownArrowIcon, GearIcon, Iicon, ListeIcon, RuoliIcon, SideBarIcon, StatiIcon } from '../../Assets/SVGs'
import { useNavigate } from 'react-router-dom'

function Sidebar({ isMobile, sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate()
    function getLastUrlSegment() {
        // Get the current URL pathname
        const pathname = window.location.pathname;

        // Split the path by '/' and filter out empty strings
        const segments = pathname.split('/').filter(segment => segment !== '');

        // Return the last segment
        return segments[segments.length - 1];
    }

    return (
        <div className='sidebar'>
            <div className='s_space_view d-flex justify-content-between  align-items-center px-3'>
                {(isMobile || !sidebarOpen) &&
                    <div className='d-flex justify-content-center align-items-center gap-1 cursor-pointer'>
                        <span className='fw-bold'>
                            Procedimenti
                        </span>
                        <DownArrowIcon height={18} width={18} fill='#212529' />
                    </div>
                }

                <span className='cursor-pointer' onClick={() => setSidebarOpen(!sidebarOpen)} ><SideBarIcon /></span>
            </div>


            {(isMobile || !sidebarOpen) ? <>
                <div className='s_navigation d-flex flex-column align-items-center'>

                    <div className='s-title d-flex align-items-center border-bottom py-2 ps-4 mt-1 cursor-pointer' onClick={() => navigate('/')}>
                        <BlocksIcon /><span className='ms-2'>Tutti i procedimenti</span>
                    </div>
                    <div className='navs d-flex flex-column mt-3'>
                        <span className='ntitle'>Procedimento X</span>

                        <div className='d-flex flex-column gap-2'>
                            <div className={`navItems ${getLastUrlSegment() === 'stati' ? 'navItemsactive' : ''}`} onClick={() => navigate('/tutti-i-procedimenti/procedimento-x/stati')} ><span><StatiIcon className='me-2' color={getLastUrlSegment() === 'stati' ? '#0D6EFD' : '#212529'} />Stati</span> <span className='chip'>18</span></div>
                            <div className={`navItems ${getLastUrlSegment() === 'ruoli' ? 'navItemsactive' : ''}`} onClick={() => navigate('/tutti-i-procedimenti/procedimento-x/ruoli')} ><span><RuoliIcon className='me-2' color={getLastUrlSegment() === 'ruoli' ? '#0D6EFD' : '#212529'} />Ruoli</span> <span className='chip'>4</span></div>
                            <div className={`navItems ${getLastUrlSegment() === 'liste' ? 'navItemsactive' : ''}`} onClick={() => navigate('/tutti-i-procedimenti/procedimento-x/liste')} ><span><ListeIcon className='me-2' color={getLastUrlSegment() === 'liste' ? '#0D6EFD' : '#212529'} />Liste</span> <span className='chip'>12</span></div>
                            <div className={`navItems ${getLastUrlSegment() === 'azioni' ? 'navItemsactive' : ''}`} onClick={() => navigate('/tutti-i-procedimenti/procedimento-x/azioni')} ><span><AzioniIcon className='me-2' color={getLastUrlSegment() === 'azioni' ? '#0D6EFD' : '#212529'} />Azioni</span> <span className='chip'>20</span></div>
                            <div className={`navItems ${getLastUrlSegment() === 'editor' ? 'navItemsactive' : ''}`} onClick={() => navigate('/tutti-i-procedimenti/procedimento-x/editor')} ><span><ArrowSidebySide className='me-2' color={getLastUrlSegment() === 'editor' ? '#0D6EFD' : '#212529'} />Editor (alpha)</span> <span className=''></span></div>
                        </div>

                    </div>


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