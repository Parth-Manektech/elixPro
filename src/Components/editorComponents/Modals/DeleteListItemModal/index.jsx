import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function DeleteListItemModal({ show, handleClose, roleName, listTitle, listItem, MainData, setEpWorkflowjson }) {
    const handleDelete = () => {
        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === roleName);
        if (roleIndex === -1) {
            console.error('Role not found:', roleName);
            return;
        }

        const role = updatedData[roleIndex];
        if (!role.liste) {
            console.error('No lists found for role:', roleName);
            return;
        }

        const listIndex = role.liste.findIndex((list) => list.title === listTitle);
        if (listIndex === -1) {
            console.error('List not found:', listTitle);
            return;
        }

        const listArray = role.liste[listIndex].listArray;
        const itemIndex = listArray.findIndex((item) => item.key === listItem.key);
        if (itemIndex === -1) {
            console.error('List item not found:', listItem.key);
            return;
        }

        listArray.splice(itemIndex, 1);

        const workflowIndex = updatedData.findIndex((item) => item.workflowmapping);
        if (workflowIndex !== -1) {
            updatedData[workflowIndex].workflowmapping = updatedData[workflowIndex].workflowmapping.map((wf) => ({
                ...wf,
                listeDestinazione: wf.listeDestinazione ? wf.listeDestinazione.filter((key) => key !== listItem.key) : [],
                doNotlisteDestinazione: wf.doNotlisteDestinazione ? wf.doNotlisteDestinazione.filter((key) => key !== listItem.key) : [],
            }));
        }

        updatedData.forEach((faculty) => {
            if (faculty.azioni) {
                faculty.azioni.forEach((action) => {
                    action.listArray.forEach((item) => {
                        if (item.moveToList) {
                            const moveToListKeys = item.moveToList.split(',').map((key) => key.trim());
                            item.moveToList = moveToListKeys.filter((key) => key !== listItem.key).join(', ');
                        }
                        if (item.doNotMoveToList) {
                            const doNotMoveToListKeys = item.doNotMoveToList.split(',').map((key) => key.trim());
                            item.doNotMoveToList = doNotMoveToListKeys.filter((key) => key !== listItem.key).join(', ');
                        }
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
                <Modal.Title>Elimina <span className='fw-bold'>Lista</span></Modal.Title>
            </Modal.Header>
            <Modal.Body className='text-center'>
                Sei sicuro di voler eliminare la Lista <br />
                <span className='fw-bold'>{listItem?.title}</span>?
            </Modal.Body>
            <Modal.Footer className='d-flex justify-content-center mb-3'>
                <Button variant="outline-danger" onClick={handleDelete}>
                    Elimina Lista
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteListItemModal;