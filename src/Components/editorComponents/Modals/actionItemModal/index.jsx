import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import DeleteConfirmationModal from "../../../DeleteConfirmationModal";
import { initializeWorkflowMapping } from "../../ViewComponentUtility";


const ActionItemModal = ({ show, handleClose, initialData, statusOptions, MainData, currentFaculty, currentActionTitle, selectedActionItem, setEpWorkflowjson, setSelectedActionItem, setActionItemModalShow }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || {
            key: "",
            title: "",
            type: "",
            moveToList: "",
            status: "",
            doNotMoveToList: "",
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
        } else {
            updatedData[facultyIndex].azioni[actionIndex].listArray.push(data);
        }

        const actionKey = data.key;
        const moveToListKeys = data.moveToList ? data.moveToList.split(',').map(key => key.trim()).filter(key => key) : [];
        const doNotMoveToListKeys = data.doNotMoveToList ? data.doNotMoveToList.split(',').map(key => key.trim()).filter(key => key) : [];

        let workflowItemIndex = updatedData[workflowIndex].workflowmapping.findIndex((wf) => wf.keyAzione === actionKey);
        if (workflowItemIndex === -1) {
            updatedData[workflowIndex].workflowmapping.push({
                keyAzione: actionKey,
                behaviour: data.behaviourTag || '',
                statoDestinazione: data.status || null,
                listeDestinazione: moveToListKeys,
                doNotlisteDestinazione: doNotMoveToListKeys
            });
        } else {
            const existingWorkflow = updatedData[workflowIndex].workflowmapping[workflowItemIndex];
            existingWorkflow.statoDestinazione = data.status || existingWorkflow.statoDestinazione || null;
            existingWorkflow.listeDestinazione = moveToListKeys;
            existingWorkflow.doNotlisteDestinazione = doNotMoveToListKeys;
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedActionItem(null);
        setActionItemModalShow(false);
    };

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        } else {
            reset({
                key: "",
                title: "",
                type: "",
                moveToList: "",
                status: "",
                doNotMoveToList: "",
                behaviourTag: "",
                config: "",
                notifica: "",
                customerNotes: "",
                developerNotes: ""
            });
        }
    }, [initialData, reset]);

    const onSubmit = (data) => {
        console.log('data.status', data)
        const trimmedData = {
            ...data,
            key: data.key?.trim(),
            title: data.title?.trim(),
            type: data.type?.trim(),
            moveToList: data.moveToList?.trim(),
            status: data.status?.trim(),
            doNotMoveToList: data.doNotMoveToList?.trim(),
            behaviourTag: data.behaviourTag?.trim(),
            config: data.config?.trim(),
            notifica: data.notifica?.trim(),
            customerNotes: data.customerNotes?.trim(),
            developerNotes: data.developerNotes?.trim()
        };
        handleAddActionItem(trimmedData);
        hendleFinalClose();
    };

    const hendleFinalClose = () => {
        reset({
            key: "",
            title: "",
            type: "",
            moveToList: "",
            status: "",
            doNotMoveToList: "",
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

    const filterSuggestions = (value) => {
        const inputValue = value.trim().toLowerCase();
        if (inputValue === "" || value === undefined) {
            // Show all status options when input is focused or empty
            setSuggestions([...statusOptions]);
            setShowSuggestions(true);
        } else {
            // Filter suggestions based on typing
            const filtered = statusOptions.filter(option =>
                option.toLowerCase().includes(inputValue)
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        }
    };

    return (
        <>
            <Modal show={show} onHide={hendleFinalClose} size="lg" centered>
                <Modal.Body>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group controlId="formKey" className="mb-3">
                            <Form.Label>Key</Form.Label>
                            <Controller
                                name="key"
                                control={control}
                                rules={{ required: "Key is required" }}
                                render={({ field }) => (
                                    <Form.Control type="text" {...field} isInvalid={!!errors.key} />
                                )}
                            />
                            <Form.Control.Feedback type="invalid">{errors.key?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="formTitle" className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Controller
                                name="title"
                                control={control}
                                rules={{ required: "Title is required" }}
                                render={({ field }) => (
                                    <Form.Control type="text" {...field} isInvalid={!!errors.title} />
                                )}
                            />
                            <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="formType" className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Controller
                                name="type"
                                control={control}
                                rules={{ required: "Type is required" }}
                                render={({ field }) => (
                                    <Form.Control type="text" {...field} isInvalid={!!errors.type} />
                                )}
                            />
                            <Form.Control.Feedback type="invalid">{errors.type?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="formMoveToList" className="mb-3">
                            <Form.Label>Move to List</Form.Label>
                            <Controller
                                name="moveToList"
                                control={control}
                                render={({ field }) => <Form.Control as="textarea" rows={1} {...field} />}
                            />
                        </Form.Group>

                        <Form.Group controlId="formSetToStatus" className="mb-3 position-relative">
                            <Form.Label>Set To Status</Form.Label>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <Form.Control
                                            type="text"
                                            {...field}
                                            autocomplete="off"
                                            placeholder="Type a status or use suggestions..."
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                filterSuggestions(e.target.value); // Filter suggestions as user types
                                            }}
                                            onFocus={() => filterSuggestions(field.value || "")} // Show all suggestions on focus
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Hide suggestions after blur
                                        />
                                        {showSuggestions && suggestions.length > 0 && (
                                            <ul
                                                className="dropdown-menu show w-100"
                                                style={{
                                                    position: "absolute",
                                                    zIndex: 1000,
                                                    maxHeight: "200px",
                                                    overflowY: "auto"
                                                }}
                                            >
                                                {suggestions.map((suggestion, index) => (
                                                    <li
                                                        key={index}
                                                        className="dropdown-item"
                                                        style={{ cursor: "pointer" }}
                                                        onMouseDown={() => {
                                                            field.onChange(suggestion);
                                                            setShowSuggestions(false);
                                                        }}
                                                    >
                                                        {suggestion}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                )}
                            />
                        </Form.Group>

                        <Form.Group controlId="formDoNotMoveToList" className="mb-3">
                            <Form.Label>Do Not Move to List</Form.Label>
                            <Controller
                                name="doNotMoveToList"
                                control={control}
                                render={({ field }) => <Form.Control as="textarea" rows={1} {...field} />}
                            />
                        </Form.Group>

                        <Form.Group controlId="formBehaviorTag" className="mb-3">
                            <Form.Label>Behavior Tag</Form.Label>
                            <Controller
                                name="behaviourTag"
                                control={control}
                                rules={{ required: "Behavior Tag is required" }} // Added required validation
                                render={({ field }) => (
                                    <Form.Control
                                        type="text"
                                        {...field}
                                        isInvalid={!!errors.behaviourTag} // Show validation error styling
                                    />
                                )}
                            />

                            <Form.Control.Feedback type="invalid">
                                {errors.behaviourTag?.message}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="formConfig" className="mb-3">
                            <Form.Label>Config</Form.Label>
                            <Controller
                                name="config"
                                control={control}
                                render={({ field }) => <Form.Control type="text" {...field} />}
                            />
                        </Form.Group>

                        <Form.Group controlId="formNotifica" className="mb-3">
                            <Form.Label>Notifica</Form.Label>
                            <Controller
                                name="notifica"
                                control={control}
                                render={({ field }) => <Form.Control type="text" {...field} />}
                            />
                        </Form.Group>

                        <Form.Group controlId="formCustomerNotes" className="mb-3">
                            <Form.Label>Customer Notes</Form.Label>
                            <Controller
                                name="customerNotes"
                                control={control}
                                render={({ field }) => <Form.Control as="textarea" rows={3} {...field} />}
                            />
                        </Form.Group>

                        <Form.Group controlId="formDeveloperNotes" className="mb-3">
                            <Form.Label>Developer Notes</Form.Label>
                            <Controller
                                name="developerNotes"
                                control={control}
                                render={({ field }) => <Form.Control as="textarea" rows={3} {...field} />}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-center mt-4">
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
                        </div>
                    </Form>
                </Modal.Body>
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