import React, { useEffect } from "react";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";

import { initializeWorkflowMapping } from "../../ViewComponentUtility";

const TitleModal = ({ show, currentDataId, handleClose, initialData, titleModalType, MainData, currentFaculty, selectedTitle, setEpWorkflowjson, setSelectedTitle, setTitleItemModalShow }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || { title: "" }
    });


    useEffect(() => {
        reset(initialData || { title: "" });
    }, [initialData, reset, show]);

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
                        <Modal.Title className="fs-5 d-flex align-items-center gap-3">
                            <span>
                                <span>{initialData?.title ? "Modifica" : "Nuova"}</span>
                                <span className="fw-bold">Categoria {titleModalType === 'liste' ? "lista" : "azione"}</span>
                            </span>
                            {initialData?.title && <span className="modal-badge-ID">{currentDataId}</span>}
                        </Modal.Title>
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


                    </Modal.Body>
                    <Modal.Footer>
                        <div className="d-flex justify-content-end mb-4">
                            <Button variant={initialData?.title ? "outline-primary" : "primary"} type="submit" className="mx-2">{initialData?.title ? "Applica" : `Crea Categoria ${titleModalType === 'liste' ? "lista" : "azione"}`}</Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>

    );
};

export default TitleModal;