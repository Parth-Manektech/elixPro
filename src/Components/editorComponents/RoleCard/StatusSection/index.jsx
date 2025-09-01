import React, { useState, useRef, useEffect } from 'react';
import { ViewOpenEyeIcon, ViewClosedEyeIcon, SlidersIcon, ArrowMove, ThreeDotsIcon, PlusIcon } from '../../../../Assets/SVGs';
import { toggleStatusVisibility } from '../../ViewComponentUtility';
import { Col, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
    setDuplicateCount,
    dataID
}) {
    const [cloneStatusModalShow, setCloneStatusModalShow] = useState(false);
    const [deleteStatusModalShow, setDeleteStatusModalShow] = useState(false);
    const [statusToClone, setStatusToClone] = useState(null);
    const [statusToDelete, setStatusToDelete] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);
    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const [duplicateStatus, setDuplicateStatus] = useState([])
    const dragStartSourceRefStatus = useRef(null);

    const rulekey = element?.ruolo?.key;

    const getStatusOptions = () => {
        if (!MainData) return [];
        const allStatuses = new Set();
        MainData.forEach((element) => {
            if (element.ruolo && element.pulsantiAttivi && element?.ruolo?.key !== rulekey) {
                Object.keys(element.pulsantiAttivi).forEach((status) => {
                    allStatuses.add(status)
                });
            }
        });
        return Array.from(allStatuses);
    };

    useEffect(() => {
        if (MainData) {
            const dublicatestatus = []
            MainData.forEach((element) => {
                if (element.ruolo && element.pulsantiAttivi && element?.ruolo?.key !== rulekey) {
                    Object.keys(element.pulsantiAttivi).forEach((status) => {
                        const Addstatus = {
                            label: `${element?.ruolo?.key}-${status}`,
                            value: status
                        }
                        dublicatestatus.push(Addstatus)

                    });
                }
            });
            setDuplicateStatus(dublicatestatus)
        }
    }, [MainData])

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
                    const ActionElement = MainData.find(item =>
                        item.azioni?.some(azione =>
                            azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                        ));
                    createLeaderLine(
                        `${ActionElement?.ruolo?.key}_${wf.keyAzione}`,
                        `${element?.ruolo?.key}_${statusItemKey}`,
                        'rgba(14, 165, 233, 0.25)',
                        'behind',
                        'arrow2',
                        false,
                        containerRef
                    );
                } else if (wf.statoDestinazione === statusItemKey && !isElementVisible(wf.keyAzione) && isElementVisible(statusItemKey)) {
                    const ActionElement = MainData.find(item =>
                        item.azioni?.some(azione =>
                            azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                        ));
                    createLeaderLine(
                        `${ActionElement?.ruolo?.key}`,
                        `${element?.ruolo?.key}_${statusItemKey}`,
                        'rgba(14, 165, 233, 0.25)',
                        'behind',
                        'arrow2',
                        false,
                        containerRef
                    );
                }
            }
            );
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
        if (!refsMap.current[`${element?.ruolo?.key}_${statusItemKey}`]) return;
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

        const newSelectedElement = { type: 'status', roleName, statusItemKey, data_id: `${element?.ruolo?.key}_${statusItemKey}` };
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
                        const ActionElement = MainData.find(item =>
                            item.azioni?.some(azione =>
                                azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                            ));
                        createLeaderLine(
                            `${ActionElement?.ruolo?.key}_${wf.keyAzione}`,
                            `${element?.ruolo?.key}_${statusItemKey}`,
                            'rgba(124, 195, 225, 1)',
                            'behind',
                            'arrow2',
                            true,
                            containerRef
                        );
                    } else if (wf.statoDestinazione === statusItemKey && !isElementVisible(wf.keyAzione) && isElementVisible(statusItemKey)) {
                        const ActionElement = MainData.find(item =>
                            item.azioni?.some(azione =>
                                azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                            ));
                        createLeaderLine(
                            `${ActionElement?.ruolo?.key}`,
                            `${element?.ruolo?.key}_${statusItemKey}`,
                            'rgba(14, 165, 233, 0.25)',
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
        clearLeaderLines();
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
        clearLeaderLines();
        if (draggingItem?.type === 'status') {
            setDropTarget({ type: 'status', statusItemKey, roleName: targetRoleName });
        }
    };

    const handleStatusDragLeave = () => {
        clearLeaderLines();
        setDropTarget(null);
    };

    const handleStatusDrop = (e, targetStatusKey, targetRoleName, isLastPosition = false) => {
        e.preventDefault();
        e.stopPropagation();
        clearLeaderLines();
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

    const renderTooltip = (props, msg) => (
        <Tooltip id="button-tooltip" {...props}>
            La Key non è univoca! Viene usata più volte: {msg}
        </Tooltip>
    );

    return (
        <Col >
            <div className='column-header'>
                <i class="bi bi-sliders me-1"></i>STATI
            </div>
            <div className='catStatus'>
                <div class="category-title"></div>
                <div className='statusGroup'>
                    {pulsantiAttivi &&
                        Object.keys(pulsantiAttivi).map((StatusItem) => {
                            const isDublicate = getStatusOptions().includes(StatusItem);
                            const sDataId = dataID?.statusId[`${element?.ruolo?.key}-${StatusItem}`]

                            let sameDataId
                            if (isDublicate) {
                                const sameStatus = duplicateStatus.find(e => e.value === StatusItem);
                                sameDataId = dataID.statusId[sameStatus?.label]
                            }
                            return (
                                <div
                                    ref={(el) => (refsMap.current[`${element?.ruolo?.key}_${StatusItem}`] = el)}
                                    className={`status-item ${dropTarget?.type === 'status' && dropTarget?.statusItemKey === StatusItem && dropTarget?.roleName === roleName ? 'drop-target' : ''}`}
                                    id={StatusItem}
                                    data-id={sDataId}
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
                                    }}
                                >
                                    <div className='status-content'>
                                        {isEditMode && (
                                            <>
                                                <span className='ArrowMoveStatus d-flex align-items-center cursor-grab ms-1'>
                                                    <ArrowMove className='ArrowMoveStatus' fill={selectedElement?.type === 'status' && selectedElement.statusItemKey === StatusItem && selectedElement.roleName === roleName ? 'white' : '#495057'} width={20} height={20} />
                                                </span>
                                                <span className='vr-line'></span>
                                            </>
                                        )}
                                        <span className='item-title'>
                                            {(isEditMode && isDublicate) && <OverlayTrigger overlay={(e) => renderTooltip(e, `${sDataId}, ${sameDataId}`)} placement='top'><i className='bi bi-exclamation-triangle-fill text-danger'></i></OverlayTrigger>}
                                            {getStatusTitle(StatusItem)}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center mx-2" onClick={(e) => e.stopPropagation()}>
                                        {isEditMode && (
                                            <Dropdown>
                                                <Dropdown.Toggle className="menu-btn-list">
                                                    <ThreeDotsIcon fill={selectedElement?.type === 'status' && selectedElement.statusItemKey === StatusItem && selectedElement.roleName === roleName ? 'white' : '#495057'} className='mb-1' height={17} width={17} />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={(e) => { e.stopPropagation(); openStatusItemModal(roleName, StatusItem, sDataId) }}>
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
                                </div>
                            );
                        })}
                </div>
            </div>
            {isEditMode && (
                <div
                    className={`d-flex justify-content-center mt-1 drop-target-last ${dropTarget?.type === 'status' && dropTarget?.isLastPosition ? 'drop-target' : ''} w-100`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (draggingItem?.type === 'status') {
                            setDropTarget({ type: 'status', roleName, isLastPosition: true });
                        }
                    }}
                    onDragLeave={handleStatusDragLeave}
                    onDrop={(e) => handleStatusDrop(e, null, roleName, true)}
                >
                    <span className='add-status-btn' onClick={() => openStatusItemModal(roleName)}>
                        <i class="bi bi-plus-lg"></i>
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
        </Col>
    );
}

export default StatusSection;