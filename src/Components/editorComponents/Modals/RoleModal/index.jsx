
import React, { useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { initializeWorkflowMapping } from "../../ViewComponentUtility";

const RoleItemModal = ({ show, handleClose, initialData, MainData, selectedRoleItem, setEpWorkflowjson, setSelectedRoleItem, setRoleModalShow, setShownStatuses }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || { nome: "", descrizione: "", listaDefault: "", key: "" }
    });

    useEffect(() => {
        reset(initialData || { nome: "", descrizione: "", listaDefault: "", key: "" });
    }, [initialData, reset]);

    const handleAddRole = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const workflowIndex = updatedData.length - 1;

        const trimmedData = {
            ruolo: {
                nome: data.nome.trim(),
                descrizione: data.descrizione.trim(),
                listaDefault: data.listaDefault.trim(),
                key: data.key.trim(),
                colore: initialData?.colore || "#6f42c1"
            },
            liste: [],
            azioni: [],
            pulsantiAttivi: {},
            sezioni: "",
            procedimentoTag: "",
            layout: {
                top: workflowIndex * 50,
                left: workflowIndex * 50,
                width: 350,
                height: 690
            }
        };

        if (selectedRoleItem) {
            const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === selectedRoleItem.nome);
            if (roleIndex !== -1) {
                const existingRole = updatedData[roleIndex];
                updatedData[roleIndex] = {
                    ...existingRole,
                    ruolo: trimmedData.ruolo
                };
            }
        } else {
            updatedData.splice(workflowIndex, 0, trimmedData);
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedRoleItem(null);
        setRoleModalShow(false);
    };

    const onSubmit = (data) => {
        const trimmedData = {
            nome: data.nome.trim(),
            descrizione: data.descrizione.trim(),
            listaDefault: data.listaDefault.trim(),
            key: data.key.trim()
        };
        handleAddRole(trimmedData);
    };

    const onClose = () => {
        handleClose();
        reset({
            nome: "",
            descrizione: "",
            listaDefault: "",
            key: ""
        });
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group controlId="formNome" className="mb-3">
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

                    <Form.Group controlId="formDescrizione" className="mb-3">
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

                    <Form.Group controlId="formListaDefault" className="mb-3">
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

                    <div className="d-flex justify-content-center mt-4">
                        <Button variant="primary" type="submit" className="mx-2">Save</Button>
                        <Button variant="dark" onClick={onClose} className="mx-2">Close</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default RoleItemModal;