import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
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

        if (selectedStatusItem) {
            const oldStatus = selectedStatusItem;
            const newStatus = data.status.trim();
            if (!updatedData[facultyIndex].pulsantiAttivi) {
                updatedData[facultyIndex].pulsantiAttivi = {};
            }

            const oldValue = updatedData[facultyIndex].pulsantiAttivi[oldStatus] || {};
            delete updatedData[facultyIndex].pulsantiAttivi[oldStatus];
            updatedData[facultyIndex].pulsantiAttivi[newStatus] = oldValue;

            updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                if (wf.statoDestinazione === oldStatus) {
                    wf.statoDestinazione = newStatus;
                }
            });

            // Add this block to update the status key in every action's listArray across all roles
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

            if (shownStatuses[currentFaculty] === oldStatus) {
                setShownStatuses(prev => ({
                    ...prev,
                    [currentFaculty]: newStatus
                }));
            }
        } else {
            if (!updatedData[facultyIndex].pulsantiAttivi) {
                updatedData[facultyIndex].pulsantiAttivi = {};
            }
            updatedData[facultyIndex].pulsantiAttivi[data.status.trim()] = {};
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
            <Modal show={show} onHide={handlefinalclose} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group controlId="formStatus" className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Controller
                                name="status"
                                control={control}
                                rules={{ required: "Status is required" }}
                                render={({ field }) => (
                                    <Form.Control type="text" {...field} isInvalid={!!errors.status} />
                                )}
                            />
                            <Form.Control.Feedback type="invalid">{errors.status?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-flex justify-content-center mt-4">
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
                        </div>
                    </Form>
                </Modal.Body>
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