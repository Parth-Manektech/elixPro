import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Col, Row, Badge } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import DeleteConfirmationModal from "../../../DeleteConfirmationModal";
import { initializeWorkflowMapping } from "../../ViewComponentUtility";

const ListItemModal = ({ currentDataId, show, handleClose, initialData, MainData, currentFaculty, currentListTitle, selectedListItem, setEpWorkflowjson, setSelectedListItem, setListItemModalShow }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || { key: "", title: "", type: "button", isDetailAllowed: "true" }
    });
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    useEffect(() => {
        reset(initialData || { key: "", title: "", type: "button", isDetailAllowed: "true" });
    }, [initialData, reset, show]);

    const onSubmit = (data) => {
        const trimmedData = {
            key: data.key.trim(),
            title: data.title.trim(),
            type: data.type.trim(),
            isDetailAllowed: data.isDetailAllowed.trim()
        };
        handleAddListItem(trimmedData);
        hendleFinalClose()
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = () => {
        handleDeleteListItem();
        setShowDeleteConfirmation(false);
        hendleFinalClose()
    };

    const hendleFinalClose = () => {
        handleClose()
        reset({ key: "", title: "", type: "", isDetailAllowed: "" });
    }

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
    };

    const handleDeleteListItem = () => {
        if (!selectedListItem) return;
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        const listIndex = updatedData[facultyIndex].liste.findIndex((list) => list.title === currentListTitle);
        const itemKey = selectedListItem.key;
        updatedData[facultyIndex].liste[listIndex].listArray = updatedData[facultyIndex].liste[listIndex].listArray.filter(
            (item) => item.key !== selectedListItem.key
        );

        updatedData[workflowIndex].workflowmapping.forEach((wf) => {
            if (wf.listeDestinazione) {
                wf.listeDestinazione = wf.listeDestinazione.filter(key => key !== itemKey);
            }
            if (wf.doNotlisteDestinazione) {
                wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.filter(key => key !== itemKey);
            }
        });

        updatedData[facultyIndex].azioni.forEach(action => {
            action.listArray.forEach(item => {
                if (item.moveToList) {
                    const moveToListKeys = item.moveToList.split(',').map(key => key.trim());
                    item.moveToList = moveToListKeys.filter(key => key !== itemKey).join(', ');
                }
                if (item.doNotMoveToList) {
                    const doNotMoveToListKeys = item.doNotMoveToList.split(',').map(key => key.trim());
                    item.doNotMoveToList = doNotMoveToListKeys.filter(key => key !== itemKey).join(', ');
                }
            });
        });

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedListItem(null);
        setListItemModalShow(false);
    };


    const handleAddListItem = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        const listIndex = updatedData[facultyIndex].liste.findIndex((list) => list.title === currentListTitle);
        if (selectedListItem) {
            const oldKey = selectedListItem.key;
            const newKey = data.key.trim();
            const itemIndex = updatedData[facultyIndex].liste[listIndex].listArray.findIndex((item) => item.key === selectedListItem.key);
            updatedData[facultyIndex].liste[listIndex].listArray[itemIndex] = data;

            updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                if (wf.listeDestinazione) {
                    wf.listeDestinazione = wf.listeDestinazione.map(key => key === oldKey ? newKey : key);
                }
                if (wf.doNotlisteDestinazione) {
                    wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.map(key => key === oldKey ? newKey : key);
                }
            });

            updatedData[facultyIndex].azioni.forEach(action => {
                action.listArray.forEach(item => {
                    if (item.moveToList) {
                        const moveToListKeys = item.moveToList.split(',').map(key => key.trim());
                        const updatedMoveToList = moveToListKeys.map(key => key === oldKey ? newKey : key).join(', ');
                        item.moveToList = updatedMoveToList;
                    }
                    if (item.doNotMoveToList) {
                        const doNotMoveToListKeys = item.doNotMoveToList.split(',').map(key => key.trim());
                        const updatedDoNotMoveToList = doNotMoveToListKeys.map(key => key === oldKey ? newKey : key).join(', ');
                        item.doNotMoveToList = updatedDoNotMoveToList;
                    }
                });
            });
        } else {
            updatedData[facultyIndex].liste[listIndex].listArray.push(data);
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedListItem(null);
        setListItemModalShow(false);
    };

    const validateKey = (value) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return "Campo obbligatorio";

        const existingKeys = MainData
            .filter(elem => elem.ruolo && elem.liste) // Filter roles with liste
            .flatMap(elem =>
                elem.liste.flatMap(list =>
                    list.listArray
                        .filter(item => item.key !== initialData?.key) // Exclude current item when editing
                        .map(item => item.key)
                )
            );

        if (existingKeys.includes(trimmedValue)) {
            return "La chiave esiste già in una lista. Inserire una chiave unica.";
        }

        return true;
    };

    return (
        <>
            <Modal show={show} onHide={hendleFinalClose} size="xl" >
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Header className="fs-5 d-flex align-items-center gap-3" closeButton>
                        <span >{initialData?.key ? "Modifica" : " Nuova"}&nbsp;<span className="fw-bold">Lista</span></span>
                        {initialData?.key && <span className="modal-badge-ID">{currentDataId}</span>}
                    </Modal.Header>
                    <Modal.Body className="mx-3">

                        <Col lg={12} className="mt-3">
                            <div className="modal-sezione">
                                <span className="modal-sezione-titolo">Dati</span>
                                <div className="modal-sezione-line"></div>
                            </div>
                        </Col>

                        <Form.Group controlId="formKey" className="mb-3">
                            <Row lg={12}>
                                <Col lg={3} className="d-flex justify-content-end align-items-center">
                                    Key
                                </Col>
                                <Col lg={9}>
                                    <Controller
                                        name="key"
                                        control={control}
                                        rules={{
                                            required: "Campo obbligatorio",
                                            validate: validateKey
                                        }}
                                        render={({ field }) => (
                                            <Form.Control
                                                placeholder="Inserisci la key"
                                                type="text"
                                                {...field}
                                                isInvalid={!!errors.key}
                                            />
                                        )}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.key?.message}</Form.Control.Feedback>
                                </Col>
                            </Row>
                        </Form.Group>

                        <Form.Group controlId="formTitle" className="mb-3">
                            <Row lg={12}>
                                <Col lg={3} className="d-flex justify-content-end align-items-center">
                                    Nome
                                </Col>
                                <Col lg={9}>
                                    <Controller
                                        name="title"
                                        control={control}
                                        rules={{ required: "Campo obbligatorio" }}
                                        render={({ field }) => (
                                            <Form.Control placeholder="Inserisci la nome" type="text" {...field} isInvalid={!!errors.title} />
                                        )}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                                </Col>
                            </Row>
                        </Form.Group>

                        <Col lg={12}>
                            <div className="modal-sezione">
                                <span className="modal-sezione-titolo">Impostazioni</span>
                                <div className="modal-sezione-line"></div>
                            </div>
                        </Col>

                        <Form.Group controlId="formType" className="mb-3">
                            <Row lg={12}>
                                <Col lg={3} className="d-flex justify-content-end align-items-center">
                                    {"Tipo (to-be-removed)"}
                                </Col>
                                <Col lg={9}>
                                    <Controller
                                        name="type"
                                        control={control}
                                        rules={{ required: "Campo obbligatorio" }}
                                        render={({ field }) => (
                                            <Form.Select
                                                {...field}
                                                value={field.value}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value);
                                                }}
                                                aria-label="select type"
                                                isInvalid={!!errors.type}
                                            >
                                                <option value="button">button</option>
                                            </Form.Select>
                                        )}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.type?.message}</Form.Control.Feedback>
                                </Col>
                            </Row>

                        </Form.Group>

                        <Form.Group controlId="formDetailAllowed" className="mb-3">
                            <Row lg={12}>
                                <Col lg={3} className="d-flex justify-content-end align-items-center">
                                    Mostra "Dettaglio" pratiche
                                </Col>
                                <Col lg={9}>
                                    <Controller
                                        name="isDetailAllowed"
                                        control={control}
                                        render={({ field }) => (
                                            <Form.Check
                                                type="switch"
                                                id="isDetailAllowed-switch"
                                                checked={field.value === "true"}
                                                onChange={(e) => {
                                                    const newValue = e.target.checked ? "true" : "false";
                                                    field.onChange(newValue);
                                                }}
                                                isInvalid={!!errors.isDetailAllowed}
                                                style={{ cursor: "pointer !impotant" }}
                                            />
                                        )}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.isDetailAllowed?.message}</Form.Control.Feedback>
                                </Col>
                            </Row>
                        </Form.Group>
                        {/* 
                        <div className="d-flex justify-content-center mt-4">
                            <Button variant="primary" type="submit" className="mx-2">Save</Button>
                            <Button variant="dark" onClick={hendleFinalClose} className="mx-2">Close</Button>
                            <Button
                                variant="danger"
                                className="mx-2"
                                onClick={handleDeleteClick}
                                disabled={!initialData} // Disabled if adding new item
                            >
                                Delete
                            </Button>
                        </div> */}
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="d-flex justify-content-end mb-4">
                            <Button variant={initialData?.key ? "outline-primary" : "primary"} type="submit" className="mx-2">{initialData?.key ? "Applica" : "Crea Lista"}</Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>
            {/* <DeleteConfirmationModal
                show={showDeleteConfirmation}
                handleClose={handleCancelDelete}
                handleConfirm={handleConfirmDelete}
                itemType="list item"
            /> */}
        </>
    );
};

export default ListItemModal;