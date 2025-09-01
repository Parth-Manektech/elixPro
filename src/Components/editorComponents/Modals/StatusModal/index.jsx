import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import DeleteConfirmationModal from "../../../DeleteConfirmationModal";
import { initializeWorkflowMapping } from "../../ViewComponentUtility";

const StatusModal = ({ show, currentDataId, handleClose, initialData, MainData, currentFaculty, selectedStatusItem, setEpWorkflowjson, setSelectedStatusItem, setStatusItemModalShow, shownStatuses, setShownStatuses }) => {
    const getStatusTitle = (statusKey) => {
        const workflowIndex = MainData.findIndex((elem) => elem.ajWFStatiName || elem.workflowmapping);
        if (workflowIndex !== -1 && MainData[workflowIndex].ajWFStatiName?.[statusKey]) {
            return MainData[workflowIndex].ajWFStatiName[statusKey].title;
        }
        return statusKey; // Fallback to key if title not found
    };

    const OldData = { status: initialData?.status || "", title: getStatusTitle(initialData?.status) || "" };
    const { control, handleSubmit, formState: { errors }, reset, setError, clearErrors } = useForm({
        defaultValues: OldData
    });
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    useEffect(() => {
        reset(OldData);
    }, [initialData, reset, show]);

    const validateStatusKey = (value) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return "Campo obbligatorio";

        const statiNameIndex = MainData.findIndex((elem) => elem.ajWFStatiName);
        if (statiNameIndex !== -1 && MainData[statiNameIndex].ajWFStatiName) {
            // Exclude current status key when editing
            const existingKeys = Object.keys(MainData[statiNameIndex].ajWFStatiName).filter(
                key => key !== initialData?.status
            );
            if (existingKeys.includes(trimmedValue)) {
                return "La chiave esiste già. Inserire una chiave unica.";
            }
        }
        return true;
    };

    const handleAddStatusItem = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const statiNameIndex = updatedData.findIndex((elem) => elem.ajWFStatiName);
        const workflowIndex = updatedData.findIndex((elem) => elem.workflowmapping);

        // Ensure pulsantiAttivi exists
        if (!updatedData[facultyIndex].pulsantiAttivi) {
            updatedData[facultyIndex].pulsantiAttivi = {};
        }

        // Ensure ajWFStatiName exists
        if (statiNameIndex !== -1 && !updatedData[statiNameIndex].ajWFStatiName) {
            updatedData[statiNameIndex].ajWFStatiName = {};
        }

        const newStatus = data.status.trim();
        const newTitle = data.title.trim();
        const currentPulsanti = updatedData[facultyIndex].pulsantiAttivi;
        const ajWFStatiName = statiNameIndex !== -1 ? updatedData[statiNameIndex].ajWFStatiName : {};

        if (selectedStatusItem) {
            // Update existing status
            const oldStatus = selectedStatusItem;
            const oldValue = currentPulsanti[oldStatus] || {};

            // Update pulsantiAttivi
            const updatedPulsanti = {};
            Object.keys(currentPulsanti).forEach((key) => {
                if (key === oldStatus) {
                    updatedPulsanti[newStatus] = oldValue;
                } else {
                    updatedPulsanti[key] = currentPulsanti[key];
                }
            });
            updatedData[facultyIndex].pulsantiAttivi = updatedPulsanti;

            // Update ajWFStatiName
            if (statiNameIndex !== -1) {
                if (ajWFStatiName[oldStatus]) {
                    const updatedStatiName = {};
                    Object.keys(ajWFStatiName).forEach((key) => {
                        if (key === oldStatus) {
                            updatedStatiName[newStatus] = { value: newStatus, title: newTitle };
                        } else {
                            updatedStatiName[key] = ajWFStatiName[key];
                        }
                    });
                    updatedData[statiNameIndex].ajWFStatiName = updatedStatiName;
                } else {
                    updatedData[statiNameIndex].ajWFStatiName[newStatus] = { value: newStatus, title: newTitle };
                }
            }

            // Update workflow mappings
            if (workflowIndex !== -1 && updatedData[workflowIndex].workflowmapping) {
                updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                    if (wf.statoDestinazione === oldStatus) {
                        wf.statoDestinazione = newStatus;
                    }
                });
            }

            // Update status in actions' listArray
            updatedData.forEach((role) => {
                if (role.azioni) {
                    role.azioni.forEach((action) => {
                        action.listArray.forEach((item) => {
                            if (item.status === oldStatus) {
                                item.status = newStatus;
                            }
                        });
                    });
                }
            });

            // Update shownStatuses if necessary
            if (shownStatuses[currentFaculty] === oldStatus) {
                setShownStatuses((prev) => ({
                    ...prev,
                    [currentFaculty]: newStatus,
                }));
            }
        } else {
            // Add new status at the beginning
            const updatedPulsanti = { [newStatus]: {}, ...currentPulsanti };
            updatedData[facultyIndex].pulsantiAttivi = updatedPulsanti;

            // Add to ajWFStatiName
            if (statiNameIndex !== -1) {
                updatedData[statiNameIndex].ajWFStatiName[newStatus] = { value: newStatus, title: newTitle };
            }
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedStatusItem(null);
        setStatusItemModalShow(false);
    };

    const handleDeleteStatusItem = () => {
        if (!selectedStatusItem) return;
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.findIndex((elem) => elem.ajWFStatiName || elem.workflowmapping);

        // Remove from pulsantiAttivi
        delete updatedData[facultyIndex].pulsantiAttivi[selectedStatusItem];

        // Remove from ajWFStatiName
        if (updatedData[workflowIndex].ajWFStatiName?.[selectedStatusItem]) {
            delete updatedData[workflowIndex].ajWFStatiName[selectedStatusItem];
        }

        // Update workflow mappings
        if (workflowIndex !== -1 && updatedData[workflowIndex].workflowmapping) {
            updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                if (wf.statoDestinazione === selectedStatusItem) {
                    wf.statoDestinazione = null;
                }
            });
        }

        // Update shownStatuses
        if (shownStatuses[currentFaculty] === selectedStatusItem) {
            setShownStatuses(prev => {
                const newStatuses = { ...prev };
                delete newStatuses[currentFaculty];
                return newStatuses;
            });
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedStatusItem(null);
        setStatusItemModalShow(false);
    };

    const onSubmit = (data) => {
        const trimmedData = {
            status: data.status.trim(),
            title: data.title.trim()
        };
        handleAddStatusItem(trimmedData);
        handleClose();
        reset({ status: "", title: "" });
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = () => {
        handleDeleteStatusItem();
        setShowDeleteConfirmation(false);
        handlefinalclose();
    };

    const handlefinalclose = () => {
        reset({ status: "", title: "" });
        setSelectedStatusItem(null);
        handleClose();
    };

    return (
        <>
            <Modal show={show} onHide={handlefinalclose} size="xl">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Header closeButton>
                        <Modal.Title className="fs-5 d-flex align-items-center gap-3">
                            <span >{initialData?.status ? "Modifica" : " Nuova"}&nbsp;<span className="fw-bold">Stato</span></span>
                            {initialData?.status && <span className="modal-badge-ID">{currentDataId}</span>}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="mx-3">
                        <Col lg={12} className="mt-2">
                            <div className="modal-sezione">
                                <span className="modal-sezione-titolo">Dati</span>
                                <div className="modal-sezione-line"></div>
                            </div>
                        </Col>

                        <Form.Group controlId="formStatus" className="my-3">
                            <Row lg={12}>
                                <Col lg={3} className="d-flex justify-content-end align-items-center">
                                    Key
                                </Col>
                                <Col lg={9}>
                                    <Controller
                                        name="status"
                                        control={control}
                                        rules={{
                                            required: "Campo obbligatorio",
                                            validate: validateStatusKey
                                        }}
                                        render={({ field }) => (
                                            <Form.Control
                                                type="text"
                                                {...field}
                                                isInvalid={!!errors.status}
                                                placeholder="Inserisci la key"
                                            />
                                        )}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.status?.message}</Form.Control.Feedback>
                                </Col>
                            </Row>
                        </Form.Group>

                        <Form.Group controlId="formTitle" className="my-3">
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
                                            <Form.Control
                                                type="text"
                                                {...field}
                                                isInvalid={!!errors.title}
                                                placeholder="Inserisci il Nome"
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
                            <Button
                                variant={initialData?.status ? "outline-primary" : "primary"}
                                type="submit"
                                className="mx-2"
                            >
                                {initialData?.status ? "Applica" : "Crea Stato"}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>

            <DeleteConfirmationModal
                show={showDeleteConfirmation}
                handleClose={() => setShowDeleteConfirmation(false)}
                handleConfirm={handleConfirmDelete}
                itemType="status"
            />
        </>
    );
};

export default StatusModal;