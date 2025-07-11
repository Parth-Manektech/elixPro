import React, { useEffect } from "react";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { initializeWorkflowMapping } from "../../ViewComponentUtility";
import { ErrorToast } from "../../../../utils/Toster";

const CloneStatusModal = ({ show, handleClose, roleName, statusToClone, MainData, setEpWorkflowjson, updateCanvasSize }) => {

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: { status: "", title: "" }
    });

    const handleCloneStatus = (data) => {
        const newStatusKey = data.status.trim();
        const newTitle = data.title.trim();
        if (!newStatusKey || !newTitle) {
            ErrorToast("Please provide both a key and a title for the new status.");
            return;
        }

        const updatedData = initializeWorkflowMapping([...MainData]);
        const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === roleName);
        const workflowIndex = updatedData.findIndex((elem) => elem.ajWFStatiName || elem.workflowmapping);

        if (roleIndex === -1) {
            console.error("Role not found:", roleName);
            return;
        }

        const role = updatedData[roleIndex];
        if (!role.pulsantiAttivi) {
            role.pulsantiAttivi = {};
        }

        if (role.pulsantiAttivi[newStatusKey]) {
            ErrorToast("Status key already exists. Please choose a unique key.");
            return;
        }

        // Ensure ajWFStatiName exists
        if (!updatedData[workflowIndex].ajWFStatiName) {
            updatedData[workflowIndex].ajWFStatiName = {};
        }

        // Clone status in pulsantiAttivi
        const currentPulsanti = role.pulsantiAttivi;
        const updatedPulsanti = { [newStatusKey]: { ...currentPulsanti[statusToClone] } };
        Object.keys(currentPulsanti).forEach((key) => {
            updatedPulsanti[key] = currentPulsanti[key];
        });
        updatedData[roleIndex].pulsantiAttivi = updatedPulsanti;

        // Add to ajWFStatiName
        updatedData[workflowIndex].ajWFStatiName[newStatusKey] = { value: newStatusKey, title: newTitle };

        setEpWorkflowjson(JSON.stringify(updatedData));
        updateCanvasSize();
        handleClose();
    };

    const onSubmit = (data) => {
        handleCloneStatus(data);
        reset({ status: "", title: "" });
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5">Clona <span className="fw-bold">Stato</span></Modal.Title>
                </Modal.Header>
                <Modal.Body className="mx-3">
                    <Row lg={12} className="my-2">
                        <Col lg={3} className="d-flex justify-content-end align-items-center">Key sorgente</Col>
                        <Col lg={9} style={{ color: "#212529bf" }}>{statusToClone}</Col>
                    </Row>
                    <Col lg={12}>
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
                                Titolo
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
                                            placeholder="Inserisci il titolo"
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
                        <Button variant="primary" type="submit" className="mx-2">Clona Stato</Button>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CloneStatusModal;