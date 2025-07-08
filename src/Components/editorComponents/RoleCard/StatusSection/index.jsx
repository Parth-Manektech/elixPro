import React, { useState, useRef, useEffect } from 'react';
import { ViewOpenEyeIcon, ViewClosedEyeIcon, SlidersIcon, ArrowMove, ThreeDotsIcon, PlusIcon } from '../../../../Assets/SVGs';
import { toggleStatusVisibility } from '../../ViewComponentUtility';
import { Dropdown } from 'react-bootstrap';
import CloneStatusModal from '../../Modals/CloneStatusModal';
import DeleteStatusModal from '../../Modals/DeleteStatusModal';
import { drawSelectedElementArrows } from '../../../../utils/arrowUtils';

function StatusSection({
    pulsantiAttivi,
    roleName,
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
    leaderLinesRef
}) {
    const [cloneStatusModalShow, setCloneStatusModalShow] = useState(false);
    const [deleteStatusModalShow, setDeleteStatusModalShow] = useState(false);
    const [statusToClone, setStatusToClone] = useState(null);
    const [statusToDelete, setStatusToDelete] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);
    const dragStartPosRef = useRef({ x: 0, y: 0 });



    const updateLeaderLines = () => {
        leaderLinesRef.current.forEach(line => line.position());
    };

    // Update handleStatusMouseHover
    // Replace handleStatusMouseHover
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

        // Redraw selected element arrows with visibility check
        if (selectedElement) {
            drawSelectedElementArrows(
                selectedElement,
                MainData,
                createLeaderLine,
                containerRef,
                refsMap // Pass refsMap
            );
        }
    };

    // Update handleMouseLeave
    const handleMouseLeave = (statusItemKey) => {
        if (!refsMap.current[statusItemKey]) return;
        setHoveredStatus(null);
        setHoveredAction(null);
        clearLeaderLines();

        // Redraw selected element arrows
        if (selectedElement) {
            drawSelectedElementArrows(
                selectedElement,
                MainData,
                createLeaderLine,
                containerRef
            );
        }
    };

    // Update handleStatusClick
    // Replace handleStatusClick
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

    // Update useEffect
    // Replace useEffect
    useEffect(() => {
        const container = containerRef.current;
        const updateLeaderLines = () => {
            leaderLinesRef.current.forEach((line) => line.position());
        };

        if (container) {
            container.addEventListener('scroll', updateLeaderLines);
        }

        // Redraw arrows when selectedElement changes
        if (selectedElement?.type === 'status' && selectedElement.roleName === roleName) {
            // Removed: clearLeaderLines();
            drawSelectedElementArrows(
                selectedElement,
                MainData,
                createLeaderLine,
                containerRef,
                refsMap // Pass refsMap
            );
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', updateLeaderLines);
            }
        };
    }, [containerRef, MainData, selectedElement, createLeaderLine, clearLeaderLines, leaderLinesRef, refsMap]);


    const handleStatusDragStart = (e, statusItemKey) => {
        if (!isEditMode) {
            e.preventDefault();
            return;
        }
        setDraggingItem({ type: 'status', facultyName: roleName, statusItemKey });
        e.dataTransfer.setData('text/plain', JSON.stringify({ statusItemKey, facultyName: roleName }));
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
    };

    const handleStatusDragOver = (e, statusItemKey) => {
        e.preventDefault();
        if (draggingItem?.type === 'status' && draggingItem?.facultyName === roleName) {
            setDropTarget({ type: 'status', statusItemKey });
        }
    };

    const handleStatusDragLeave = () => {
        setDropTarget(null);
    };

    const handleStatusDrop = (e, targetStatusKey) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggingItem || draggingItem.type !== 'status' || draggingItem.facultyName !== roleName) {
            setDraggingItem(null);
            setDropTarget(null);
            return;
        }

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const sourceStatusKey = data.statusItemKey;

            if (sourceStatusKey === targetStatusKey) {
                setDraggingItem(null);
                setDropTarget(null);
                return;
            }

            setEpWorkflowjson((prevJson) => {
                const data = JSON.parse(prevJson);
                const facultyIndex = data.findIndex((item) => item.ruolo?.nome === roleName);
                if (facultyIndex === -1) {
                    console.error('Faculty not found:', roleName);
                    return prevJson;
                }

                const statusArray = Object.keys(data[facultyIndex].pulsantiAttivi || {});
                const sourceIndex = statusArray.indexOf(sourceStatusKey);
                const targetIndex = statusArray.indexOf(targetStatusKey);

                if (sourceIndex === -1 || targetIndex === -1) {
                    console.error('Status not found:', { sourceStatusKey, targetStatusKey });
                    return prevJson;
                }

                const [movedStatus] = statusArray.splice(sourceIndex, 1);
                statusArray.splice(targetIndex, 0, movedStatus);

                const newPulsantiAttivi = {};
                statusArray.forEach((key) => {
                    newPulsantiAttivi[key] = data[facultyIndex].pulsantiAttivi[key];
                });
                data[facultyIndex].pulsantiAttivi = newPulsantiAttivi;

                return JSON.stringify(data);
            });
        } catch (error) {
            console.error('Error parsing drag data:', error);
        }
        setDraggingItem(null);
        setDropTarget(null);
    };

    return (
        <div className="d-flex flex-column gap-1 column">
            <div className='d-flex justify-content-center align-item-center mt-1 mb-1'>
                <SlidersIcon height={15} width={15} fill='#6c757d' className='d-flex justify-content-center align-item-center me-1' />
                <span style={{ color: '#6c757d', margin: "-5px 0 0 0" }}>STATI</span>
            </div>
            {pulsantiAttivi &&
                Object.keys(pulsantiAttivi).map((StatusItem) => (
                    <span
                        ref={(el) => (refsMap.current[StatusItem] = el)}
                        className={`StatusItemTitle ${dropTarget?.type === 'status' && dropTarget?.statusItemKey === StatusItem ? 'drop-target' : ''}`}
                        id={StatusItem}
                        onMouseEnter={() => handleStatusMouseHover(StatusItem)}
                        onMouseLeave={() => handleMouseLeave(StatusItem)}
                        onClick={() => handleStatusClick(StatusItem)}
                        draggable={isEditMode}
                        onDragStart={(e) => handleStatusDragStart(e, StatusItem)}
                        onDragOver={(e) => handleStatusDragOver(e, StatusItem)}
                        onDragLeave={handleStatusDragLeave}
                        onDrop={(e) => handleStatusDrop(e, StatusItem)}
                        key={StatusItem}
                        style={{
                            backgroundColor: selectedElement?.type === 'status' && selectedElement.statusItemKey === StatusItem && selectedElement.roleName === roleName ? '#343a40' : '',
                            color: selectedElement?.type === 'status' && selectedElement.statusItemKey === StatusItem && selectedElement.roleName === roleName ? 'white' : '',
                            cursor: 'pointer',
                        }}
                    >
                        <div className='d-flex align-items-center gap-2'>
                            {isEditMode && (
                                <>
                                    <span className='d-flex align-items-center cursor

-move ms-1'>
                                        <ArrowMove fill={selectedElement?.type === 'status' && selectedElement.statusItemKey === StatusItem && selectedElement.roleName === roleName ? 'white' : '#495057'} width={20} height={20} />
                                    </span>
                                    <span className='vr-line'></span>
                                </>
                            )}
                            <span>{StatusItem}</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-center mx-2">
                            {isEditMode && <Dropdown>
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
                            </Dropdown>}
                        </div>
                    </span>
                ))}
            {isEditMode && <div className='d-flex justify-content-center mt-1'>
                <span
                    className="StatusItemTitle text-center"
                    style={{ width: 'fit-content', padding: '6px 12px' }}
                    onClick={() => openStatusItemModal(roleName)}
                >
                    <PlusIcon fill="#495057" className="cursor-pointer" height={15} width={15} />
                </span>
            </div>}
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