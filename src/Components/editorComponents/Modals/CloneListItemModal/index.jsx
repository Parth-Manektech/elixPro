import React, { useEffect } from 'react';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { ErrorToast } from '../../../../utils/Toster';

function CloneListItemModal({ show, handleClose, roleName, listTitle, listItemToClone, MainData, setEpWorkflowjson }) {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            title: '',
            key: '',
            type: 'button',
            isDetailAllowed: 'true'
        }
    });

    useEffect(() => {
        reset({
            title: '',
            key: '',
            type: 'button',
            isDetailAllowed: 'true'
        });
    }, [listItemToClone, reset, show]);

    const onSubmit = (data) => {
        const trimmedData = {
            key: data.key.trim(),
            title: data.title.trim(),
            type: data.type.trim(),
            isDetailAllowed: data.isDetailAllowed.trim()
        };

        if (!trimmedData.title || !trimmedData.key) {
            ErrorToast('Please provide a title and key for the new list item.');
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
            console.error('No lists found for role:', roleName);
            return;
        }

        const listIndex = role.liste.findIndex((list) => list.title === listTitle);
        if (listIndex === -1) {
            console.error('List not found:', listTitle);
            return;
        }

        const listArray = role.liste[listIndex].listArray;
        if (listArray.some((item) => item.key === trimmedData.key)) {
            ErrorToast('Key already exists. Please choose a unique key.');
            return;
        }

        const newItem = {
            ...listItemToClone,
            ...trimmedData
        };

        listArray.push(newItem);
        setEpWorkflowjson(JSON.stringify(updatedData));
        handleClose();
        reset();
    };

    const handleFinalClose = () => {
        handleClose();
        reset();
    };

    return (
        <Modal show={show} onHide={handleFinalClose} size="xl">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Header className="fs-5" closeButton>
                    <Modal.Title>Clona Elemento Lista</Modal.Title>
                </Modal.Header>
                <Modal.Body className="mx-3">

                    <Row lg={12} className="my-2 " >
                        <Col lg={3} className="d-flex justify-content-end align-items-center">Key sorgente</Col>
                        <Col lg={9} style={{ color: "#212529bf" }}>{listItemToClone?.key}</Col>
                    </Row>
                    <Row lg={12}>
                        <Col lg={3} className="d-flex justify-content-end align-items-center ">Nome sorgente</Col>
                        <Col lg={9} style={{ color: "#212529bf" }}>{listItemToClone?.title}</Col>
                    </Row>


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
                                    rules={{ required: 'Campo obbligatorio' }}
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
                                    rules={{ required: 'Campo obbligatorio' }}
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
                                    rules={{ required: 'Campo obbligatorio' }}
                                    render={({ field }) => (
                                        <Form.Select
                                            {...field}
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.target.value)}
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
                                            checked={field.value === 'true'}
                                            onChange={(e) => field.onChange(e.target.checked ? 'true' : 'false')}
                                            isInvalid={!!errors.isDetailAllowed}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    )}
                                />
                                <Form.Control.Feedback type="invalid">{errors.isDetailAllowed?.message}</Form.Control.Feedback>
                            </Col>
                        </Row>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex justify-content-end mb-4">
                        <Button variant="primary" type="submit" className="mx-2">Clona lista</Button>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default CloneListItemModal;