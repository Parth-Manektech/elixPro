import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import DeleteConfirmationModal from "../../../DeleteConfirmationModal";

const StatusModal = ({ show, handleClose, handleAddStatusItem, handleDeleteStatusItem, initialData }) => {

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || { status: "" }
    });
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    useEffect(() => {
        reset(initialData || { status: "" });
    }, [initialData, reset]);

    const onSubmit = (data) => {
        const trimmedData = {
            status: data.status.trim()
        };
        handleAddStatusItem(trimmedData);
        handleClose();
        reset({ status: "" });
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = () => {
        handleDeleteStatusItem();

        setShowDeleteConfirmation(false);
        handlefinalclose();
    };

    const handlefinalclose = () => {
        reset({ status: "" });
        handleClose();
    }

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
    };


    return (
        <>
            <Modal show={show} onHide={handlefinalclose} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group controlId="formStatus" className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Controller
                                name="status"
                                control={control}
                                rules={{ required: "Status is required" }}
                                render={({ field }) => (
                                    <Form.Control type="text" {...field} isInvalid={!!errors.status} />
                                )}
                            />
                            <Form.Control.Feedback type="invalid">{errors.status?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-flex justify-content-center mt-4">
                            <Button variant="primary" type="submit" className="mx-2">Save</Button>
                            <Button variant="dark" onClick={handlefinalclose} className="mx-2">Close</Button>
                            <Button
                                variant="danger"
                                className="mx-2"
                                onClick={handleDeleteClick}
                                disabled={!initialData} // Disabled if adding new item
                            >
                                Delete
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <DeleteConfirmationModal
                show={showDeleteConfirmation}
                handleClose={handleCancelDelete}
                handleConfirm={handleConfirmDelete}
                itemType="status"
            />
        </>

    );
};

export default StatusModal;