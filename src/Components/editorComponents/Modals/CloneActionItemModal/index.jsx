import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { initializeWorkflowMapping } from "../../ViewComponentUtility";
import CustomSelect from "../../../CustomAutoSelect";
import CustomMultiSelect from "../../../CustomMultiSelect";

const CloneActionItemModal = ({ show, handleClose, roleName, actionTitle, actionItemToClone, MainData, setEpWorkflowjson, updateCanvasSize }) => {
    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
        defaultValues: {
            key: "",
            title: "",
            type: "button",
            moveToList: [],
            status: "",
            doNotMoveToList: [],
            behaviourTag: "",
            config: "",
            notifica: "",
            customerNotes: "",
            developerNotes: ""
        }
    });

    const [isPassaAOnly, setIsPassaAOnly] = useState(null);

    const behaviourValueOptions = [
        { value: 'aggiungiSchedaAlFascicolo', label: 'aggiungiSchedaAlFascicolo' },
        { value: 'apriProcessoEsterno', label: 'apriProcessoEsterno' },
        { value: 'clonaModulo', label: 'clonaModulo' },
        { value: 'generaPdfDaTemplate', label: 'generaPdfDaTemplate' },
        { value: 'passaABasic', label: 'passaABasic' },
        { value: 'passaAConFirmaDigitale', label: 'passaAConFirmaDigitale' },
        { value: 'passaAConMotivazione', label: 'passaAConMotivazione' },
        { value: 'passaAConMotivazioneAnnullandoFirmaDigitale', label: 'passaAConMotivazioneAnnullandoFirmaDigitale' },
        { value: 'riapriConMotivazione', label: 'riapriConMotivazione' },
    ];

    useEffect(() => {
        if (watch("behaviourTag") !== "aggiungiSchedaAlFascicolo" && watch("behaviourTag") !== "apriProcessoEsterno" && watch("behaviourTag") !== "generaPdfDaTemplate" && !!watch("behaviourTag")) {
            setIsPassaAOnly(true);
        } else {
            setIsPassaAOnly(false);
            setValue("moveToList", []);
            setValue("status", "");
            setValue("doNotMoveToList", []);
        }
    }, [watch("behaviourTag"), show]);

    useEffect(() => {
        reset({
            key: "",
            title: "",
            type: "button",
            moveToList: [],
            status: "",
            doNotMoveToList: [],
            behaviourTag: "",
            config: "",
            notifica: "",
            customerNotes: "",
            developerNotes: ""
        });
    }, [actionItemToClone, show, reset]);

    const validationRules = {
        required: "Campo obbligatorio",
    };

    const validationRulesmulti = {
        validate: (value) => Array.isArray(value) && value.length > 0 ? true : "Campo obbligatorio",
    };

    const listOptions = MainData?.filter(item => item.ruolo && item.liste).flatMap(item =>
        item.liste.flatMap(liste =>
            liste.listArray.map(listItem => ({
                value: listItem.key,
                label: listItem.key
            }))
        )
    );

    const getStatusOptions = () => {
        if (!MainData) return [];
        const allStatuses = new Set();
        MainData.forEach((element) => {
            if (element.ruolo && element.pulsantiAttivi) {
                Object.keys(element.pulsantiAttivi).forEach((status) => allStatuses.add(status));
            }
        });
        return Array.from(allStatuses).map(e => ({ value: e, label: e }));
    };

    const handleCloneActionItem = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === roleName);
        if (roleIndex === -1) {
            console.error("Role not found:", roleName);
            return;
        }

        const role = updatedData[roleIndex];
        if (!role.azioni) {
            console.error("No actions found for role:", roleName);
            return;
        }

        const actionIndex = role.azioni.findIndex((action) => action.title === actionTitle);
        if (actionIndex === -1) {
            console.error("Action not found:", actionTitle);
            return;
        }

        const actionArray = role.azioni[actionIndex].listArray;
        if (actionArray.some((item) => item.key === data.key.trim())) {
            return;
        }

        const newItem = {
            ...data,
            key: data.key?.trim(),
            title: data.title?.trim(),
            type: data.type?.trim(),
            moveToList: data.moveToList?.join(', ') || "",
            status: data.status?.trim() || "",
            doNotMoveToList: data.doNotMoveToList?.join(', ') || "",
            behaviourTag: data.behaviourTag?.trim() || "",
            config: data.config?.trim() || "",
            notifica: data.notifica?.trim() || "",
            customerNotes: data.customerNotes?.trim() || "",
            developerNotes: data.developerNotes?.trim() || ""
        };

        // Find the index of the original action item
        const originalItemIndex = actionArray.findIndex((item) => item.key === actionItemToClone.key);

        // Insert the new item immediately after the original item
        if (originalItemIndex !== -1) {
            actionArray.splice(originalItemIndex + 1, 0, newItem);
        } else {
            // Fallback: append to the end if original item is not found
            actionArray.push(newItem);
        }

        const actionKey = newItem.key;
        const moveToListKeys = newItem.moveToList ? newItem.moveToList.split(',').map(key => key.trim()).filter(key => key) : [];
        const doNotMoveToListKeys = newItem.doNotMoveToList ? newItem.doNotMoveToList.split(',').map(key => key.trim()).filter(key => key) : [];

        const workflowIndex = updatedData.length - 1;
        let workflowItemIndex = updatedData[workflowIndex].workflowmapping.findIndex((wf) => wf.keyAzione === actionKey);
        if (workflowItemIndex === -1) {
            updatedData[workflowIndex].workflowmapping.push({
                keyAzione: actionKey,
                behaviour: newItem.behaviourTag || "",
                statoDestinazione: newItem.status || null,
                listeDestinazione: moveToListKeys,
                doNotlisteDestinazione: doNotMoveToListKeys
            });
        } else {
            const existingWorkflow = updatedData[workflowIndex].workflowmapping[workflowItemIndex];
            existingWorkflow.statoDestinazione = newItem.status || existingWorkflow.statoDestinazione || null;
            existingWorkflow.listeDestinazione = moveToListKeys || [];
            existingWorkflow.doNotlisteDestinazione = doNotMoveToListKeys;
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        updateCanvasSize();
        handleClose();
    };

    const onSubmit = (data) => {
        handleCloneActionItem(data);
        reset({
            key: "",
            title: "",
            type: "button",
            moveToList: [],
            status: "",
            doNotMoveToList: [],
            behaviourTag: "",
            config: "",
            notifica: "",
            customerNotes: "",
            developerNotes: ""
        });
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5">Clona <span className="fw-bold">Elemento Azione</span></Modal.Title>
                </Modal.Header>
                <Modal.Body className="mx-3">
                    <Row lg={12} className="my-2 " >
                        <Col lg={3} className="d-flex justify-content-end align-items-center">Key sorgente</Col>
                        <Col lg={9} style={{ color: "#212529bf" }}>{actionItemToClone?.key}</Col>
                    </Row>
                    <Row lg={12}>
                        <Col lg={3} className="d-flex justify-content-end align-items-center ">Nome sorgente</Col>
                        <Col lg={9} style={{ color: "#212529bf" }}>{actionItemToClone?.title}</Col>
                    </Row>

                    <Col lg={12} className="mt-2">
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
                                        validate: (value) => {
                                            const updatedData = [...MainData];
                                            const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === roleName);
                                            const role = updatedData[roleIndex];
                                            const actionIndex = role?.azioni?.findIndex((action) => action.title === actionTitle);
                                            return !role?.azioni?.[actionIndex]?.listArray?.some((item) => item.key === value.trim()) || "Key already exists. Please choose a unique key.";
                                        }
                                    }}
                                    render={({ field }) => (
                                        <Form.Control
                                            type="text"
                                            placeholder="Inserisci la key"
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
                                        <Form.Control
                                            type="text"
                                            placeholder="Inserisci la nome"
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
                                Tipo (to-be-removed)
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

                    <CustomSelect
                        options={behaviourValueOptions}
                        control={control}
                        errors={errors}
                        fieldName="behaviourTag"
                        placeholder="Seleziona il tipo di behaviour"
                        label="Behaviour"
                        rules={validationRules}
                    />

                    {isPassaAOnly && (
                        <>
                            <Col lg={12} className="mt-4">
                                <div className="modal-sezione">
                                    <span className="modal-sezione-titolo">PASSA A (only)</span>
                                    <div className="modal-sezione-line"></div>
                                </div>
                            </Col>
                            <div className="mb-2">
                                <CustomMultiSelect
                                    options={listOptions}
                                    control={control}
                                    errors={errors}
                                    fieldName="moveToList"
                                    placeholder="Seleziona la/e lista/e di destinazione"
                                    label="Sposta nella Lista"
                                    rules={validationRulesmulti}
                                />
                            </div>
                            <div className="mb-2">
                                <CustomSelect
                                    options={getStatusOptions()}
                                    control={control}
                                    errors={errors}
                                    fieldName="status"
                                    placeholder="Seleziona lo stato di destinazione"
                                    label="Sposta nello Stato"
                                    rules={validationRules}
                                />
                            </div>
                            <div className="mb-2">
                                <CustomMultiSelect
                                    options={listOptions}
                                    control={control}
                                    errors={errors}
                                    fieldName="doNotMoveToList"
                                    placeholder="Seleziona la/e lista/e da cui non spostare"
                                    label="Non spostare dalla Lista"
                                    rules={validationRulesmulti}
                                />
                            </div>
                        </>
                    )}

                    <Col lg={12} className="mt-3">
                        <div className="modal-sezione">
                            <span className="modal-sezione-titolo">Avanzate</span>
                            <div className="modal-sezione-line"></div>
                        </div>
                    </Col>

                    <Form.Group controlId="formConfig" className="mb-3">
                        <Row lg={12}>
                            <Col lg={3} className="d-flex justify-content-end align-items-center">
                                Config + Notifica
                            </Col>
                            <Col lg={9}>
                                <Controller
                                    name="config"
                                    control={control}
                                    render={({ field }) => <Form.Control as="textarea" rows={3} {...field} />}
                                />
                            </Col>
                        </Row>
                    </Form.Group>


                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex justify-content-end mb-4">
                        <Button variant="primary" type="submit" className="mx-2">Clona Azione</Button>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CloneActionItemModal;