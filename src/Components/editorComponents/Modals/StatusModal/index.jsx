import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import DeleteConfirmationModal from "../../../DeleteConfirmationModal";
import { initializeWorkflowMapping } from "../../ViewComponentUtility";

const StatusModal = ({ show, handleClose, initialData, MainData, currentFaculty, selectedStatusItem, setEpWorkflowjson, setSelectedStatusItem, setStatusItemModalShow, shownStatuses, setShownStatuses }) => {

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || { status: "" }
    });
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);


    useEffect(() => {
        reset(initialData || { status: "" });
    }, [initialData, reset, show]);

    const handleAddStatusItem = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        // Ensure pulsantiAttivi exists
        if (!updatedData[facultyIndex].pulsantiAttivi) {
            updatedData[facultyIndex].pulsantiAttivi = {};
        }

        const newStatus = data.status.trim();
        const currentPulsanti = updatedData[facultyIndex].pulsantiAttivi;

        if (selectedStatusItem) {
            // Update existing status
            const oldStatus = selectedStatusItem;
            const oldValue = currentPulsanti[oldStatus] || {};

            // Create a new object to maintain key order
            const updatedPulsanti = {};
            Object.keys(currentPulsanti).forEach((key) => {
                if (key === oldStatus) {
                    updatedPulsanti[newStatus] = oldValue;
                } else {
                    updatedPulsanti[key] = currentPulsanti[key];
                }
            });

            updatedData[facultyIndex].pulsantiAttivi = updatedPulsanti;

            // Update workflow mappings
            updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                if (wf.statoDestinazione === oldStatus) {
                    wf.statoDestinazione = newStatus;
                }
            });

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
            const updatedPulsanti = { [newStatus]: {} };
            Object.keys(currentPulsanti).forEach((key) => {
                updatedPulsanti[key] = currentPulsanti[key];
            });

            updatedData[facultyIndex].pulsantiAttivi = updatedPulsanti;
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedStatusItem(null);
        setStatusItemModalShow(false);
    };

    const handleDeleteStatusItem = () => {
        if (!selectedStatusItem) return;
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        delete updatedData[facultyIndex].pulsantiAttivi[selectedStatusItem];

        updatedData[workflowIndex].workflowmapping.forEach((wf) => {
            if (wf.statoDestinazione === selectedStatusItem) {
                wf.statoDestinazione = null;
            }
        });

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
            status: data.status.trim()
        };
        handleAddStatusItem(trimmedData);
        handleClose();
        reset({ status: "" });
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
        reset({ status: "" });
        handleClose();
    }

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
    };


    return (
        <>
            <Modal show={show} onHide={handlefinalclose} size="xl">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Header closeButton>
                        <Modal.Title className="fs-5">{initialData?.status ? "Modifica" : "Nuovo"}&nbsp;<span className="fw-bold">Stato</span></Modal.Title>
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
                                        rules={{ required: "Campo obbligatorio" }}
                                        render={({ field }) => (
                                            <Form.Control type="text" {...field} isInvalid={!!errors.status} />
                                        )}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.status?.message}</Form.Control.Feedback>
                                </Col>
                            </Row>
                        </Form.Group>

                        {/* <div className="d-flex justify-content-center mt-4">
                            <Button variant="primary" type="submit" className="mx-2">Save</Button>
                            <Button variant="dark" onClick={handlefinalclose} className="mx-2">Close</Button>
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
                            <Button variant={initialData?.status ? "outline-primary" : "primary"} type="submit" className="mx-2">{initialData?.status ? "Applica" : "Crea Stato"}</Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>

            <DeleteConfirmationModal
                show={showDeleteConfirmation}
                handleClose={handleCancelDelete}
                handleConfirm={handleConfirmDelete}
                itemType="status"
            />
        </>

    );
};

export default StatusModal;