import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";

const CloneRoleModal = ({ roleToClone, show, handleClose, onClone, initialNome }) => {

    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm({});

    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const [listaOption, setlistaOption] = useState(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);


    useEffect(() => {

        const option = roleToClone?.liste?.flatMap(l => l?.listArray || []) || [];

        if (roleToClone?.ruolo?.listaDefault) {
            console.log('first', roleToClone?.ruolo?.listaDefault?.trim())
            setSelectedOption(roleToClone?.ruolo?.listaDefault?.trim());
        }

        if (option.length) {
            setlistaOption(option?.map((e) => ({
                value: e.title,
                label: e.key
            })));
        } else {
            setlistaOption([{
                label: 'Lista starter (da rinominare)',
                value: 'list__starter'
            }]);
        }


        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSelectOpen(false);
                setSearchTerm('');
                setFocusedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
        // eslint-disable-next-line
    }, [roleToClone]);


    const onSubmit = (data) => {
        onClone({
            key: data.key.trim(),
            nome: data.nome.trim(),
            descrizione: data.descrizione.trim(),
            listaDefault: selectedOption?.trim() || '',
        });
        handleClose();
    };

    const onClose = () => {
        handleClose();
        reset({});
        setSelectedOption(null);
        setIsSelectOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
    };


    const filteredOptions = listaOption?.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleKeyDown = (e) => {
        if (!isSelectOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => prev > -1 ? prev - 1 : prev);
                break;
            case 'Enter':
                e.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[focusedIndex]);
                }
                break;
            case 'Escape':
                setIsSelectOpen(false);
                setSearchTerm('');
                setFocusedIndex(-1);
                break;
            default:
                break;
        }
    };

    const handleSelect = (option) => {
        setSelectedOption(option.label);
        setValue('listaDefault', option.label);
        setIsSelectOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
    };

    const clearSelection = (e) => {
        e.stopPropagation();
        setSelectedOption(null);
        setValue('listaDefault', '');
        setSearchTerm('');
        setFocusedIndex(-1);
    };


    return (
        <Modal show={show} onHide={onClose} size="xl">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Header closeButton> <div className="fs-5">Clona <span className="fw-bold">Ruolo</span></div></Modal.Header>
                <Modal.Body className="mx-3">


                    <Row lg={12} className="my-2 " >
                        <Col lg={3} className="d-flex justify-content-end align-items-center">Key sorgente</Col>
                        <Col lg={9} style={{ color: "#212529bf" }}>{roleToClone?.ruolo?.key}</Col>
                    </Row>
                    <Row lg={12}>
                        <Col lg={3} className="d-flex justify-content-end align-items-center ">Nome sorgente</Col>
                        <Col lg={9} style={{ color: "#212529bf" }}>{roleToClone?.ruolo?.nome}</Col>
                    </Row>

                    <Col lg={12} className="mt-3">
                        <div className="modal-sezione">
                            <span className="modal-sezione-titolo">Dati</span>
                            <div className="modal-sezione-line"></div>
                        </div>
                    </Col>

                    {/* <Row lg={12}>
                        <Col lg={3} className="d-flex justify-content-end align-items-center">
                        </Col>
                        <Col lg={9}>
                        </Col>
                    </Row>  */}

                    <Form.Group controlId="formCloneKey" className="mb-2 mt-2">
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
                                    }}
                                    render={({ field }) => (
                                        <Form.Control type="text" placeholder="Inserisci la key" {...field} isInvalid={!!errors.key} />
                                    )}
                                />
                                <Form.Control.Feedback type="invalid">{errors.key?.message}</Form.Control.Feedback>
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Group controlId="formCloneNome" className="mb-2">
                        <Row lg={12}>
                            <Col lg={3} className="d-flex justify-content-end align-items-center">
                                Name
                            </Col>
                            <Col lg={9}>
                                <Controller
                                    name="nome"
                                    control={control}
                                    rules={{ required: "Campo obbligatorio" }}
                                    render={({ field }) => (
                                        <Form.Control placeholder="Inserisci la nome" type="text" {...field} isInvalid={!!errors.nome} />
                                    )}
                                />
                                <Form.Control.Feedback type="invalid">{errors.nome?.message}</Form.Control.Feedback>
                            </Col>
                        </Row>
                    </Form.Group>


                    <Form.Group controlId="formDescrizione" className="mb-3">
                        <Row lg={12}>
                            <Col lg={3} className="d-flex justify-content-end align-items-start mt-2">
                                Descrizione
                            </Col>
                            <Col lg={9}>
                                <Controller
                                    name="descrizione"
                                    control={control}
                                    rules={{ required: "Campo obbligatorio" }}
                                    render={({ field }) => (
                                        <Form.Control as="textarea" placeholder="Inserisci una decrizione" rows={3} {...field} isInvalid={!!errors.descrizione} />
                                    )}
                                />
                                <Form.Control.Feedback type="invalid">{errors.descrizione?.message}</Form.Control.Feedback>
                            </Col>
                        </Row>

                    </Form.Group>

                    <Col lg={12}>
                        <div className="modal-sezione">
                            <span className="modal-sezione-titolo">Impostazioni</span>
                            <div className="modal-sezione-line"></div>
                        </div>
                    </Col>


                    <div className="form-group">
                        <Row lg={12}>
                            <Col lg={3} className="d-flex justify-content-end align-items-start mt-2">
                                Lista Default
                            </Col>
                            <Col lg={9}>
                                <div className="dropdown" ref={dropdownRef}>
                                    <button
                                        className={`custom-autocomplete-input ${errors.listaDefault ? 'is-invalid' : ''}`}
                                        type="button"
                                        onClick={() => {
                                            setIsSelectOpen(!isSelectOpen);
                                            if (!isSelectOpen) inputRef.current?.focus();
                                        }}
                                        onKeyDown={handleKeyDown}
                                    >
                                        <span className="selected-option">
                                            {selectedOption || (
                                                <span style={{ color: "#565a5f" }}>
                                                    Lista di default
                                                </span>
                                            )}
                                        </span>
                                        <span className="dropdown-icons">
                                            {(selectedOption && isSelectOpen) && (
                                                <i
                                                    className="bi bi-x-circle me-2"
                                                    onClick={clearSelection}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            )}
                                            <i className={`bi bi-chevron-${isSelectOpen ? 'up' : 'down'}`}></i>
                                        </span>
                                    </button>
                                    {isSelectOpen && (
                                        <div
                                            className="dropdown-menu show"
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                maxHeight: '200px',
                                                overflowY: 'auto'
                                            }}
                                        >
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                className="form-control mb-2 autocomplete-inputSearch"
                                                placeholder="Cerca..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setFocusedIndex(-1);
                                                }}
                                                onKeyDown={handleKeyDown}
                                            />
                                            {filteredOptions.length > 0 ? (
                                                filteredOptions.map((option, index) => (
                                                    <span
                                                        key={option.value}
                                                        className={`dropdown-item ${index === focusedIndex ? 'active' : ''}`}
                                                        onClick={() => handleSelect(option)}
                                                        onMouseEnter={() => setFocusedIndex(index)}
                                                    >
                                                        {option.label}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="dropdown-item disabled">Nessun risultato</span>
                                            )}
                                        </div>
                                    )}
                                    {(!selectedOption && errors.listaDefault) && (
                                        <div className="invalid-feedback d-block">
                                            {errors.listaDefault.message}
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex justify-content-end mb-4">
                        <Button variant="primary" type="submit" className="mx-2">Clona Ruolo</Button>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CloneRoleModal;