import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import DeleteConfirmationModal from "../../../DeleteConfirmationModal";
import { initializeWorkflowMapping } from "../../ViewComponentUtility";

const RoleItemModal = ({ show, handleClose, initialData, MainData, selectedRoleItem, setEpWorkflowjson, setSelectedRoleItem, setRoleModalShow, setShownStatuses }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || { nome: "", descrizione: "", listaDefault: "" }
    });
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    useEffect(() => {
        reset(initialData || { nome: "", descrizione: "", listaDefault: "" });
    }, [initialData, reset]);

    const handleDeleteRole = () => {
        if (!selectedRoleItem) return;
        const updatedData = initializeWorkflowMapping([...MainData]);
        const workflowIndex = updatedData.length - 1;

        const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === selectedRoleItem.nome);
        if (roleIndex === -1) return;

        const listKeys = [];
        const actionKeys = [];
        const statusKeys = [];

        const role = updatedData[roleIndex];
        if (role.liste) {
            role.liste.forEach(list => {
                list.listArray.forEach(item => {
                    listKeys.push(item.key);
                });
            });
        }
        if (role.azioni) {
            role.azioni.forEach(action => {
                action.listArray.forEach(item => {
                    actionKeys.push(item.key);
                });
            });
        }
        if (role.pulsantiAttivi) {
            statusKeys.push(...Object.keys(role.pulsantiAttivi));
        }

        updatedData[workflowIndex].workflowmapping = updatedData[workflowIndex].workflowmapping.filter(
            (wf) => !actionKeys.includes(wf.keyAzione)
        );
        updatedData[workflowIndex].workflowmapping.forEach((wf) => {
            wf.listeDestinazione = wf.listeDestinazione.filter(key => !listKeys.includes(key));
            wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.filter(key => !listKeys.includes(key));
            if (statusKeys.includes(wf.statoDestinazione)) {
                wf.statoDestinazione = null;
            }
        });

        updatedData.forEach((faculty, index) => {
            if (faculty.azioni) {
                faculty.azioni.forEach(action => {
                    action.listArray.forEach(item => {
                        if (item.moveToList) {
                            const moveToListKeys = item.moveToList.split(',').map(key => key.trim());
                            item.moveToList = moveToListKeys.filter(key => !listKeys.includes(key)).join(', ');
                        }
                        if (item.doNotMoveToList) {
                            const doNotMoveToListKeys = item.doNotMoveToList.split(',').map(key => key.trim());
                            item.doNotMoveToList = doNotMoveToListKeys.filter(key => !listKeys.includes(key)).join(', ');
                        }
                    });
                });
            }
        });

        setShownStatuses(prev => {
            const newStatuses = { ...prev };
            delete newStatuses[selectedRoleItem.nome];
            return newStatuses;
        });

        updatedData.splice(roleIndex, 1);

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedRoleItem(null);
        setRoleModalShow(false);
    };


    const handleAddRole = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const workflowIndex = updatedData.length - 1;

        const trimmedData = {
            ruolo: {
                nome: data.nome.trim(),
                descrizione: data.descrizione.trim(),
                listaDefault: data.listaDefault.trim()
            },
            liste: [],
            azioni: []
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
            listaDefault: data.listaDefault.trim()
        };
        handleAddRole(trimmedData);
    };



    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = () => {
        handleDeleteRole();
        onClose();
        setShowDeleteConfirmation(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
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
        <>
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
                itemType="role"
            />
        </>

    );
};

export default RoleItemModal;