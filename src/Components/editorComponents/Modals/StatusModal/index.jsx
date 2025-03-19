import React, { useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";

const StatusModal = ({ show, handleClose, handleAddStatusItem, handleDeleteStatusItem, initialData }) => {

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || { status: "" }
    });

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

    const onDelete = () => {
        handleDeleteStatusItem();
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
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
                        <Button variant="dark" onClick={handleClose} className="mx-2">Close</Button>
                        <Button
                            variant="danger"
                            className="mx-2"
                            onClick={onDelete}
                            disabled={!initialData} // Disabled if adding new item
                        >
                            Delete
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default StatusModal;