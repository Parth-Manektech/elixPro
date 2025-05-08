import React, { useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";

const CloneRoleModal = ({ show, handleClose, onClone, initialNome }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: { nome: `${initialNome}_clone`, key: "" }
    });

    useEffect(() => {
        reset({ nome: `${initialNome}_clone`, key: "" });
    }, [initialNome, reset]);

    const onSubmit = (data) => {
        onClone({
            nome: data.nome.trim(),
            key: data.key.trim()
        });
        handleClose();
    };

    const onClose = () => {
        handleClose();
        reset({ nome: `${initialNome}_clone`, key: "" });
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group controlId="formCloneNome" className="mb-3">
                        <Form.Label>New Role Name</Form.Label>
                        <Controller
                            name="nome"
                            control={control}
                            rules={{ required: "Role Name is required" }}
                            render={({ field }) => (
                                <Form.Control type="text" {...field} isInvalid={!!errors.nome} />
                            )}
                        />
                        <Form.Control.Feedback type="invalid">{errors.nome?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formCloneKey" className="mb-3">
                        <Form.Label>New Key</Form.Label>
                        <Controller
                            name="key"
                            control={control}
                            rules={{
                                required: "Key is required",
                                pattern: {
                                    value: /^[a-zA-Z0-9_]+$/,
                                    message: "Key must be alphanumeric with underscores"
                                }
                            }}
                            render={({ field }) => (
                                <Form.Control type="text" {...field} isInvalid={!!errors.key} />
                            )}
                        />
                        <Form.Control.Feedback type="invalid">{errors.key?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex justify-content-center mt-4">
                        <Button variant="primary" type="submit" className="mx-2">Save</Button>
                        <Button variant="dark" onClick={onClose} className="mx-2">Close</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CloneRoleModal;