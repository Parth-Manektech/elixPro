import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import DeleteConfirmationModal from "../../../DeleteConfirmationModal";
import { initializeWorkflowMapping } from "../../ViewComponentUtility";
import Select from 'react-select';
import CustomSelect from "../../../CustomAutoSelect";
import CustomMultiSelect from "../../../CustomMultiSelect";


const ActionItemModal = ({ show, handleClose, initialData, MainData, currentFaculty, currentActionTitle, selectedActionItem, setEpWorkflowjson, setSelectedActionItem, setActionItemModalShow }) => {
    // console.log('initialData?.moveToList', initialData?.moveToList)
    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
        defaultValues: { ...initialData, moveToList: initialData?.moveToList?.length ? initialData?.moveToList?.split(',').map(item => item.trim()) : [], doNotMoveToList: initialData?.doNotMoveToList?.length ? initialData?.doNotMoveToList?.split(',').map(item => item.trim()) : [] } || {
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


    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const [isPassaAOnly, setIsPassaAOnly] = useState(false)


    const behaviourValueOptions = [
        { value: 'aggiungiSchedaAlFascicolo', label: 'aggiungiSchedaAlFascicolo' }, //no
        { value: 'apriProcessoEsterno', label: 'apriProcessoEsterno' },//n
        { value: 'clonaModulo', label: 'clonaModulo' },//y
        { value: 'generaPdfDaTemplate', label: 'generaPdfDaTemplate' },//n
        { value: 'passaABasic', label: 'passaABasic' },//y
        { value: 'passaAConFirmaDigitale', label: 'passaAConFirmaDigitale' },//y
        { value: 'passaAConMotivazione', label: 'passaAConMotivazione' },//y
        { value: 'passaAConMotivazioneAnnullandoFirmaDigitale', label: 'passaAConMotivazioneAnnullandoFirmaDigitale' },//y
        { value: 'riapriConMotivazione', label: 'riapriConMotivazione' },//y
    ];

    useEffect(() => {
        if (watch("behaviourTag") !== "aggiungiSchedaAlFascicolo" && watch("behaviourTag") !== "apriProcessoEsterno" && watch("behaviourTag") !== "generaPdfDaTemplate" && !!watch("behaviourTag")) {
            setIsPassaAOnly(true)
        } else {
            setIsPassaAOnly(false)
            setValue("moveToList", []);
            setValue("status", "");
            setValue("doNotMoveToList", []);
        }
    }, [watch('behaviourTag'), show])
    // console.log('isPassaAOnly', isPassaAOnly, watch('behaviourTag'))

    const validationRules = {
        required: 'Campo obbligatorio',
    };

    const validationRulesmulti = {
        validate: (value) =>
            Array.isArray(value) && value.length > 0 ? true : 'Campo obbligatorio',
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
        return Array.from(allStatuses);
    };

    const handleDeleteActionItem = () => {
        if (!selectedActionItem) return;
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const actionIndex = updatedData[facultyIndex].azioni.findIndex((action) => action.title === currentActionTitle);
        const workflowIndex = updatedData.length - 1;

        const itemKey = selectedActionItem.key;
        updatedData[facultyIndex].azioni[actionIndex].listArray = updatedData[facultyIndex].azioni[actionIndex].listArray.filter(
            (item) => item.key !== selectedActionItem.key
        );

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

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedActionItem(null);
        setActionItemModalShow(false);
    };


    const handleAddActionItem = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const actionIndex = updatedData[facultyIndex].azioni.findIndex((action) => action.title === currentActionTitle);
        const workflowIndex = updatedData.length - 1;

        if (selectedActionItem) {
            const oldKey = selectedActionItem.key;
            const newKey = data.key.trim();
            const itemIndex = updatedData[facultyIndex].azioni[actionIndex].listArray.findIndex((item) => item.key === selectedActionItem.key);
            updatedData[facultyIndex].azioni[actionIndex].listArray[itemIndex] = data;

            updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                if (wf.keyAzione === oldKey) {
                    wf.keyAzione = newKey;
                }
                wf.listeDestinazione = wf.listeDestinazione ? wf.listeDestinazione.map(key => key === oldKey ? newKey : key) : wf.listeDestinazione;
                wf.doNotlisteDestinazione = wf.doNotlisteDestinazione ? wf.doNotlisteDestinazione.map(key => key === oldKey ? newKey : key) : wf.doNotlisteDestinazione;
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
        } else {
            updatedData[facultyIndex].azioni[actionIndex].listArray.push(data);
        }

        const actionKey = data.key;

        const moveToListKeys = data?.moveToList?.length ? data.moveToList.split(',').map(key => key.trim()).filter(key => key) : "";
        const doNotMoveToListKeys = data.doNotMoveToList?.length ? data.doNotMoveToList.split(',').map(key => key.trim()).filter(key => key) : "";

        let workflowItemIndex = updatedData[workflowIndex].workflowmapping.findIndex((wf) => wf.keyAzione === actionKey);
        if (workflowItemIndex === -1) {
            updatedData[workflowIndex].workflowmapping.push({
                keyAzione: actionKey,
                behaviour: data.behaviourTag || '',
                statoDestinazione: data.status || '',
                listeDestinazione: moveToListKeys,
                doNotlisteDestinazione: doNotMoveToListKeys
            });
        } else {
            const existingWorkflow = updatedData[workflowIndex].workflowmapping[workflowItemIndex];
            existingWorkflow.statoDestinazione = data.status || '';
            existingWorkflow.listeDestinazione = moveToListKeys || [];
            existingWorkflow.doNotlisteDestinazione = doNotMoveToListKeys;
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedActionItem(null);
        setActionItemModalShow(false);
    };

    useEffect(() => {
        if (initialData) {
            reset({ ...initialData, moveToList: initialData?.moveToList?.length ? initialData?.moveToList?.split(',').map(item => item.trim()) : [], doNotMoveToList: initialData?.doNotMoveToList?.length ? initialData?.doNotMoveToList?.split(',').map(item => item.trim()) : [] });
        } else {
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
        }
    }, [initialData, show, reset]);

    const onSubmit = (data) => {

        const trimmedData = {
            ...data,
            key: data.key?.trim(),
            title: data.title?.trim(),
            type: data.type?.trim(),
            moveToList: data?.moveToList?.join(', ') || [],
            status: data.status?.trim() || '',
            doNotMoveToList: data?.doNotMoveToList?.join(', ') || [],
            behaviourTag: data.behaviourTag?.trim(),
            config: data.config?.trim(),
            notifica: data.config?.trim(),
            customerNotes: data.customerNotes?.trim() || '',
            developerNotes: data.developerNotes?.trim() || ''
        };
        handleAddActionItem(trimmedData);
        hendleFinalClose();
    };

    const hendleFinalClose = () => {
        reset({
            key: "",
            title: "",
            type: "",
            moveToList: [],
            status: "",
            doNotMoveToList: [],
            behaviourTag: "",
            config: "",
            notifica: "",
            customerNotes: "",
            developerNotes: ""
        });
        handleClose();

    }


    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = () => {
        handleDeleteActionItem();
        setShowDeleteConfirmation(false);
        hendleFinalClose();
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
    };

    const statusOptions = () => {
        return getStatusOptions()?.map((e) => {
            return {
                value: e,
                label: e
            }
        })
    };

    return (
        <>
            <Modal show={show} onHide={hendleFinalClose} size="xl">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Header closeButton className="fs-5">{initialData?.key ? "Modifica" : "Nuova"}&nbsp;<span className="fw-bold">Azione</span> </Modal.Header>
                    <Modal.Body className="mx-3">

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
                                        rules={{ required: "Campo obbligatorio" }}
                                        render={({ field }) => (
                                            <Form.Control type="text" placeholder="Inserisci la key" {...field} isInvalid={!!errors.key} />
                                        )}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.key?.message}</Form.Control.Feedback>
                                </Col>
                            </Row>
                        </Form.Group>

                        <Form.Group controlId="formTitle" className="mb-3">
                            <Row lg={12}>
                                <Col lg={3} className="d-flex justify-content-end align-items-center">
                                    nome
                                </Col>
                                <Col lg={9}>
                                    <Controller
                                        name="title"
                                        control={control}
                                        rules={{ required: "Campo obbligatorio" }}
                                        render={({ field }) => (
                                            <Form.Control type="text" placeholder="Inserisci la nome" {...field} isInvalid={!!errors.title} />
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
                                        rules={{ required: "Campo obbligatorio" }}
                                        render={({ field }) => (
                                            <Form.Select
                                                {...field}
                                                value={field.value}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value);
                                                }}
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
                        {
                            isPassaAOnly && (<>


                                <Col lg={12} className="mt-4">
                                    <div className="modal-sezione">
                                        <span className="modal-sezione-titolo">{"PASSA A (only)"}</span>
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
                                        rules={{}}
                                    />
                                </div>
                                <div className="mb-2">
                                    <CustomSelect
                                        options={statusOptions()}
                                        control={control}
                                        errors={errors}
                                        fieldName="status"
                                        placeholder="Seleziona lo stato di destinazione"
                                        label="Sposta nello Stato"
                                        rules={{}}
                                    />
                                </div>

                                <div className="mb-2">
                                    <CustomMultiSelect
                                        options={listOptions}
                                        control={control}
                                        errors={errors}
                                        fieldName="doNotMoveToList"
                                        placeholder="Seleziona la/e lista/e dacui non spostare"
                                        label="Non spostare dalla Lista"
                                        rules={{}}
                                    />
                                </div>

                            </>)
                        }



                        {/* <Form.Group controlId="formBehaviorTag" className="mb-3">
                            <Form.Label>Behavior Tag</Form.Label>
                            <Controller
                                name={"behaviourTag"}
                                control={control}
                                rules={{ required: "Behavior Tag is required" }} // Added required validation
                                render={({ field: { onChange, value } }) => (

                                    <Select
                                        placeholder="Select Behavior Tag"
                                        options={bihaviourtagOptions}
                                        isInvalid={!!errors.behaviourTag} // Show validation error styling
                                        value={bihaviourtagOptions.filter(option => value?.includes(option.value))}
                                        onChange={(selectedOptions) => {
                                            console.log('selectedOptions', value)
                                            onChange(selectedOptions?.value);
                                        }}
                                        className="basic-multi-select"
                                        classNamePrefix="select Behavior Tag"
                                    />
                                )}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.behaviourTag?.message}
                            </Form.Control.Feedback>
                        </Form.Group> */}
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



                        {/* <div className="d-flex justify-content-center mt-4">
                            <Button variant="primary" type="submit" className="mx-2">Save</Button>
                            <Button variant="dark" onClick={hendleFinalClose} className="mx-2">Close</Button>
                            <Button
                                variant="danger"
                                className="mx-2"
                                onClick={handleDeleteClick}
                                disabled={!initialData}
                            >
                                Delete
                            </Button>
                        </div> */}
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="d-flex justify-content-end mb-4">
                            <Button variant={initialData?.key ? "outline-primary" : "primary"} type="submit" className="mx-2">{initialData?.key ? "Applica" : "Crea Azione"}</Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>
            <DeleteConfirmationModal
                show={showDeleteConfirmation}
                handleClose={handleCancelDelete}
                handleConfirm={handleConfirmDelete}
                itemType="action item"
            />
        </>

    );
};

export default ActionItemModal;