import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function DeleteStatusModal({ show, handleClose, roleName, statusKey, MainData, setEpWorkflowjson, updateCanvasSize }) {
    const getStatusTitle = (statusKey) => {
        const workflowIndex = MainData.findIndex((elem) => elem.ajWFStatiName || elem.workflowmapping);
        if (workflowIndex !== -1 && MainData[workflowIndex].ajWFStatiName?.[statusKey]) {
            return MainData[workflowIndex].ajWFStatiName[statusKey].title;
        }
        return statusKey; // Fallback to key if title not found
    };

    const handleDelete = () => {
        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === roleName);
        if (roleIndex === -1) {
            console.error('Role not found:', roleName);
            return;
        }

        const role = updatedData[roleIndex];
        if (!role.pulsantiAttivi) {
            console.error('No statuses found for role:', roleName);
            return;
        }

        delete role.pulsantiAttivi[statusKey];

        const workflowIndex = updatedData.findIndex((item) => item.workflowmapping);
        if (workflowIndex !== -1) {
            updatedData[workflowIndex].workflowmapping = updatedData[workflowIndex].workflowmapping.map((wf) => ({
                ...wf,
                statoDestinazione: wf.statoDestinazione === statusKey ? '' : wf.statoDestinazione,
            }));
        }

        updatedData.forEach((faculty) => {
            if (faculty.azioni) {
                faculty.azioni.forEach((action) => {
                    action.listArray.forEach((item) => {
                        if (item.status === statusKey) {
                            item.status = '';
                        }
                    });
                });
            }
        });

        setEpWorkflowjson(JSON.stringify(updatedData));
        updateCanvasSize();
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered size='xl' className='detele-Modal'>
            <Modal.Header closeButton>
                <Modal.Title className='fs-5'>Elimina <span className='fw-bold'> Stato</span></Modal.Title>
            </Modal.Header>
            <Modal.Body className='text-center'>
                Sei sicuro di voler eliminare lo Stato <br />
                <span className='fw-bold'>{getStatusTitle(statusKey)}</span>?
            </Modal.Body>
            <Modal.Footer className='d-flex justify-content-center mb-3'>
                <Button variant="outline-danger" onClick={handleDelete}>
                    Elimina Stato
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteStatusModal;