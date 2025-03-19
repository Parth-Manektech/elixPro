import React, { useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";

const ListItemModal = ({ show, handleClose, handleAddListItem, handleDeleteListItem, initialData }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || { key: "", title: "", type: "", isDetailAllowed: "" }
    });

    useEffect(() => {
        reset(initialData || { key: "", title: "", type: "", isDetailAllowed: "" });
    }, [initialData, reset]);

    const onSubmit = (data) => {
        const trimmedData = {
            key: data.key.trim(),
            title: data.title.trim(),
            type: data.type.trim(),
            isDetailAllowed: data.isDetailAllowed.trim()
        };
        handleAddListItem(trimmedData);
        handleClose();
        reset({
            key: "",
            title: "",
            type: "",
            isDetailAllowed: ""
        });
    };

    const onDelete = () => {
        handleDeleteListItem();
        handleClose();

    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group controlId="formKey" className="mb-3">
                        <Form.Label>Key</Form.Label>
                        <Controller
                            name="key"
                            control={control}
                            rules={{ required: "Key is required" }}
                            render={({ field }) => (
                                <Form.Control type="text" {...field} isInvalid={!!errors.key} />
                            )}
                        />
                        <Form.Control.Feedback type="invalid">{errors.key?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formTitle" className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Controller
                            name="title"
                            control={control}
                            rules={{ required: "Title is required" }}
                            render={({ field }) => (
                                <Form.Control type="text" {...field} isInvalid={!!errors.title} />
                            )}
                        />
                        <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formType" className="mb-3">
                        <Form.Label>Type</Form.Label>
                        <Controller
                            name="type"
                            control={control}
                            rules={{ required: "Type is required" }}
                            render={({ field }) => (
                                <Form.Control type="text" {...field} isInvalid={!!errors.type} />
                            )}
                        />
                        <Form.Control.Feedback type="invalid">{errors.type?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formDetailAllowed" className="mb-3">
                        <Form.Label>Is Detail Allowed</Form.Label>
                        <Controller
                            name="isDetailAllowed"
                            control={control}
                            rules={{ required: "This field is required" }}
                            render={({ field }) => (
                                <Form.Control type="text" {...field} isInvalid={!!errors.isDetailAllowed} />
                            )}
                        />
                        <Form.Control.Feedback type="invalid">{errors.isDetailAllowed?.message}</Form.Control.Feedback>
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

export default ListItemModal;