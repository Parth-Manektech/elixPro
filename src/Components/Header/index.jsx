import React from 'react'
import ConsoleImage from "../../Assets/Images/consoleTitle.png"
import { AppIconHeader, CircleUser, SearchIcon } from '../../Assets/SVGs'

function Header({ isMobile }) {
    return (
        <div className={`header ${isMobile ? 'flex-column header_mobile' : 'flex-row header_big'} d-flex justify-content-center align-items-center`}>
            <div className='icon_container d-flex align-items-center justify-content-start ps-4 '>
                <img src={ConsoleImage} className='cursor-pointer' alt="Console_Image" />
            </div>
            <div className='navbar d-flex justify-content-center align-items-center flex-nowrap'>
                <div className='h_SEARCH d-flex justify-content-center align-items-center'>
                    <div className="input-group">
                        <span className="input-group-text" id="basic-addon1"><SearchIcon height={20} width={25} fill='#ffffff' /></span>
                        <input type="text" className="form-control" placeholder="Master research..." />
                    </div>
                </div>
                <div className='h_APP px-4 d-flex justify-content-center align-items-center cursor-pointer'><AppIconHeader /></div>
                <div className='h_PROFILE px-4 d-flex justify-content-center align-items-center cursor-pointer'>
                    <CircleUser />
                    <span className='text-nowrap mx-4'>J. Doe</span>
                </div>
            </div>
        </div>
    )
}

export default Header