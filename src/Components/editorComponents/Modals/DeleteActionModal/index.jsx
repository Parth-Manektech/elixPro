import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function DeleteActionModal({ show, handleClose, roleName, actionTitle, MainData, setEpWorkflowjson }) {
    const handleDelete = () => {
        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === roleName);
        if (roleIndex === -1) {
            console.error('Role not found:', roleName);
            return;
        }

        const role = updatedData[roleIndex];
        if (!role.azioni) {
            console.error('No actions found for role:', roleName);
            return;
        }

        const actionIndex = role.azioni.findIndex((action) => action.title === actionTitle);
        if (actionIndex === -1) {
            console.error('Action not found:', actionTitle);
            return;
        }

        const actionKeys = role.azioni[actionIndex].listArray.map((item) => item.key);
        role.azioni.splice(actionIndex, 1);

        const workflowIndex = updatedData.findIndex((item) => item.workflowmapping);
        if (workflowIndex !== -1) {
            updatedData[workflowIndex].workflowmapping = updatedData[workflowIndex].workflowmapping.filter(
                (wf) => !actionKeys.includes(wf.keyAzione)
            );
        }

        updatedData.forEach((faculty) => {
            if (faculty.pulsantiAttivi) {
                Object.keys(faculty.pulsantiAttivi).forEach((statusKey) => {
                    actionKeys.forEach((actionKey) => {
                        delete faculty.pulsantiAttivi[statusKey][actionKey];
                    });
                });
            }
        });

        setEpWorkflowjson(JSON.stringify(updatedData));
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered size='xl' className='detele-Modal'>
            <Modal.Header closeButton>
                <Modal.Title className='fs-5'>Elimina <span className='fw-bold'> Categoria azione</span></Modal.Title>
            </Modal.Header>
            <Modal.Body className='text-center'>
                Sei sicuro di voler eliminare la Categoria azione <br />
                <span className='fw-bold'>{actionTitle}</span> e tutte le sue azioni?
            </Modal.Body>
            <Modal.Footer className='d-flex justify-content-center mb-3'>
                <Button variant="outline-danger" onClick={handleDelete}>
                    Elimina Categoria azione
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteActionModal;