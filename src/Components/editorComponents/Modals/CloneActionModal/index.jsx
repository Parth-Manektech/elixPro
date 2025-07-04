import React, { useEffect } from "react";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { initializeWorkflowMapping } from "../../ViewComponentUtility";

const CloneActionModal = ({ show, handleClose, roleName, actionToClone, MainData, setEpWorkflowjson, updateCanvasSize }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm();

    const handleCloneAction = (data) => {
        const newActionTitle = data.title.trim();
        if (!newActionTitle) {
            return;
        }

        const updatedData = initializeWorkflowMapping([...MainData]);
        const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === roleName);
        if (roleIndex === -1) {
            console.error("Role not found:", roleName);
            return;
        }

        const role = updatedData[roleIndex];
        if (!role.azioni) {
            role.azioni = [];
        }

        if (role.azioni.some((action) => action.title === newActionTitle)) {
            return;
        }

        const newAction = {
            ...actionToClone,
            title: newActionTitle,
            listArray: actionToClone.listArray.map((item, index) => ({
                ...item,
                key: `${item.key}_clone`,
                title: `${item.title}_clone`,
            })),
        };

        // Find the index of the original action
        const originalActionIndex = role.azioni.findIndex((action) => action.title === actionToClone.title);

        // Insert the new action immediately after the original action
        if (originalActionIndex !== -1) {
            role.azioni.splice(originalActionIndex + 1, 0, newAction);
        } else {
            // Fallback: append to the end if original action is not found
            role.azioni.push(newAction);
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        updateCanvasSize();
        handleClose();
    };

    const onSubmit = (data) => {
        handleCloneAction(data);
        reset({ title: "" });
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5">Clona <span className="fw-bold">Azione</span></Modal.Title>
                </Modal.Header>
                <Modal.Body className="mx-3">
                    <Row lg={12}>
                        <Col lg={3} className="d-flex justify-content-end align-items-center ">Nome sorgente</Col>
                        <Col lg={9} style={{ color: "#212529bf" }}>{actionToClone?.title}</Col>
                    </Row>
                    <Col lg={12} className="mt-2">
                        <div className="modal-sezione">
                            <span className="modal-sezione-titolo">Dati</span>
                            <div className="modal-sezione-line"></div>
                        </div>
                    </Col>

                    <Form.Group controlId="formTitle" className="my-3">
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
                                        validate: (value) => {
                                            const updatedData = [...MainData];
                                            const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === roleName);
                                            const role = updatedData[roleIndex];
                                            return !role?.azioni?.some((action) => action.title === value.trim()) || "Action title already exists. Please choose a unique title.";
                                        }
                                    }}
                                    render={({ field }) => (
                                        <Form.Control
                                            type="text"
                                            {...field}
                                            isInvalid={!!errors.title}
                                            placeholder="Inserisci il nome"
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
                        <Button variant="primary" type="submit" className="mx-2">Clona Categoria azione</Button>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CloneActionModal;