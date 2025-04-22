import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import DeleteConfirmationModal from "../../../DeleteConfirmationModal";
import { initializeWorkflowMapping } from "../../ViewComponentUtility";

const ListItemModal = ({ show, handleClose, initialData, MainData, currentFaculty, currentListTitle, selectedListItem, setEpWorkflowjson, setSelectedListItem, setListItemModalShow }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || { key: "", title: "", type: "", isDetailAllowed: "" }
    });
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    useEffect(() => {
        reset(initialData || { key: "", title: "", type: "", isDetailAllowed: "" });
    }, [initialData, reset]);

    const onSubmit = (data) => {
        const trimmedData = {
            key: data.key.trim(),
            title: data.title.trim(),
            type: data.type.trim(),
            isDetailAllowed: data.isDetailAllowed.trim()
        };
        handleAddListItem(trimmedData);
        hendleFinalClose()
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = () => {
        handleDeleteListItem();
        setShowDeleteConfirmation(false);
        hendleFinalClose()
    };

    const hendleFinalClose = () => {
        handleClose()
        reset({ key: "", title: "", type: "", isDetailAllowed: "" });
    }

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
    };

    const handleDeleteListItem = () => {
        if (!selectedListItem) return;
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        const listIndex = updatedData[facultyIndex].liste.findIndex((list) => list.title === currentListTitle);
        const itemKey = selectedListItem.key;
        updatedData[facultyIndex].liste[listIndex].listArray = updatedData[facultyIndex].liste[listIndex].listArray.filter(
            (item) => item.key !== selectedListItem.key
        );

        updatedData[workflowIndex].workflowmapping.forEach((wf) => {
            wf.listeDestinazione = wf.listeDestinazione.filter(key => key !== itemKey);
            wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.filter(key => key !== itemKey);
        });

        updatedData[facultyIndex].azioni.forEach(action => {
            action.listArray.forEach(item => {
                if (item.moveToList) {
                    const moveToListKeys = item.moveToList.split(',').map(key => key.trim());
                    item.moveToList = moveToListKeys.filter(key => key !== itemKey).join(', ');
                }
                if (item.doNotMoveToList) {
                    const doNotMoveToListKeys = item.doNotMoveToList.split(',').map(key => key.trim());
                    item.doNotMoveToList = doNotMoveToListKeys.filter(key => key !== itemKey).join(', ');
                }
            });
        });

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedListItem(null);
        setListItemModalShow(false);
    };


    const handleAddListItem = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        const listIndex = updatedData[facultyIndex].liste.findIndex((list) => list.title === currentListTitle);
        if (selectedListItem) {
            const oldKey = selectedListItem.key;
            const newKey = data.key.trim();
            const itemIndex = updatedData[facultyIndex].liste[listIndex].listArray.findIndex((item) => item.key === selectedListItem.key);
            updatedData[facultyIndex].liste[listIndex].listArray[itemIndex] = data;

            updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                wf.listeDestinazione = wf.listeDestinazione.map(key => key === oldKey ? newKey : key);
                wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.map(key => key === oldKey ? newKey : key);
            });

            updatedData[facultyIndex].azioni.forEach(action => {
                action.listArray.forEach(item => {
                    if (item.moveToList) {
                        const moveToListKeys = item.moveToList.split(',').map(key => key.trim());
                        const updatedMoveToList = moveToListKeys.map(key => key === oldKey ? newKey : key).join(', ');
                        item.moveToList = updatedMoveToList;
                    }
                    if (item.doNotMoveToList) {
                        const doNotMoveToListKeys = item.doNotMoveToList.split(',').map(key => key.trim());
                        const updatedDoNotMoveToList = doNotMoveToListKeys.map(key => key === oldKey ? newKey : key).join(', ');
                        item.doNotMoveToList = updatedDoNotMoveToList;
                    }
                });
            });
        } else {
            updatedData[facultyIndex].liste[listIndex].listArray.push(data);
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedListItem(null);
        setListItemModalShow(false);
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

                        <Form.Group controlId="formDetailAllowed" className="mb-3">
                            <Form.Label>Is Detail Allowed</Form.Label>
                            <Controller
                                name="isDetailAllowed"
                                control={control}
                                rules={{ required: "This field is required" }}
                                render={({ field }) => (
                                    <Form.Control type="text" {...field} isInvalid={!!errors.isDetailAllowed} />
                                )}
                            />
                            <Form.Control.Feedback type="invalid">{errors.isDetailAllowed?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-flex justify-content-center mt-4">
                            <Button variant="primary" type="submit" className="mx-2">Save</Button>
                            <Button variant="dark" onClick={hendleFinalClose} className="mx-2">Close</Button>
                            <Button
                                variant="danger"
                                className="mx-2"
                                onClick={handleDeleteClick}
                                disabled={!initialData} // Disabled if adding new item
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
                itemType="list item"
            />
        </>
    );
};

export default ListItemModal;