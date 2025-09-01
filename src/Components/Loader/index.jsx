import React from 'react'
import { Spinner } from 'react-bootstrap'

function Loader() {
    return (
        <div className='caricamento-sfondo'>
            <div className='caricatore'>
                <Spinner animation="grow" />
            </div>
        </div>
    )
}

export default Loader