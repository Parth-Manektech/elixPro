import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import DeleteConfirmationModal from "../../../DeleteConfirmationModal";
import { initializeWorkflowMapping } from "../../ViewComponentUtility";

const TitleModal = ({ show, handleClose, initialData, titleModalType, MainData, currentFaculty, selectedTitle, setEpWorkflowjson, setSelectedTitle, setTitleItemModalShow }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || { title: "" }
    });

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    useEffect(() => {
        reset(initialData || { title: "" });
    }, [initialData, reset, show]);

    const handleDeleteTitle = (title, type) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        if (type === 'liste') {
            const list = updatedData[facultyIndex].liste.find(item => item.title === title);
            if (list) {
                list.listArray.forEach(item => {
                    const itemKey = item.key;
                    updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                        wf.listeDestinazione = wf.listeDestinazione.filter(key => key !== itemKey);
                        wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.filter(key => key !== itemKey);
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
                });
                updatedData[facultyIndex].liste = updatedData[facultyIndex].liste.filter(
                    (item) => item.title !== title
                );
            }
        } else if (type === 'azioni') {
            const action = updatedData[facultyIndex].azioni.find(item => item.title === title);
            if (action) {
                action.listArray.forEach(item => {
                    const itemKey = item.key;
                    updatedData[workflowIndex].workflowmapping = updatedData[workflowIndex].workflowmapping.filter(
                        (wf) => wf.keyAzione !== itemKey
                    );
                    updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                        wf.listeDestinazione = wf.listeDestinazione.filter(key => key !== itemKey);
                        wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.filter(key => key !== itemKey);
                        if (wf.statoDestinazione === itemKey) {
                            wf.statoDestinazione = null;
                        }
                    });
                    updatedData.forEach((faculty, index) => {
                        if (faculty.pulsantiAttivi) {
                            Object.keys(faculty.pulsantiAttivi).forEach(status => {
                                delete faculty.pulsantiAttivi[status][itemKey];
                            });
                        }
                    });
                    updatedData[facultyIndex].azioni.forEach(otherAction => {
                        otherAction.listArray.forEach(otherItem => {
                            if (otherItem.moveToList) {
                                const moveToListKeys = otherItem.moveToList.split(',').map(key => key.trim());
                                otherItem.moveToList = moveToListKeys.filter(key => key !== itemKey).join(', ');
                            }
                            if (otherItem.doNotMoveToList) {
                                const doNotMoveToListKeys = otherItem.doNotMoveToList.split(',').map(key => key.trim());
                                otherItem.doNotMoveToList = doNotMoveToListKeys.filter(key => key !== itemKey).join(', ');
                            }
                        });
                    });
                });
                updatedData[facultyIndex].azioni = updatedData[facultyIndex].azioni.filter(
                    (item) => item.title !== title
                );
            }
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setTitleItemModalShow(false);
        setSelectedTitle(null);
    };

    const handleAddTitleItem = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        const trimmedTitle = data.title.trim();
        if (selectedTitle) {
            if (titleModalType === 'liste') {
                const listIndex = updatedData[facultyIndex].liste.findIndex((list) => list.title === selectedTitle);
                if (listIndex !== -1) {
                    updatedData[facultyIndex].liste[listIndex].title = trimmedTitle;
                    updatedData[facultyIndex].liste[listIndex].listArray.forEach(item => {
                        const oldKey = item.key;
                        const newKey = item.key;
                        updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                            wf.listeDestinazione = wf.listeDestinazione.map(key => key === oldKey ? newKey : key);
                            wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.map(key => key === oldKey ? newKey : key);
                        });
                    });
                }
            } else if (titleModalType === 'azioni') {
                const actionIndex = updatedData[facultyIndex].azioni.findIndex((action) => action.title === selectedTitle);
                if (actionIndex !== -1) {
                    updatedData[facultyIndex].azioni[actionIndex].title = trimmedTitle;
                    updatedData[facultyIndex].azioni[actionIndex].listArray.forEach(item => {
                        const oldKey = item.key;
                        const newKey = item.key;
                        updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                            if (wf.keyAzione === oldKey) {
                                wf.keyAzione = newKey;
                            }
                            wf.listeDestinazione = wf.listeDestinazione.map(key => key === oldKey ? newKey : key);
                            wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.map(key => key === oldKey ? newKey : key);
                            if (wf.statoDestinazione === oldKey) {
                                wf.statoDestinazione = newKey;
                            }
                        });
                        updatedData.forEach((faculty, index) => {
                            if (faculty.pulsantiAttivi) {
                                const oldStatusKeys = Object.keys(faculty.pulsantiAttivi);
                                oldStatusKeys.forEach(oldStatus => {
                                    if (faculty.pulsantiAttivi[oldStatus][oldKey]) {
                                        const value = faculty.pulsantiAttivi[oldStatus][oldKey];
                                        delete faculty.pulsantiAttivi[oldStatus][oldKey];
                                        faculty.pulsantiAttivi[oldStatus][newKey] = value;
                                    }
                                });
                            }
                        });
                    });
                }
            }
        } else {
            const newTitleObject = { title: trimmedTitle, listArray: [] };
            if (titleModalType === 'liste') {
                updatedData[facultyIndex].liste.push(newTitleObject);
            } else if (titleModalType === 'azioni') {
                updatedData[facultyIndex].azioni.push(newTitleObject);
            }
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedTitle(null);
        setTitleItemModalShow(false);
    };

    const onSubmit = (data) => {
        const trimmedData = {
            title: data.title.trim()
        };
        handleAddTitleItem(trimmedData);
        handleFinalClose();
    };


    const handleFinalClose = () => {
        reset({ title: "" }); // Reset form to empty
        handleClose() // Close modal
    };


    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = () => {
        if (initialData && titleModalType) {
            handleDeleteTitle(initialData.title, titleModalType);
        }
        handleFinalClose()
        setShowDeleteConfirmation(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
    };

    const validateListTitle = (value) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return "Campo obbligatorio";

        const facultyIndex = MainData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        if (facultyIndex !== -1) {
            const existingTitles = MainData[facultyIndex].liste
                .filter(list => list.title !== initialData?.title)
                .map(list => list.title);
            if (existingTitles.includes(trimmedValue)) {
                return "Il titolo della lista esiste già. Inserire un titolo unico.";
            }
        }
        return true;
    };

    const validateActionTitle = (value) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return "Campo obbligatorio";

        const facultyIndex = MainData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        if (facultyIndex !== -1) {
            const existingTitles = MainData[facultyIndex].azioni
                .filter(action => action.title !== initialData?.title)
                .map(action => action.title);
            if (existingTitles.includes(trimmedValue)) {
                return "Il titolo dell'azione esiste già. Inserire un titolo unico.";
            }
        }
        return true;
    };
    return (
        <>
            <Modal show={show} onHide={handleFinalClose} size="xl" >
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Header closeButton>
                        <Modal.Title className="fs-5"> <span>{initialData?.title ? "Modifica" : "Nuova"}</span> <span className="fw-bold">Categoria {titleModalType === 'liste' ? "lista" : "azione"}</span></Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="mx-3">
                        <Col lg={12}>
                            <div className="modal-sezione">
                                <span className="modal-sezione-titolo">Dati</span>
                                <div className="modal-sezione-line"></div>
                            </div>
                        </Col>
                        <Form.Group controlId="formTitle" className="mb-3">
                            <Row lg={12}>
                                <Col lg={3} className="d-flex justify-content-end align-items-center">
                                    Nome
                                </Col>
                                <Col lg={9}>
                                    <Controller
                                        name="title"
                                        control={control}
                                        rules={{
                                            required: "Campo obbligatorio",
                                            validate: titleModalType === 'liste' ? validateListTitle : validateActionTitle
                                        }}
                                        render={({ field }) => (
                                            <Form.Control
                                                placeholder="Inserisci la nome"
                                                type="text"
                                                {...field}
                                                isInvalid={!!errors.title}
                                            />
                                        )}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                                </Col>
                            </Row>
                        </Form.Group>

                        {/* <div className="d-flex justify-content-center mt-4">
                            <Button variant="primary" type="submit" className="mx-2">Save</Button>
                            <Button variant="dark" onClick={handleFinalClose} className="mx-2">Close</Button>
                            {initialData && (
                                <Button
                                    variant="danger"
                                    className="mx-2"
                                    onClick={handleDeleteClick}
                                    disabled={!initialData}
                                >
                                    Delete
                                </Button>
                            )}
                        </div> */}

                    </Modal.Body>
                    <Modal.Footer>
                        <div className="d-flex justify-content-end mb-4">
                            <Button variant={initialData?.title ? "outline-primary" : "primary"} type="submit" className="mx-2">{initialData?.title ? "Applica" : `Crea Categoria ${titleModalType === 'liste' ? "lista" : "azione"}`}</Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>

            <DeleteConfirmationModal
                show={showDeleteConfirmation}
                handleClose={handleCancelDelete}
                handleConfirm={handleConfirmDelete}
                itemType={`${titleModalType === 'liste' ? 'list' : 'action'}`}
            />
        </>

    );
};

export default TitleModal;