import React, { useState, useRef, useEffect } from 'react';
import { ViewOpenEyeIcon, ViewClosedEyeIcon, GamePadIcon, ArrowMove, ThreeDotsIcon, PlusIcon } from '../../../../Assets/SVGs';
import { toggleActionVisibility } from '../../ViewComponentUtility';
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
    element
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

    const handleActionItemClick = (actionKey, actionTitle) => {
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
        if (draggingItem?.type === 'actionGroup') {
            setDropTarget({ type: 'actionGroup', actionTitle, roleName: targetRoleName });
        }
    };

    const handleActionDragLeave = () => {
        setDropTarget(null);
    };

    const handleActionDrop = (e, targetActionTitle, targetRoleName, isLastPosition = false) => {
        e.preventDefault();
        e.stopPropagation();
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
        const actualClickedElement = dragStartSourceRefAction.current;
        if (!isEditMode || actualClickedElement?.className?.baseVal !== "ArrowMoveAction") {
            e.preventDefault();
            return;
        }
        setDraggingItem({ type: 'action', facultyName: roleName, actionTitle, itemKey });
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'action', itemKey, facultyName: roleName, actionTitle }));
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
    };

    const handleActionItemDragOver = (e, actionTitle, itemKey, targetRoleName) => {
        e.preventDefault();
        if (draggingItem?.type === 'action') {
            setDropTarget({ type: 'action', actionTitle, itemKey, roleName: targetRoleName });
        }
    };

    const handleActionItemDragLeave = () => {
        setDropTarget(null);
    };

    const handleActionItemDrop = (e, targetActionTitle, targetKey, targetRoleName, isLastPosition = false) => {
        e.preventDefault();
        e.stopPropagation();
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
    };

    useEffect(() => {
        const Allaction = [];
        MainData.forEach(item => {
            if (item.ruolo && item.ruolo.key !== element?.ruolo?.key) {
                if (item.azioni && Array.isArray(item.azioni)) {
                    item.azioni.forEach(action => {
                        if (action.listArray && Array.isArray(action.listArray)) {
                            action.listArray.forEach(actionItem => {
                                if (actionItem.key) {
                                    Allaction.push(actionItem.key);
                                }
                            });
                        }
                    });
                }
            }
        });
        setActionKeys(Allaction);
    }, [MainData, element]);

    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            La Key non è univoca! Viene usata più volte.
        </Tooltip>
    );

    return (
        <div className="d-flex flex-column gap-2 column">
            <div className='d-flex justify-content-center align-item-center'>
                <GamePadIcon height={20} width={20} fill='#6c757d' className='d-flex justify-content-center align-item-center me-1' />
                <span style={{ color: '#6c757d', margin: "-4px 0 0 0" }}>AZIONI</span>
            </div>
            {azioni?.map((azioniItem) => (
                <div
                    className={`d-flex flex-column azioni ${dropTarget?.type === 'actionGroup' && dropTarget?.actionTitle === azioniItem.title && dropTarget?.roleName === roleName ? 'drop-target' : ''}`}
                    key={azioniItem.title}
                    draggable={isEditMode}
                    onDragStart={(e) => handleActionDragStart(e, azioniItem.title)}
                    onDragOver={(e) => handleActionDragOver(e, azioniItem.title, roleName)}
                    onDragLeave={handleActionDragLeave}
                    onMouseDown={(e) => {
                        dragStartSourceRefAction.current = e.target;
                    }}
                    onDrop={(e) => handleActionDrop(e, azioniItem.title, roleName)}
                >
                    <div className="azioniItemTitle">
                        <div className='d-flex align-items-center gap-2'>
                            {isEditMode && (
                                <>
                                    <span className='ArrowMoveactionGroup d-flex align-items-center cursor-move ms-1'>
                                        <ArrowMove className='ArrowMoveactionGroup' fill="#495057" width={20} height={20} />
                                    </span>
                                    <span className='vr-line'></span>
                                </>
                            )}
                            <span>{azioniItem?.title}</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-center mx-2">
                            {isEditMode && (
                                <Dropdown>
                                    <Dropdown.Toggle className="role_menu">
                                        <ThreeDotsIcon fill="#495057" className='mb-1' height={17} width={17} />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={(e) => { e.stopPropagation(); openTitleItemModal(roleName, 'azioni', { title: azioniItem.title }) }}>
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
                            return (
                                <div
                                    key={item.key}
                                    id={item.key}
                                    data-id={`${element?.ruolo?.key}_${item?.key}`}
                                    ref={(el) => (refsMap.current[`${element?.ruolo?.key}_${item?.key}`] = el)}
                                    className={`azioniArrayItem ${dropTarget?.type === 'action' && dropTarget?.itemKey === item.key && dropTarget?.actionTitle === azioniItem.title && dropTarget?.roleName === roleName ? 'drop-target' : ''}`}
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
                                    onDrop={(e) => handleActionItemDrop(e, azioniItem.title, item.key, roleName)}
                                    style={{
                                        backgroundColor: selectedElement?.type === 'action' && selectedElement.itemKey === item.key && selectedElement.actionTitle === azioniItem.title && selectedElement.roleName === roleName ? '#343a40' : '',
                                        color: selectedElement?.type === 'action' && selectedElement.itemKey === item.key && selectedElement.actionTitle === azioniItem.title && selectedElement.roleName === roleName ? 'white' : '',
                                        border: (shownStatus && isAssociated && selectedElement?.type === 'status' && selectedElement.roleName === roleName) ? '3px solid black' : '2px solid #ced4da',
                                    }}
                                >
                                    <div className='w-100 d-flex justify-content-between align-items-center'>
                                        <div className='d-flex align-items-center gap-2'>
                                            {isEditMode && (
                                                <>
                                                    <span className='ArrowMoveAction d-flex align-items-center cursor-move ms-1'>
                                                        <ArrowMove className='ArrowMoveAction' fill={selectedElement?.type === 'action' && selectedElement.itemKey === item.key && selectedElement.actionTitle === azioniItem.title && selectedElement.roleName === roleName ? 'white' : '#495057'} width={20} height={20} />
                                                    </span>
                                                    <span className='vr-line'></span>
                                                </>
                                            )}
                                            <span className='d-flex align-items-center gap-1'>
                                                {(isEditMode && isDuplicateAction) && <OverlayTrigger overlay={renderTooltip} placement='top'><i className='bi bi-exclamation-triangle-fill text-danger'></i></OverlayTrigger>}
                                                {item?.title}
                                            </span>
                                            {(isEditMode && selectedElement?.type === 'status' && selectedElement.roleName === roleName) && (
                                                <div className="enable-action-for-status-checkbox" title="Abilita/disabilita azione per lo stato attivo" onClick={(e) => { e.stopPropagation(); }}>
                                                    <input type="checkbox" checked={shownStatus && isAssociated ? true : false} onChange={() => toggleActionVisibility(roleName, shownStatus, item.key, MainData, setEpWorkflowjson)} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center mx-2" onClick={(e) => e.stopPropagation()}>
                                            {isEditMode && (
                                                <Dropdown>
                                                    <Dropdown.Toggle className="role_menu">
                                                        <ThreeDotsIcon fill={selectedElement?.type === 'action' && selectedElement.itemKey === item.key && selectedElement.actionTitle === azioniItem.title && selectedElement.roleName === roleName ? 'white' : '#495057'} className='mb-1' height={17} width={17} />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={(e) => { e.stopPropagation(); openActionItemModal(roleName, azioniItem.title, item) }}>
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
                                style={{ width: '100%' }}
                                className={`drop-target-last ${dropTarget?.type === 'action' && dropTarget?.actionTitle === azioniItem.title && dropTarget?.isLastPosition ? 'drop-target' : ''}`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    if (draggingItem?.type === 'action') {
                                        setDropTarget({ type: 'action', actionTitle: azioniItem.title, roleName, isLastPosition: true });
                                    }
                                }}
                                onDragLeave={handleActionItemDragLeave}
                                onDrop={(e) => handleActionItemDrop(e, azioniItem.title, null, roleName, true)}
                            >
                                <span className='listeArrayItem' style={{ width: 'fit-content', padding: '6px 12px', cursor: 'pointer' }} onClick={() => openActionItemModal(roleName, azioniItem.title)}>
                                    <PlusIcon fill="#495057" className="cursor-pointer" height={15} width={15} />
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {isEditMode && (
                <div
                    className={`liste text-center drop-target-last ${dropTarget?.type === 'actionGroup' && dropTarget?.isLastPosition ? 'drop-target' : ''}`}
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
                    <PlusIcon fill="#495057" className="cursor-pointer" height={15} width={15} />
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
        </div>
    );
}

export default ActionSection;