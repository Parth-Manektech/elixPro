import React from 'react'
import { Spinner } from 'react-bootstrap'

function Loader() {
    return (
        <div className='main_loader d-flex justify-content-center align-items-center'>
            <Spinner animation="grow" />
        </div>
    )
}

export default Loader