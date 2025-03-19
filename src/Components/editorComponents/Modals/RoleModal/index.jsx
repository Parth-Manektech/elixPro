import React, { useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";

const RoleItemModal = ({ show, handleClose, handleAddRole, handleDeleteRole, initialData }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || { nome: "", descrizione: "", listaDefault: "" }
    });

    useEffect(() => {
        reset(initialData || { nome: "", descrizione: "", listaDefault: "" });
    }, [initialData, reset]);

    const onSubmit = (data) => {
        const trimmedData = {
            nome: data.nome.trim(),
            descrizione: data.descrizione.trim(),
            listaDefault: data.listaDefault.trim()
        };
        handleAddRole(trimmedData);
    };

    const onDelete = () => {
        handleDeleteRole();
    };

    const onClose = () => {
        handleClose();
        reset({
            nome: "",
            descrizione: "",
            listaDefault: ""
        });
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group controlId="formKey" className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Controller
                            name="nome"
                            control={control}
                            rules={{ required: "Name is required" }}
                            render={({ field }) => (
                                <Form.Control type="text" {...field} isInvalid={!!errors.nome} />
                            )}
                        />
                        <Form.Control.Feedback type="invalid">{errors.nome?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formTitle" className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Controller
                            name="descrizione"
                            control={control}
                            rules={{ required: "Description is required" }}
                            render={({ field }) => (
                                <Form.Control type="text" {...field} isInvalid={!!errors.descrizione} />
                            )}
                        />
                        <Form.Control.Feedback type="invalid">{errors.descrizione?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formType" className="mb-3">
                        <Form.Label>Lista Default</Form.Label>
                        <Controller
                            name="listaDefault"
                            control={control}
                            rules={{ required: "Lista Default is required" }}
                            render={({ field }) => (
                                <Form.Control type="text" {...field} isInvalid={!!errors.listaDefault} />
                            )}
                        />
                        <Form.Control.Feedback type="invalid">{errors.listaDefault?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex justify-content-center mt-4">
                        <Button variant="primary" type="submit" className="mx-2">Save</Button>
                        <Button variant="dark" onClick={onClose} className="mx-2">Close</Button>
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

export default RoleItemModal;