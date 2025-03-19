import React, { useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";

const TitleModal = ({ show, handleClose, handleTitleItem, initialData, handleDeleteTitle, titleModalType }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || { title: "" }
    });

    useEffect(() => {
        reset(initialData || { title: "" });
    }, [initialData, reset]);

    const onSubmit = (data) => {
        const trimmedData = {
            title: data.title.trim()
        };
        handleTitleItem(trimmedData);
        handleFinalClose();
    };

    const onDelete = () => {
        if (initialData && titleModalType) {
            handleDeleteTitle(initialData.title, titleModalType);
        }
    };

    const handleFinalClose = () => {
        reset({ title: "" }); // Reset form to empty
        handleClose() // Close modal
    };
    return (
        <Modal show={show} onHide={handleFinalClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Title</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
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

                    <div className="d-flex justify-content-center mt-4">
                        <Button variant="primary" type="submit" className="mx-2">Save</Button>
                        <Button variant="dark" onClick={handleFinalClose} className="mx-2">Close</Button>
                        {initialData && (
                            <Button
                                variant="danger"
                                className="mx-2"
                                onClick={onDelete}
                                disabled={!initialData}
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default TitleModal;