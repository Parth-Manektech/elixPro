import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteConfirmationModal = ({ show, handleClose, handleConfirm, itemType }) => {
    return (
        <Modal show={show} onHide={handleClose} size='lg' centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body className='fs-2 fw-bold text-center'>
                Are you sure you want to delete this {itemType}?
            </Modal.Body>
            <div className='d-flex justify-content-center gap-3 mb-3'>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleConfirm}>
                    Delete
                </Button>
            </div>
        </Modal>
    );
};

export default DeleteConfirmationModal;