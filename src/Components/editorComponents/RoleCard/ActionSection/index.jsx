import React, { useState, useRef, useEffect } from 'react';
import { ViewOpenEyeIcon, ViewClosedEyeIcon, GamePadIcon, ArrowMove, ThreeDotsIcon, PlusIcon } from '../../../../Assets/SVGs';
import { toggleActionVisibility } from '../../ViewComponentUtility';
import { Col, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CloneActionModal from '../../Modals/CloneActionModal';
import DeleteActionModal from '../../Modals/DeleteActionModal';
import CloneActionItemModal from '../../Modals/CloneActionItemModal';
import DeleteActionItemModal from '../../Modals/DeleteActionItemModal';
import { drawSelectedElementArrows } from '../../../../utils/arrowUtils';

function ActionSection({
    azioni,
    roleName,
    shownStatus,
    associatedActions,
    openActionItemModal,
    openTitleItemModal,
    setHoveredAction,
    setHoveredStatus,
    MainData,
    draggingItem,
    setDraggingItem,
    setEpWorkflowjson,
    hoveredAction,
    refsMap,
    isEditMode,
    containerRef,
    selectedElement,
    setSelectedElement,
    clearLeaderLines,
    createLeaderLine,
    leaderLinesRef,
    element,
    dataID
}) {
    const [cloneActionModalShow, setCloneActionModalShow] = useState(false);
    const [deleteActionModalShow, setDeleteActionModalShow] = useState(false);
    const [cloneActionItemModalShow, setCloneActionItemModalShow] = useState(false);
    const [deleteActionItemModalShow, setDeleteActionItemModalShow] = useState(false);
    const [actionToClone, setActionToClone] = useState(null);
    const [actionToDelete, setActionToDelete] = useState(null);
    const [actionItemToClone, setActionItemToClone] = useState(null);
    const [actionItemToDelete, setActionItemToDelete] = useState(null);
    const [actionTitleForItem, setActionTitleForItem] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);
    const [actionkeys, setActionKeys] = useState([]);
    const [duplicateAction, setDuplicateAction] = useState([])

    const dragStartSourceRefAction = useRef(null);
    const dragStartPosRef = useRef({ x: 0, y: 0 });

    const updateLeaderLines = () => {
        leaderLinesRef.current.forEach(line => line.position());
    };

    const handleActionMouseHover = (actionKey) => {
        setHoveredAction({ role: roleName, actionKey });
        setHoveredStatus(null);
        clearLeaderLines();

        const isElementVisible = (id) => {
            const element = document.getElementById(id);
            return element && element.offsetParent !== null;
        };

        const workflowIndex = MainData.length - 1;
        if (MainData[workflowIndex]?.workflowmapping) {
            const wf = MainData[workflowIndex].workflowmapping.find(
                (item) => item.keyAzione === actionKey
            );
            if (wf) {
                if (
                    wf.statoDestinazione &&
                    isElementVisible(actionKey) &&
                    isElementVisible(wf.statoDestinazione)
                ) {
                    const StatusElement = MainData.find(item =>
                        Object.keys(item?.pulsantiAttivi || {}).some(key => key === wf.statoDestinazione)
                    );
                    createLeaderLine(
                        `${element?.ruolo?.key}_${actionKey}`,
                        `${StatusElement?.ruolo?.key}_${wf.statoDestinazione}`,
                        'rgba(14, 165, 233, 0.25)',
                        'behind',
                        'arrow2',
                        false,
                        containerRef
                    );
                } else if (
                    wf.statoDestinazione &&
                    isElementVisible(actionKey) &&
                    !isElementVisible(wf.statoDestinazione)
                ) {
                    const StatusElement = MainData.find(item =>
                        Object.keys(item?.pulsantiAttivi || {}).some(key => key === wf.statoDestinazione)
                    );
                    createLeaderLine(
                        `${element?.ruolo?.key}_${actionKey}`,
                        `${StatusElement?.ruolo?.key}`,
                        'rgba(14, 165, 233, 0.25)',
                        'behind',
                        'arrow2',
                        false,
                        containerRef
                    );
                }

                if (wf?.listeDestinazione) {
                    wf?.listeDestinazione?.forEach((listId) => {
                        if (isElementVisible(actionKey) && isElementVisible(listId)) {
                            const ListElement = MainData.find(item =>
                                item.liste?.some(liste =>
                                    liste.listArray?.some(listItem => listItem.key === listId)
                                )
                            );
                            createLeaderLine(
                                `${element?.ruolo?.key}_${actionKey}`,
                                `${ListElement?.ruolo?.key}_${listId}`,
                                'rgba(41, 115, 147, 0.25)',
                                'behind',
                                'arrow2',
                                false,
                                containerRef
                            );
                        } else if (isElementVisible(actionKey) && !isElementVisible(listId)) {
                            const ListElement = MainData.find(item =>
                                item.liste?.some(liste =>
                                    liste.listArray?.some(listItem => listItem.key === listId)
                                )
                            );
                            createLeaderLine(
                                `${element?.ruolo?.key}_${actionKey}`,
                                `${ListElement?.ruolo?.key}`,
                                'rgba(41, 115, 147, 0.25)',
                                'behind',
                                'arrow2',
                                false,
                                containerRef
                            );
                        }

                    });
                }

                if (wf?.doNotlisteDestinazione) {
                    wf?.doNotlisteDestinazione?.forEach((listId) => {
                        if (isElementVisible(actionKey) && isElementVisible(listId)) {
                            const ListElement = MainData.find(item =>
                                item.liste?.some(liste =>
                                    liste.listArray?.some(listItem => listItem.key === listId)
                                )
                            );
                            createLeaderLine(
                                `${element?.ruolo?.key}_${actionKey}`,
                                `${ListElement?.ruolo?.key}_${listId}`,
                                'rgba(202, 138, 4, 0.25)',
                                'square',
                                'square',
                                false,
                                containerRef
                            );
                        } else if (isElementVisible(actionKey) && !isElementVisible(listId)) {
                            const ListElement = MainData.find(item =>
                                item.liste?.some(liste =>
                                    liste.listArray?.some(listItem => listItem.key === listId)
                                )
                            );
                            createLeaderLine(
                                `${element?.ruolo?.key}_${actionKey}`,
                                `${ListElement?.ruolo?.key}`,
                                'rgba(202, 138, 4, 0.25)',
                                'square',
                                'square',
                                false,
                                containerRef
                            );
                        }
                    });
                }
            }
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

    const handleMouseLeave = (actionKey) => {
        if (!refsMap.current[`${element?.ruolo?.key}_${actionKey}`]) return;
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

    const isCheckRelation = (actionKey) => {
        const workflowIndex = MainData.length - 1;
        if (MainData[workflowIndex]?.workflowmapping) {
            const wf = MainData[workflowIndex].workflowmapping.find(
                (item) => item.keyAzione === actionKey
            );
            if (wf.statoDestinazione?.length || wf?.listeDestinazione?.length || wf?.doNotlisteDestinazione?.length) return true
            else return false
        }
    }

    const handleActionItemClick = (actionKey, actionTitle) => {
        if (isCheckRelation(actionKey)) {
            const newSelectedElement = { type: 'action', roleName, actionTitle, itemKey: actionKey, data_id: `${element?.ruolo?.key}_${actionKey}` };
            if (
                selectedElement?.type === 'action' &&
                selectedElement.itemKey === actionKey &&
                selectedElement.actionTitle === actionTitle &&
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

                const wf = MainData[workflowIndex].workflowmapping.find(
                    (item) => item.keyAzione === actionKey
                );
                if (wf) {
                    if (
                        wf.statoDestinazione &&
                        isElementVisible(actionKey) &&
                        isElementVisible(wf.statoDestinazione)
                    ) {
                        const StatusElement = MainData.find(item =>
                            Object.keys(item?.pulsantiAttivi || {}).some(key => key === wf.statoDestinazione)
                        );
                        createLeaderLine(
                            `${element?.ruolo?.key}_${actionKey}`,
                            `${StatusElement?.ruolo?.key}_${wf.statoDestinazione}`,
                            'rgba(124, 195, 225, 1)',
                            'behind',
                            'arrow2',
                            true,
                            containerRef
                        );
                    } else if (
                        wf.statoDestinazione &&
                        isElementVisible(actionKey) &&
                        !isElementVisible(wf.statoDestinazione)
                    ) {
                        const StatusElement = MainData.find(item =>
                            Object.keys(item?.pulsantiAttivi || {}).some(key => key === wf.statoDestinazione)
                        );
                        createLeaderLine(
                            `${element?.ruolo?.key}_${actionKey}`,
                            `${StatusElement?.ruolo?.key}`,
                            'rgba(14, 165, 233, 0.25)',
                            'behind',
                            'arrow2',
                            true,
                            containerRef
                        );
                    }

                    if (wf?.listeDestinazione) {
                        wf?.listeDestinazione?.forEach((listId) => {
                            if (
                                isElementVisible(actionKey) &&
                                isElementVisible(listId)
                            ) {
                                const ListElement = MainData.find(item =>
                                    item.liste?.some(liste =>
                                        liste.listArray?.some(listItem => listItem.key === listId)
                                    ));
                                createLeaderLine(
                                    `${element?.ruolo?.key}_${actionKey}`,
                                    `${ListElement?.ruolo?.key}_${listId}`,
                                    'rgba(41, 115, 147, 0.25)',
                                    'behind',
                                    'arrow2',
                                    true,
                                    containerRef
                                );
                            } else if (
                                isElementVisible(actionKey) &&
                                !isElementVisible(listId)
                            ) {
                                const ListElement = MainData.find(item =>
                                    item.liste?.some(liste =>
                                        liste.listArray?.some(listItem => listItem.key === listId)
                                    ));
                                createLeaderLine(
                                    `${element?.ruolo?.key}_${actionKey}`,
                                    `${ListElement?.ruolo?.key}`,
                                    'rgba(41, 115, 147, 0.25)',
                                    'behind',
                                    'arrow2',
                                    true,
                                    containerRef
                                );
                            }
                        });
                    }

                    if (wf?.doNotlisteDestinazione) {
                        wf?.doNotlisteDestinazione?.forEach((listId) => {
                            if (
                                isElementVisible(actionKey) &&
                                isElementVisible(listId)
                            ) {
                                const ListElement = MainData.find(item =>
                                    item.liste?.some(liste =>
                                        liste.listArray?.some(listItem => listItem.key === listId)
                                    ));
                                createLeaderLine(
                                    `${element?.ruolo?.key}_${actionKey}`,
                                    `${ListElement?.ruolo?.key}_${listId}`,
                                    'rgba(202, 138, 4, 0.25)',
                                    'square',
                                    'square',
                                    true,
                                    containerRef
                                );
                            } else if (
                                isElementVisible(actionKey) &&
                                !isElementVisible(listId)
                            ) {
                                const ListElement = MainData.find(item =>
                                    item.liste?.some(liste =>
                                        liste.listArray?.some(listItem => listItem.key === listId)
                                    ));
                                createLeaderLine(
                                    `${element?.ruolo?.key}_${actionKey}`,
                                    `${ListElement?.ruolo?.key}`,
                                    'rgba(202, 138, 4, 0.25)',
                                    'square',
                                    'square',
                                    true,
                                    containerRef
                                );
                            }
                        });
                    }
                }


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

        if (selectedElement?.type === 'action' && selectedElement.roleName === roleName) {
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

    const handleActionDragStart = (e, actionTitle) => {
        clearLeaderLines();
        const actualClickedElement = dragStartSourceRefAction.current;
        if (!isEditMode || actualClickedElement?.className?.baseVal !== "ArrowMoveactionGroup") {
            e.preventDefault();
            return;
        }
        setDraggingItem({ type: 'actionGroup', facultyName: roleName, actionTitle });
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'actionGroup', actionTitle, facultyName: roleName }));
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
    };

    const handleActionDragOver = (e, actionTitle, targetRoleName) => {
        e.preventDefault();
        clearLeaderLines();
        if (draggingItem?.type === 'actionGroup') {
            setDropTarget({ type: 'actionGroup', actionTitle, roleName: targetRoleName });
        }
    };

    const handleActionDragLeave = () => {
        clearLeaderLines();
        setDropTarget(null);
    };

    const handleActionDrop = (e, targetActionTitle, targetRoleName, isLastPosition = false) => {
        e.preventDefault();
        e.stopPropagation();
        clearLeaderLines();
        if (!draggingItem || draggingItem.type !== 'actionGroup') {
            setDraggingItem(null);
            setDropTarget(null);
            return;
        }

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const sourceActionTitle = data.actionTitle;
            const sourceFacultyName = data.facultyName;

            if (sourceFacultyName === targetRoleName && sourceActionTitle === targetActionTitle) {
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

                const sourceActionArray = [...(data[sourceFacultyIndex].azioni || [])];
                const sourceIndex = sourceActionArray.findIndex((action) => action.title === sourceActionTitle);

                if (sourceIndex === -1) {
                    console.error('Source action not found:', sourceActionTitle);
                    return prevJson;
                }

                const [movedAction] = sourceActionArray.splice(sourceIndex, 1);
                data[sourceFacultyIndex].azioni = sourceActionArray;

                // Initialize azioni array if it doesn't exist
                if (!data[targetFacultyIndex].azioni) {
                    data[targetFacultyIndex].azioni = [];
                }
                const targetActionArray = [...data[targetFacultyIndex].azioni];

                if (isLastPosition) {
                    // Append to the end of the target action array
                    targetActionArray.push(movedAction);
                } else {
                    const targetIndex = targetActionArray.findIndex((action) => action.title === targetActionTitle);
                    if (targetIndex === -1) {
                        targetActionArray.push(movedAction);
                    } else {
                        targetActionArray.splice(targetIndex, 0, movedAction);
                    }
                }
                data[targetFacultyIndex].azioni = targetActionArray;

                return JSON.stringify(data);
            });
        } catch (error) {
            console.error('Error parsing drag data:', error);
        }
        setDraggingItem(null);
        setDropTarget(null);
    };

    const handleActionItemDragStart = (e, actionTitle, itemKey) => {
        clearLeaderLines();
        const actualClickedElement = dragStartSourceRefAction.current;
        if (!isEditMode || actualClickedElement?.className?.baseVal !== "ArrowMoveAction") {
            e.preventDefault();
            return;
        }
        setDraggingItem({ type: 'action', facultyName: roleName, actionTitle, itemKey });
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'action', itemKey, facultyName: roleName, actionTitle }));
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
        e.currentTarget.classList.add("action-item-dragging");
    };

    const handleActionItemDragOver = (e, actionTitle, itemKey, targetRoleName) => {
        e.preventDefault();
        clearLeaderLines();
        if (draggingItem?.type === 'action') {
            setDropTarget({ type: 'action', actionTitle, itemKey, roleName: targetRoleName });
        }
    };

    const handleActionItemDragLeave = () => {
        clearLeaderLines();
        setDropTarget(null);
    };

    const handleActionItemDrop = (e, targetActionTitle, targetKey, targetRoleName, isLastPosition = false) => {
        e.preventDefault();
        e.stopPropagation();
        clearLeaderLines();
        if (!draggingItem || draggingItem.type !== 'action') {
            setDraggingItem(null);
            setDropTarget(null);
            return;
        }

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const sourceKey = data.itemKey;
            const sourceFacultyName = data.facultyName;
            const sourceActionTitle = data.actionTitle;

            if (sourceFacultyName === targetRoleName && sourceActionTitle === targetActionTitle && sourceKey === targetKey) {
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

                const sourceActionIndex = data[sourceFacultyIndex].azioni?.findIndex((action) => action.title === sourceActionTitle);
                const targetActionIndex = data[targetFacultyIndex].azioni?.findIndex((action) => action.title === targetActionTitle);

                if (sourceActionIndex === -1 || targetActionIndex === -1) {
                    console.error('Action not found:', { sourceActionTitle, targetActionTitle });
                    return prevJson;
                }

                const sourceActionArray = [...(data[sourceFacultyIndex].azioni[sourceActionIndex].listArray || [])];
                const sourceIndex = sourceActionArray.findIndex((item) => item.key === sourceKey);

                if (sourceIndex === -1) {
                    console.error('Source item not found:', sourceKey);
                    return prevJson;
                }

                const [movedItem] = sourceActionArray.splice(sourceIndex, 1);
                data[sourceFacultyIndex].azioni[sourceActionIndex].listArray = sourceActionArray;

                // Initialize listArray if it doesn't exist
                if (!data[targetFacultyIndex].azioni[targetActionIndex].listArray) {
                    data[targetFacultyIndex].azioni[targetActionIndex].listArray = [];
                }
                const targetActionArray = [...data[targetFacultyIndex].azioni[targetActionIndex].listArray];

                if (isLastPosition) {
                    // Append to the end of the target action array
                    targetActionArray.push(movedItem);
                } else {
                    const targetIndex = targetActionArray.findIndex((item) => item.key === targetKey);
                    if (targetIndex === -1) {
                        targetActionArray.push(movedItem);
                    } else {
                        targetActionArray.splice(targetIndex, 0, movedItem);
                    }
                }
                data[targetFacultyIndex].azioni[targetActionIndex].listArray = targetActionArray;

                return JSON.stringify(data);
            });
        } catch (error) {
            console.error('Error parsing drag data:', error);
        }
        setDraggingItem(null);
        setDropTarget(null);
        document.querySelectorAll('.action-item-dragging').forEach((element) => {
            element.classList.remove('action-item-dragging');
        });
    };


    const handleactionItemDragEnd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearLeaderLines();

        document.querySelectorAll('.action-item-dragging').forEach((element) => {
            element.classList.remove('action-item-dragging');
        });

        setDraggingItem(null);
        setDropTarget(null);
    };

    useEffect(() => {
        const Allaction = [];
        const duplicateActions = []
        MainData.forEach(item => {
            if (item.ruolo && item.ruolo.key !== element?.ruolo?.key) {
                if (item.azioni && Array.isArray(item.azioni)) {
                    item.azioni.forEach(action => {
                        if (action.listArray && Array.isArray(action.listArray)) {
                            action.listArray.forEach(actionItem => {
                                if (actionItem.key) {
                                    const Addaction = {
                                        label: `${item?.ruolo?.key}-${action.title?.replaceAll(" ", "-")}-${actionItem?.key?.replaceAll(" ", "-")}`,
                                        value: actionItem.key
                                    }
                                    duplicateActions.push(Addaction)
                                    Allaction.push(actionItem.key);
                                }
                            });
                        }
                    });
                }
            }
        });
        setDuplicateAction(duplicateActions);
        setActionKeys(Allaction);
    }, [MainData, element]);

    const renderTooltip = (props, msg) => (
        <Tooltip id="button-tooltip" {...props}>
            La Key non è univoca! Viene usata più volte: {msg}
        </Tooltip>
    );

    return (
        <Col>
            <div className='column-header'>
                <i class="bi bi-dpad me-1"></i>AZIONI
            </div>
            <div className='container-catAzione d-flex flex-column gap-1'>
                {azioni?.map((azioniItem) => {
                    const catactionkey = `${element?.ruolo?.key}-${azioniItem?.title?.replaceAll(" ", "-")}`
                    const caDataID = dataID.catactionId[catactionkey]
                    return <div
                        className={`catAzione ${dropTarget?.type === 'actionGroup' && dropTarget?.actionTitle === azioniItem.title && dropTarget?.roleName === roleName ? 'drop-target' : ''} w-100`}
                        key={azioniItem.title}
                        data-id={caDataID}
                        draggable={isEditMode}
                        onDragStart={(e) => handleActionDragStart(e, azioniItem.title)}
                        onDragOver={(e) => handleActionDragOver(e, azioniItem.title, roleName)}
                        onDragLeave={handleActionDragLeave}
                        onMouseDown={(e) => {
                            dragStartSourceRefAction.current = e.target;
                        }}
                        onDrop={(e) => handleActionDrop(e, azioniItem.title, roleName)}
                    >
                        <div className="catAzione-header">
                            <div className='d-flex align-items-center gap-2'>
                                {isEditMode && (
                                    <>
                                        <span className='catAzione-title ArrowMoveactionGroup d-flex align-items-center cursor-grab ms-1'>
                                            <ArrowMove className='ArrowMoveactionGroup' fill="#495057" width={20} height={20} />
                                        </span>
                                        <span className='vr-line'></span>
                                    </>
                                )}
                                <span className='catAzione-text'>{azioniItem?.title}</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-center mx-2">
                                {isEditMode && (
                                    <Dropdown>
                                        <Dropdown.Toggle className="menu-btn-list">
                                            <ThreeDotsIcon fill="#495057" className='mb-1' height={17} width={17} />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={(e) => { e.stopPropagation(); openTitleItemModal(roleName, 'azioni', { title: azioniItem.title }, caDataID) }}>
                                                <i className='bi bi-pencil me-2' /> Modifica
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={(e) => {
                                                e.stopPropagation();
                                                setActionToClone(azioniItem);
                                                setCloneActionModalShow(true);
                                            }}>
                                                <i className='bi bi-files me-2' /> Clona
                                            </Dropdown.Item>
                                            <Dropdown.Item className='text-danger' onClick={(e) => {
                                                e.stopPropagation();
                                                setActionToDelete(azioniItem.title);
                                                setDeleteActionModalShow(true);
                                            }}>
                                                <i className='bi bi-trash me-2' /> Elimina
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                )}
                            </div>
                        </div>

                        <div className="actiongroup">
                            {azioniItem?.listArray?.map((item) => {
                                const isAssociated = shownStatus && associatedActions[item.key];
                                const isDuplicateAction = actionkeys?.includes(item?.key);
                                const aDataID = dataID.action[`${catactionkey}-${item.key}`]

                                let sameDataId
                                if (isDuplicateAction) {
                                    const sameList = duplicateAction.find(e => e.value === item?.key);
                                    sameDataId = dataID.action[sameList?.label]
                                }

                                return (
                                    <div
                                        key={item.key}
                                        id={item.key}
                                        data-id={aDataID}
                                        data-key={item?.key}
                                        ref={(el) => (refsMap.current[`${element?.ruolo?.key}_${item?.key}`] = el)}
                                        className={`action-item ${dropTarget?.type === 'action' && dropTarget?.itemKey === item.key && dropTarget?.actionTitle === azioniItem.title && dropTarget?.roleName === roleName ? 'drop-target' : ''} 
                                        ${(shownStatus && isAssociated && selectedElement?.type === 'status' && selectedElement.roleName === roleName) ? 'highlighted-action' : ''}
                                        `}
                                        data-status={item?.status}
                                        data-movetolist={item?.moveToList ? item?.moveToList : "[]"}
                                        data-donotmovetolist={item?.doNotMoveToList ? item?.doNotMoveToList : "[]"}
                                        onMouseEnter={() => handleActionMouseHover(item.key)}
                                        onMouseLeave={() => handleMouseLeave(item.key)}
                                        onClick={() => handleActionItemClick(item.key, azioniItem.title)}
                                        draggable={isEditMode}
                                        onDragStart={(e) => handleActionItemDragStart(e, azioniItem.title, item.key)}
                                        onDragOver={(e) => handleActionItemDragOver(e, azioniItem.title, item.key, roleName)}
                                        onDragLeave={handleActionItemDragLeave}
                                        onMouseDown={(e) => {
                                            dragStartSourceRefAction.current = e.target;
                                        }}
                                        onDragEnd={(e) => handleactionItemDragEnd(e)}
                                        onDrop={(e) => handleActionItemDrop(e, azioniItem.title, item.key, roleName)}
                                        style={{
                                            backgroundColor: selectedElement?.type === 'action' && selectedElement.itemKey === item.key && selectedElement.actionTitle === azioniItem.title && selectedElement.roleName === roleName ? '#343a40' : '',
                                            color: selectedElement?.type === 'action' && selectedElement.itemKey === item.key && selectedElement.actionTitle === azioniItem.title && selectedElement.roleName === roleName ? 'white' : '',
                                        }}
                                    >
                                        <div className='w-100 d-flex justify-content-between align-items-center'>
                                            <div className='d-flex align-items-center gap-2'>
                                                {isEditMode && (
                                                    <>
                                                        <span className='ArrowMoveAction d-flex align-items-center cursor-grab ms-1'>
                                                            <ArrowMove className='ArrowMoveAction' fill={selectedElement?.type === 'action' && selectedElement.itemKey === item.key && selectedElement.actionTitle === azioniItem.title && selectedElement.roleName === roleName ? 'white' : '#495057'} width={20} height={20} />
                                                        </span>
                                                        <span className='vr-line'></span>
                                                    </>
                                                )}
                                                <div className='action-content'>
                                                    <span className='item-title'>
                                                        {/* {(isEditMode && isDuplicateAction) && <OverlayTrigger overlay={(e) => renderTooltip(e, `${aDataID}, ${sameDataId}`)} placement='top'><i className='bi bi-exclamation-triangle-fill text-danger'></i></OverlayTrigger>} */}
                                                        {item?.title}
                                                    </span>
                                                </div>

                                                {(isEditMode && selectedElement?.type === 'status' && selectedElement.roleName === roleName) && (
                                                    <div className='action-controls'>
                                                        <div className="enable-action-for-status-checkbox" title="Abilita/disabilita azione per lo stato attivo" onClick={(e) => { e.stopPropagation(); }}>
                                                            <input type="checkbox" checked={shownStatus && isAssociated ? true : false} onChange={() => toggleActionVisibility(roleName, shownStatus, item.key, MainData, setEpWorkflowjson)} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="d-flex align-items-center justify-content-center mx-2" onClick={(e) => e.stopPropagation()}>
                                                {isEditMode && (
                                                    <Dropdown>
                                                        <Dropdown.Toggle className="menu-btn-list">
                                                            <ThreeDotsIcon fill={selectedElement?.type === 'action' && selectedElement.itemKey === item.key && selectedElement.actionTitle === azioniItem.title && selectedElement.roleName === roleName ? 'white' : '#495057'} className='mb-1' height={17} width={17} />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={(e) => { e.stopPropagation(); openActionItemModal(roleName, azioniItem.title, item, aDataID) }}>
                                                                <i className='bi bi-pencil me-2' /> Modifica
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActionItemToClone(item);
                                                                setActionTitleForItem(azioniItem.title);
                                                                setCloneActionItemModalShow(true);
                                                            }}>
                                                                <i className='bi bi-files me-2' /> Clona
                                                            </Dropdown.Item>
                                                            <Dropdown.Item className='text-danger' onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActionItemToDelete(item);
                                                                setActionTitleForItem(azioniItem.title);
                                                                setDeleteActionItemModalShow(true);
                                                            }}>
                                                                <i className='bi bi-trash me-2' /> Elimina
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {isEditMode && (
                                <div
                                    className={`drop-target-last ${dropTarget?.type === 'action' && dropTarget?.actionTitle === azioniItem.title && dropTarget?.isLastPosition ? 'drop-target' : ''} w-100`}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        if (draggingItem?.type === 'action') {
                                            setDropTarget({ type: 'action', actionTitle: azioniItem.title, roleName, isLastPosition: true });
                                        }
                                    }}
                                    onDragLeave={handleActionItemDragLeave}
                                    onDrop={(e) => handleActionItemDrop(e, azioniItem.title, null, roleName, true)}
                                >
                                    <span className='add-action-btn' onClick={() => openActionItemModal(roleName, azioniItem.title)}>
                                        <i class="bi bi-plus-lg"></i>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                })}
            </div>

            {isEditMode && (
                <div
                    className={`add-catAction-btn drop-target-last ${dropTarget?.type === 'actionGroup' && dropTarget?.isLastPosition ? 'drop-target' : ''}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (draggingItem?.type === 'actionGroup') {
                            setDropTarget({ type: 'actionGroup', roleName, isLastPosition: true });
                        }
                    }}
                    onDragLeave={handleActionDragLeave}
                    onDrop={(e) => handleActionDrop(e, null, roleName, true)}
                    onClick={() => openTitleItemModal(roleName, 'azioni')}
                >
                    <i class="bi bi-plus-lg"></i>
                </div>
            )}
            <CloneActionModal
                show={cloneActionModalShow}
                handleClose={() => {
                    setCloneActionModalShow(false);
                    setActionToClone(null);
                }}
                roleName={roleName}
                actionToClone={actionToClone}
                MainData={MainData}
                setEpWorkflowjson={setEpWorkflowjson}
                updateCanvasSize={() => { }}
            />
            <DeleteActionModal
                show={deleteActionModalShow}
                handleClose={() => {
                    setDeleteActionModalShow(false);
                    setActionToDelete(null);
                }}
                roleName={roleName}
                actionTitle={actionToDelete}
                MainData={MainData}
                setEpWorkflowjson={setEpWorkflowjson}
                updateCanvasSize={() => { }}
            />
            <CloneActionItemModal
                show={cloneActionItemModalShow}
                handleClose={() => {
                    setCloneActionItemModalShow(false);
                    setActionItemToClone(null);
                    setActionTitleForItem(null);
                }}
                roleName={roleName}
                actionTitle={actionTitleForItem}
                actionItemToClone={actionItemToClone}
                MainData={MainData}
                setEpWorkflowjson={setEpWorkflowjson}
                updateCanvasSize={() => { }}
            />
            <DeleteActionItemModal
                show={deleteActionItemModalShow}
                handleClose={() => {
                    setDeleteActionItemModalShow(false);
                    setActionItemToDelete(null);
                    setActionTitleForItem(null);
                }}
                roleName={roleName}
                actionTitle={actionTitleForItem}
                actionItem={actionItemToDelete}
                MainData={MainData}
                setEpWorkflowjson={setEpWorkflowjson}
                updateCanvasSize={() => { }}
            />
        </Col>
    );
}

export default ActionSection;