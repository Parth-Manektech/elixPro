import React, { useState, useRef, useEffect } from 'react';
import { ViewOpenEyeIcon, ViewClosedEyeIcon, SlidersIcon, ArrowMove, ThreeDotsIcon, PlusIcon } from '../../../../Assets/SVGs';
import { toggleStatusVisibility } from '../../ViewComponentUtility';
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CloneStatusModal from '../../Modals/CloneStatusModal';
import DeleteStatusModal from '../../Modals/DeleteStatusModal';
import { drawSelectedElementArrows } from '../../../../utils/arrowUtils';

function StatusSection({
    pulsantiAttivi,
    roleName,
    element,
    shownStatus,
    setShownStatuses,
    openStatusItemModal,
    setHoveredStatus,
    setHoveredAction,
    MainData,
    draggingItem,
    setDraggingItem,
    hoveredStatus,
    refsMap,
    setEpWorkflowjson,
    isEditMode,
    containerRef,
    selectedElement,
    setSelectedElement,
    clearLeaderLines,
    createLeaderLine,
    leaderLinesRef,
    duplicateCount,
    setDuplicateCount
}) {
    const [cloneStatusModalShow, setCloneStatusModalShow] = useState(false);
    const [deleteStatusModalShow, setDeleteStatusModalShow] = useState(false);
    const [statusToClone, setStatusToClone] = useState(null);
    const [statusToDelete, setStatusToDelete] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);
    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const dragStartSourceRefStatus = useRef(null);

    const updateLeaderLines = () => {
        leaderLinesRef.current.forEach(line => line.position());
    };

    const rulekey = element?.ruolo?.key;

    const getStatusOptions = () => {
        if (!MainData) return [];
        const allStatuses = new Set();
        MainData.forEach((element) => {
            if (element.ruolo && element.pulsantiAttivi && element?.ruolo?.key !== rulekey) {
                Object.keys(element.pulsantiAttivi).forEach((status) => allStatuses.add(status));
            }
        });
        return Array.from(allStatuses);
    };

    const getStatusTitle = (statusKey) => {
        const workflowIndex = MainData.findIndex((elem) => elem.ajWFStatiName || elem.workflowmapping);
        if (workflowIndex !== -1 && MainData[workflowIndex].ajWFStatiName?.[statusKey]) {
            return MainData[workflowIndex].ajWFStatiName[statusKey].title;
        }
        return statusKey; // Fallback to key if title not found
    };

    const handleStatusMouseHover = (statusItemKey) => {
        setHoveredStatus({ role: roleName, status: statusItemKey });
        setHoveredAction(null);
        clearLeaderLines();

        const isElementVisible = (id) => {
            const element = document.getElementById(id);
            return element && element.offsetParent !== null;
        };

        const workflowIndex = MainData.length - 1;
        if (MainData[workflowIndex]?.workflowmapping) {
            MainData[workflowIndex].workflowmapping.forEach((wf) => {
                if (
                    wf.statoDestinazione === statusItemKey &&
                    isElementVisible(wf.keyAzione) &&
                    isElementVisible(statusItemKey)
                ) {
                    createLeaderLine(
                        wf.keyAzione,
                        statusItemKey,
                        'rgba(14, 165, 233, 0.25)',
                        'behind',
                        'arrow2',
                        false,
                        containerRef
                    );
                }
            });
        }

        if (selectedElement) {
            drawSelectedElementArrows(
                selectedElement,
                MainData,
                createLeaderLine,
                containerRef,
                refsMap
            );
        }
    };

    const handleMouseLeave = (statusItemKey) => {
        if (!refsMap.current[statusItemKey]) return;
        setHoveredStatus(null);
        setHoveredAction(null);
        clearLeaderLines();

        if (selectedElement) {
            drawSelectedElementArrows(
                selectedElement,
                MainData,
                createLeaderLine,
                containerRef
            );
        }
    };

    const handleStatusClick = (statusItemKey) => {
        toggleStatusVisibility(roleName, statusItemKey, setShownStatuses);

        const newSelectedElement = { type: 'status', roleName, statusItemKey };
        if (
            selectedElement?.type === 'status' &&
            selectedElement.statusItemKey === statusItemKey &&
            selectedElement.roleName === roleName
        ) {
            setSelectedElement(null);
            clearLeaderLines();
        } else {
            setSelectedElement(newSelectedElement);
            setHoveredStatus(null);
            setHoveredAction(null);
            clearLeaderLines();

            const isElementVisible = (id) => {
                const element = document.getElementById(id);
                return element && element.offsetParent !== null;
            };

            const workflowIndex = MainData.length - 1;
            if (MainData[workflowIndex]?.workflowmapping) {
                MainData[workflowIndex].workflowmapping.forEach((wf) => {
                    if (
                        wf.statoDestinazione === statusItemKey &&
                        isElementVisible(wf.keyAzione) &&
                        isElementVisible(statusItemKey)
                    ) {
                        createLeaderLine(
                            wf.keyAzione,
                            statusItemKey,
                            'rgba(124, 195, 225, 1)',
                            'behind',
                            'arrow2',
                            true,
                            containerRef
                        );
                    }
                });
            }
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        const updateLeaderLines = () => {
            leaderLinesRef.current.forEach((line) => line.position());
        };

        if (container) {
            container.addEventListener('scroll', updateLeaderLines);
        }

        if (selectedElement?.type === 'status' && selectedElement.roleName === roleName) {
            drawSelectedElementArrows(
                selectedElement,
                MainData,
                createLeaderLine,
                containerRef,
                refsMap
            );
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', updateLeaderLines);
            }
        };
    }, [containerRef, MainData, selectedElement, createLeaderLine, clearLeaderLines, leaderLinesRef, refsMap]);

    const handleStatusDragStart = (e, statusItemKey) => {
        const actualClickedElement = dragStartSourceRefStatus.current;
        if (!isEditMode || actualClickedElement?.className?.baseVal !== "ArrowMoveStatus") {
            e.preventDefault();
            return;
        }
        setDraggingItem({ type: 'status', facultyName: roleName, statusItemKey });
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'status', statusItemKey, facultyName: roleName }));
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
    };

    const handleStatusDragOver = (e, statusItemKey, targetRoleName) => {
        e.preventDefault();
        if (draggingItem?.type === 'status') {
            setDropTarget({ type: 'status', statusItemKey, roleName: targetRoleName });
        }
    };

    const handleStatusDragLeave = () => {
        setDropTarget(null);
    };

    const handleStatusDrop = (e, targetStatusKey, targetRoleName, isLastPosition = false) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggingItem || draggingItem.type !== 'status') {
            setDraggingItem(null);
            setDropTarget(null);
            return;
        }

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const sourceStatusKey = data.statusItemKey;
            const sourceFacultyName = data.facultyName;

            if (sourceFacultyName === targetRoleName && sourceStatusKey === targetStatusKey) {
                setDraggingItem(null);
                setDropTarget(null);
                return;
            }

            setEpWorkflowjson((prevJson) => {
                const data = JSON.parse(prevJson);
                const sourceFacultyIndex = data.findIndex((item) => item.ruolo?.nome === sourceFacultyName);
                const targetFacultyIndex = data.findIndex((item) => item.ruolo?.nome === targetRoleName);

                if (sourceFacultyIndex === -1 || targetFacultyIndex === -1) {
                    console.error('Faculty not found:', { sourceFacultyName, targetRoleName });
                    return prevJson;
                }

                const sourceStatusArray = Object.keys(data[sourceFacultyIndex].pulsantiAttivi || {});
                const sourceIndex = sourceStatusArray.indexOf(sourceStatusKey);

                if (sourceIndex === -1) {
                    console.error('Source status not found:', sourceStatusKey);
                    return prevJson;
                }

                const movedStatus = { [sourceStatusKey]: data[sourceFacultyIndex].pulsantiAttivi[sourceStatusKey] };
                delete data[sourceFacultyIndex].pulsantiAttivi[sourceStatusKey];

                // Initialize pulsantiAttivi if it doesn't exist
                if (!data[targetFacultyIndex].pulsantiAttivi) {
                    data[targetFacultyIndex].pulsantiAttivi = {};
                }
                const targetStatusArray = Object.keys(data[targetFacultyIndex].pulsantiAttivi);

                if (isLastPosition) {
                    // Append to the end of the target status array
                    data[targetFacultyIndex].pulsantiAttivi[sourceStatusKey] = movedStatus[sourceStatusKey];
                } else {
                    const targetIndex = targetStatusArray.indexOf(targetStatusKey);
                    if (targetIndex === -1) {
                        data[targetFacultyIndex].pulsantiAttivi[sourceStatusKey] = movedStatus[sourceStatusKey];
                    } else {
                        const newTargetStatusArray = [...targetStatusArray];
                        newTargetStatusArray.splice(targetIndex, 0, sourceStatusKey);
                        const newPulsantiAttivi = {};
                        newTargetStatusArray.forEach((key) => {
                            newPulsantiAttivi[key] = data[targetFacultyIndex].pulsantiAttivi[key] || movedStatus[key];
                        });
                        data[targetFacultyIndex].pulsantiAttivi = newPulsantiAttivi;
                    }
                }

                return JSON.stringify(data);
            });
        } catch (error) {
            console.error('Error parsing drag data:', error);
        }
        setDraggingItem(null);
        setDropTarget(null);
    };

    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            La Key non è univoca! Viene usata più volte.
        </Tooltip>
    );

    return (
        <div className="d-flex flex-column gap-1 column">
            <div className='d-flex justify-content-center align-item-center mt-1 mb-1'>
                <SlidersIcon height={15} width={15} fill='#6c757d' className='d-flex justify-content-center align-item-center me-1' />
                <span style={{ color: '#6c757d', margin: "-5px 0 0 0" }}>STATI</span>
            </div>
            {pulsantiAttivi &&
                Object.keys(pulsantiAttivi).map((StatusItem) => {
                    const isDublicate = getStatusOptions().includes(StatusItem);
                    return (
                        <span
                            ref={(el) => (refsMap.current[StatusItem] = el)}
                            className={`StatusItemTitle ${dropTarget?.type === 'status' && dropTarget?.statusItemKey === StatusItem && dropTarget?.roleName === roleName ? 'drop-target' : ''}`}
                            id={StatusItem}
                            onMouseEnter={() => handleStatusMouseHover(StatusItem)}
                            onMouseLeave={() => handleMouseLeave(StatusItem)}
                            onClick={() => handleStatusClick(StatusItem)}
                            draggable={isEditMode}
                            onDragStart={(e) => handleStatusDragStart(e, StatusItem)}
                            onDragOver={(e) => handleStatusDragOver(e, StatusItem, roleName)}
                            onDragLeave={handleStatusDragLeave}
                            onDrop={(e) => handleStatusDrop(e, StatusItem, roleName)}
                            key={StatusItem}
                            onMouseDown={(e) => {
                                dragStartSourceRefStatus.current = e.target;
                            }}
                            style={{
                                backgroundColor: selectedElement?.type === 'status' && selectedElement.statusItemKey === StatusItem && selectedElement.roleName === roleName ? '#343a40' : '',
                                color: selectedElement?.type === 'status' && selectedElement.statusItemKey === StatusItem && selectedElement.roleName === roleName ? 'white' : '',
                                cursor: 'pointer',
                            }}
                        >
                            <div className='d-flex align-items-center gap-2'>
                                {isEditMode && (
                                    <>
                                        <span className='ArrowMoveStatus d-flex align-items-center cursor-move ms-1'>
                                            <ArrowMove className='ArrowMoveStatus' fill={selectedElement?.type === 'status' && selectedElement.statusItemKey === StatusItem && selectedElement.roleName === roleName ? 'white' : '#495057'} width={20} height={20} />
                                        </span>
                                        <span className='vr-line'></span>
                                    </>
                                )}
                                <span className='d-flex align-items-center gap-1'>
                                    {(isEditMode && isDublicate) && <OverlayTrigger overlay={renderTooltip} placement='top'><i className='bi bi-exclamation-triangle-fill text-danger'></i></OverlayTrigger>}
                                    {getStatusTitle(StatusItem)}
                                </span>
                            </div>
                            <div className="d-flex align-items-center justify-content-center mx-2">
                                {isEditMode && (
                                    <Dropdown>
                                        <Dropdown.Toggle className="role_menu">
                                            <ThreeDotsIcon fill={selectedElement?.type === 'status' && selectedElement.statusItemKey === StatusItem && selectedElement.roleName === roleName ? 'white' : '#495057'} className='mb-1' height={17} width={17} />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={(e) => { e.stopPropagation(); openStatusItemModal(roleName, StatusItem) }}>
                                                <i className='bi bi-pencil me-2' /> Modifica
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={(e) => {
                                                e.stopPropagation();
                                                setStatusToClone(StatusItem);
                                                setCloneStatusModalShow(true);
                                            }}>
                                                <i className='bi bi-files me-2' /> Clona
                                            </Dropdown.Item>
                                            <Dropdown.Item className='text-danger' onClick={(e) => {
                                                e.stopPropagation();
                                                setStatusToDelete(StatusItem);
                                                setDeleteStatusModalShow(true);
                                            }}>
                                                <i className='bi bi-trash me-2' /> Elimina
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                )}
                            </div>
                        </span>
                    );
                })}
            {isEditMode && (
                <div
                    className={`d-flex justify-content-center mt-1 drop-target-last ${dropTarget?.type === 'status' && dropTarget?.isLastPosition ? 'drop-target' : ''}`}
                    style={{ width: '100%' }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (draggingItem?.type === 'status') {
                            setDropTarget({ type: 'status', roleName, isLastPosition: true });
                        }
                    }}
                    onDragLeave={handleStatusDragLeave}
                    onDrop={(e) => handleStatusDrop(e, null, roleName, true)}
                >
                    <span className='StatusItemTitle text-center' style={{ width: 'fit-content', padding: '6px 12px' }} onClick={() => openStatusItemModal(roleName)}>
                        <PlusIcon fill="#495057" className="cursor-pointer" height={15} width={15} />
                    </span>
                </div>
            )}
            <CloneStatusModal
                show={cloneStatusModalShow}
                handleClose={() => {
                    setCloneStatusModalShow(false);
                    setStatusToClone(null);
                }}
                roleName={roleName}
                statusToClone={statusToClone}
                MainData={MainData}
                setEpWorkflowjson={setEpWorkflowjson}
                updateCanvasSize={() => { }}
            />
            <DeleteStatusModal
                show={deleteStatusModalShow}
                handleClose={() => {
                    setDeleteStatusModalShow(false);
                    setStatusToDelete(null);
                }}
                roleName={roleName}
                statusKey={statusToDelete}
                MainData={MainData}
                setEpWorkflowjson={setEpWorkflowjson}
                updateCanvasSize={() => { }}
            />
        </div>
    );
}

export default StatusSection;