import React, { useState, useRef } from 'react';
import { ViewOpenEyeIcon, ViewClosedEyeIcon, GamePadIcon, ArrowMove, ThreeDotsIcon, PlusIcon } from '../../../../Assets/SVGs';
import { toggleActionVisibility } from '../../ViewComponentUtility';
import { Dropdown } from 'react-bootstrap';
import CloneActionModal from '../../Modals/CloneActionModal';
import DeleteActionModal from '../../Modals/DeleteActionModal';
import CloneActionItemModal from '../../Modals/CloneActionItemModal';
import DeleteActionItemModal from '../../Modals/DeleteActionItemModal';

function ActionSection({
    azioni,
    roleName,
    shownStatus,
    associatedActions,
    openActionItemModal,
    openTitleItemModal,
    drawConnections,
    setHoveredAction,
    setHoveredStatus,
    MainData,
    draggingItem,
    setDraggingItem,
    setEpWorkflowjson,
    hoveredAction,
    refsMap,
    isEditMode
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
    const dragStartPosRef = useRef({ x: 0, y: 0 });

    const handleActionMouseHover = (actionKey) => {
        setHoveredAction({ role: roleName, actionKey });
        setHoveredStatus(null);
        const workflowIndex = MainData.length - 1;
        const connections = [];
        if (MainData[workflowIndex]?.workflowmapping) {
            const wf = MainData[workflowIndex].workflowmapping.find((item) => item.keyAzione === actionKey);
            if (wf) {
                if (wf.statoDestinazione)
                    connections.push({
                        startId: actionKey,
                        endId: wf.statoDestinazione,
                        color: 'blue',
                    });
                wf.listeDestinazione.forEach((listId) =>
                    connections.push({
                        startId: actionKey,
                        endId: listId,
                        color: 'red',
                    })
                );
                wf.doNotlisteDestinazione.forEach((listId) =>
                    connections.push({
                        startId: actionKey,
                        endId: listId,
                        color: 'gray',
                    })
                );
            }
        }
        drawConnections(connections);
    };

    const handleMouseLeave = (actionKey) => {
        if (!refsMap.current[actionKey]) return;
        setHoveredStatus(null);
        setHoveredAction(null);
        drawConnections([]);
    };

    const handleActionDragStart = (e, actionTitle) => {
        if (!isEditMode) {
            e.preventDefault();
            return;
        }
        setDraggingItem({ type: 'actionGroup', facultyName: roleName, actionTitle });
        e.dataTransfer.setData('text/plain', JSON.stringify({ actionTitle, facultyName: roleName }));
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
    };

    const handleActionDragOver = (e, actionTitle) => {
        e.preventDefault();
        if (draggingItem?.type === 'actionGroup' && draggingItem?.facultyName === roleName) {
            setDropTarget({ type: 'actionGroup', actionTitle });
        }
    };

    const handleActionDragLeave = () => {
        setDropTarget(null);
    };

    const handleActionDrop = (e, targetActionTitle) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggingItem || draggingItem.type !== 'actionGroup' || draggingItem.facultyName !== roleName) {
            setDraggingItem(null);
            setDropTarget(null);
            return;
        }

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const sourceActionTitle = data.actionTitle;

            if (sourceActionTitle === targetActionTitle) {
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

                const actionArray = [...(data[facultyIndex].azioni || [])];
                const sourceIndex = actionArray.findIndex((action) => action.title === sourceActionTitle);
                const targetIndex = actionArray.findIndex((action) => action.title === targetActionTitle);

                if (sourceIndex === -1 || targetIndex === -1) {
                    console.error('Action not found:', { sourceActionTitle, targetActionTitle });
                    return prevJson;
                }

                const [movedAction] = actionArray.splice(sourceIndex, 1);
                actionArray.splice(targetIndex, 0, movedAction);
                data[facultyIndex].azioni = actionArray;

                return JSON.stringify(data);
            });
        } catch (error) {
            console.error('Error parsing drag data:', error);
        }
        setDraggingItem(null);
        setDropTarget(null);
    };

    const handleActionItemDragStart = (e, actionTitle, itemKey) => {
        if (!isEditMode) {
            e.preventDefault();
            return;
        }
        setDraggingItem({ type: 'action', facultyName: roleName, actionTitle, itemKey });
        e.dataTransfer.setData('text/plain', JSON.stringify({ itemKey, facultyName: roleName, actionTitle }));
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
    };

    const handleActionItemDragOver = (e, actionTitle, itemKey) => {
        e.preventDefault();
        if (draggingItem?.type === 'action' && draggingItem?.facultyName === roleName && draggingItem?.actionTitle === actionTitle) {
            setDropTarget({ type: 'action', actionTitle, itemKey });
        }
    };

    const handleActionItemDragLeave = () => {
        setDropTarget(null);
    };

    const handleActionItemDrop = (e, actionTitle, targetKey) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggingItem || draggingItem.type !== 'action' || draggingItem.facultyName !== roleName || draggingItem.actionTitle !== actionTitle) {
            setDraggingItem(null);
            setDropTarget(null);
            return;
        }

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const sourceKey = data.itemKey;

            if (sourceKey === targetKey) {
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
                const actionIndex = data[facultyIndex].azioni?.findIndex((action) => action.title === actionTitle);
                if (actionIndex === -1) {
                    console.error('Action not found:', actionTitle);
                    return prevJson;
                }
                const actionArray = [...(data[facultyIndex].azioni[actionIndex].listArray || [])];
                const oldIndex = actionArray.findIndex((item) => item.key === sourceKey);
                const newIndex = actionArray.findIndex((item) => item.key === targetKey);

                if (oldIndex === -1 || newIndex === -1) {
                    console.error('Item not found:', { sourceKey, targetKey });
                    return prevJson;
                }

                const [movedItem] = actionArray.splice(oldIndex, 1);
                actionArray.splice(newIndex, 0, movedItem);
                data[facultyIndex].azioni[actionIndex].listArray = actionArray;

                return JSON.stringify(data);
            });
        } catch (error) {
            console.error('Error parsing drag data:', error);
        }
        setDraggingItem(null);
        setDropTarget(null);
    };

    return (
        <div className="d-flex flex-column gap-2 column">
            <div className='d-flex justify-content-center align-item-center'>
                <GamePadIcon height={20} width={20} fill='#6c757d' className='d-flex justify-content-center align-item-center me-1' />
                <span style={{ color: '#6c757d', margin: "-4px 0 0 0" }}>AZIONI</span>
            </div>
            {azioni?.map((azioniItem) => (
                <div
                    className={`d-flex flex-column azioni ${dropTarget?.type === 'actionGroup' && dropTarget?.actionTitle === azioniItem.title ? 'drop-target' : ''}`}
                    key={azioniItem.title}
                    draggable={isEditMode}
                    onDragStart={(e) => handleActionDragStart(e, azioniItem.title)}
                    onDragOver={(e) => handleActionDragOver(e, azioniItem.title)}
                    onDragLeave={handleActionDragLeave}
                    onDrop={(e) => handleActionDrop(e, azioniItem.title)}
                >
                    <div className="azioniItemTitle">
                        {/* <span onClick={() => openTitleItemModal(roleName, 'azioni', { title: azioniItem.title })}>
                            {azioniItem?.title}{' '}
                        </span>
                        <span className="plus-icon" onClick={() => openActionItemModal(roleName, azioniItem.title)}>
                            <RoundPlusIcon className="cursor-pointer" height={20} width={20} />
                        </span> */}
                        <div className='d-flex align-items-center gap-2'>
                            {isEditMode && (
                                <>
                                    <span className='d-flex align-items-center cursor-move ms-1'>
                                        <ArrowMove fill="#495057" width={20} height={20} />
                                    </span>
                                    <span className='vr-line'></span>
                                </>
                            )}
                            <span>
                                {azioniItem?.title}{' '}
                            </span>
                        </div>
                        <div className="d-flex align-items-center justify-content-center mx-2">
                            {isEditMode && <Dropdown>
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
                            </Dropdown>}
                        </div>
                    </div>
                    <div className="actiongroup">
                        {azioniItem?.listArray?.map((item) => {
                            const isAssociated = shownStatus && associatedActions[item.key];
                            return (
                                <div
                                    key={item.key}
                                    className={`azioniArrayItem ${dropTarget?.type === 'action' && dropTarget?.itemKey === item.key && dropTarget?.actionTitle === azioniItem.title ? 'drop-target' : ''}`}
                                    onMouseEnter={() => handleActionMouseHover(item.key)}
                                    onMouseLeave={() => handleMouseLeave(item.key)}
                                    draggable={isEditMode}
                                    onDragStart={(e) => handleActionItemDragStart(e, azioniItem.title, item.key)}
                                    onDragOver={(e) => handleActionItemDragOver(e, azioniItem.title, item.key)}
                                    onDragLeave={handleActionItemDragLeave}
                                    onDrop={(e) => handleActionItemDrop(e, azioniItem.title, item.key)}
                                    style={{
                                        fontWeight: shownStatus && isAssociated ? 'bold' : 'normal',
                                        opacity: shownStatus && !isAssociated ? 0.5 : 1,
                                    }}
                                >
                                    <div className='w-100 d-flex justify-content-between align-items-center' ref={(el) => (refsMap.current[item.key] = el)} id={item.key}>
                                        <div className='d-flex align-items-center gap-2'>
                                            {isEditMode && (
                                                <>
                                                    <span className='d-flex align-items-center cursor-move ms-1'>
                                                        <ArrowMove fill="#495057" width={20} height={20} />
                                                    </span>
                                                    <span className='vr-line'></span>
                                                </>
                                            )}
                                            <span>
                                                {item?.title}{' '}
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center mx-2">
                                            {isEditMode && <Dropdown>
                                                <Dropdown.Toggle className="role_menu">
                                                    <ThreeDotsIcon fill="#495057" className='mb-1' height={17} width={17} />
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
                                            </Dropdown>}
                                        </div>
                                        {/* {shownStatus && hoveredAction?.role === roleName && hoveredAction?.actionKey === item.key && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleActionVisibility(roleName, shownStatus, item.key, MainData, setEpWorkflowjson);
                                                }}
                                                style={{ marginLeft: '5px', cursor: 'pointer' }}
                                            >
                                                {isAssociated ? <ViewOpenEyeIcon /> : <ViewClosedEyeIcon />}
                                            </span>
                                        )} */}
                                    </div>
                                </div>
                            );
                        })}
                        {isEditMode && <span className='listeArrayItem' style={{ width: 'fit-content', padding: '6px 12px' }} onClick={() => openActionItemModal(roleName, azioniItem.title)}>
                            <PlusIcon fill="#495057" className="cursor-pointer" height={15} width={15} />
                        </span>}
                    </div>
                </div>
            ))}
            {isEditMode && <div
                className="liste text-center"
                onClick={() => openTitleItemModal(roleName, 'azioni')}
            >
                <PlusIcon fill="#495057" className="cursor-pointer" height={15} width={15} />
            </div>}
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