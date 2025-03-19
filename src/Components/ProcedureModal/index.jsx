import React, { useState } from 'react'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Modal from 'react-bootstrap/Modal';
import DaZeroModalForm from './DaZero';
import GeneradaJSON from './GeneradaJSON';
import ImportaDaExcel from './ImportaDaExcel';

function ProcedureModal({ show, setShow }) {
    const [key, setKey] = useState('Da-zero');
    return (
        <>
            <Modal
                show={show}
                onHide={() => setShow(false)}
                dialogClassName="modal-80w"
                aria-labelledby="example-custom-modal-styling-title"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-lg">
                        Nuovo Procedimento
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs
                        id="controlled-tab-example"
                        activeKey={key}
                        onSelect={(k) => setKey(k)}
                        className="mb-3"
                    >
                        <Tab eventKey="Da-zero" title="Da zero">
                            <DaZeroModalForm />
                        </Tab>
                        <Tab eventKey="Genera-da-JSON" title="Genera da JSON">
                            <GeneradaJSON />
                        </Tab>
                        <Tab eventKey="Importa-da-Excel" title="Importa da Excel" >
                            <ImportaDaExcel />
                        </Tab>
                    </Tabs>
                </Modal.Body>
            </Modal >
        </>
    )
}

export default ProcedureModal