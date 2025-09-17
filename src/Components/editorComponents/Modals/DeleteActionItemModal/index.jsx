import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function DeleteActionItemModal({ show, handleClose, roleName, actionTitle, actionItem, MainData, setEpWorkflowjson }) {
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

        const actionArray = role.azioni[actionIndex].listArray;
        const itemIndex = actionArray.findIndex((item) => item.key === actionItem.key);
        if (itemIndex === -1) {
            console.error('Action item not found:', actionItem.key);
            return;
        }

        actionArray.splice(itemIndex, 1);

        const workflowIndex = updatedData.findIndex((item) => item.workflowmapping);
        if (workflowIndex !== -1) {
            updatedData[workflowIndex].workflowmapping = updatedData[workflowIndex].workflowmapping.filter(
                (wf) => wf.keyAzione !== actionItem.key
            );
        }

        updatedData.forEach((faculty) => {
            if (faculty.pulsantiAttivi) {
                Object.keys(faculty.pulsantiAttivi).forEach((statusKey) => {
                    delete faculty.pulsantiAttivi[statusKey][actionItem.key];
                });
            }
        });

        setEpWorkflowjson(JSON.stringify(updatedData));
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered size='xl' className='detele-Modal'>
            <Modal.Header closeButton>
                <Modal.Title className='fs-5'>Elimina <span className='fw-bold'> Azione</span></Modal.Title>
            </Modal.Header>
            <Modal.Body className='text-center'>
                Sei sicuro di voler eliminare l' Azione <br />
                <span className='fw-bold'>{actionItem?.title}</span>?
            </Modal.Body>
            <Modal.Footer className='d-flex justify-content-center mb-3'>
                <Button variant="outline-danger" onClick={handleDelete}>
                    Elimina Azione
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteActionItemModal;