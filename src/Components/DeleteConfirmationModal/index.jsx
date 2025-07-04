import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteConfirmationModal = ({ show, handleClose, handleConfirm, itemMessages, itemName, itemType }) => {
    return (
        <Modal show={show} onHide={handleClose} size='xl' centered className='detele-Modal'>
            <Modal.Header closeButton>
                <Modal.Title className='fs-5'>Elimina <span className='fw-bold'>{itemType}</span></Modal.Title>
            </Modal.Header>
            <Modal.Body className='fs-6 text-center w-100'>
                {itemMessages} <br /><span className='fw-bold'>{itemName}</span>?
            </Modal.Body>
            <Modal.Footer className='d-flex justify-content-center mb-3'>
                <Button variant="outline-danger" onClick={handleConfirm}>
                    Elimina {itemType}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteConfirmationModal;