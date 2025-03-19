import React, { useState } from 'react'
import HomeResearch from '../../Components/HomeResearch'
import ProcedureModal from '../../Components/ProcedureModal';


function TuttiIprocedimenti() {
    const [show, setShow] = useState(false);
    return (
        <>
            <HomeResearch setShow={setShow} show={show} />
            <div className='d-flex flex-column align-items-center fs-2 home-container '>

            </div>

            <ProcedureModal setShow={setShow} show={show} />
        </>
    )
}

export default TuttiIprocedimenti