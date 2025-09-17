import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { ErrorToast } from '../../../../utils/Toster';

function CloneListModal({ show, handleClose, roleName, listToClone, MainData, setEpWorkflowjson }) {
    const { control, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit = (data) => {
        if (!data.title) {
            ErrorToast('Please provide a title for the new list.');
            return;
        }

        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === roleName);
        if (roleIndex === -1) {
            console.error('Role not found:', roleName);
            return;
        }

        const role = updatedData[roleIndex];
        if (!role.liste) {
            role.liste = [];
        }

        if (role.liste.some((list) => list.title === data.title)) {
            ErrorToast('List title already exists. Please choose a unique title.');
            return;
        }

        const newList = {
            ...listToClone,
            title: data.title,
            listArray: listToClone.listArray.map((item, index) => ({
                ...item,
                key: `${item.key}_clone`,
                title: `${item.title}_clone`,
            })),
        };

        role.liste.push(newList);
        setEpWorkflowjson(JSON.stringify(updatedData));
        handleClose();
    };

    const onClose = () => {
        handleClose();
        reset({});
    };

    return (
        <Modal show={show} onHide={onClose} size='xl'>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Header closeButton>
                    <Modal.Title className='fs-5'>Clona <span className='fw-bold'>Categoria lista</span></Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Row lg={12}>
                        <Col lg={3} className="d-flex justify-content-end align-items-center ">Nome sorgente</Col>
                        <Col lg={9} style={{ color: "#212529bf" }}>{listToClone?.title}</Col>
                    </Row>

                    <Col lg={12} className="mt-3">
                        <div className="modal-sezione">
                            <span className="modal-sezione-titolo">Dati</span>
                            <div className="modal-sezione-line"></div>
                        </div>
                    </Col>

                    <Form.Group className="mb-3">
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
                                            placeholder="Inserisci la nome"
                                            {...field}
                                            isInvalid={!!errors.title}
                                        />
                                    )}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.title?.message}
                                </Form.Control.Feedback>
                            </Col>
                        </Row>

                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex justify-content-end mb-4">
                        <Button variant="primary" type="submit" className="mx-2">Clona Categoria lista</Button>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default CloneListModal;