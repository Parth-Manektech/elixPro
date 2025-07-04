import React, { useState, useRef } from 'react';
import { ArrowMove, LayersIcon, PlusIcon, ThreeDotsIcon } from '../../../../Assets/SVGs';
import { Dropdown } from 'react-bootstrap';
import CloneListModal from '../../Modals/CloneListModal';
import DeleteListModal from '../../Modals/DeleteListModal';
import CloneListItemModal from '../../Modals/CloneListItemModal';
import DeleteListItemModal from '../../Modals/DeleteListItemModal';

function ListSection({
    liste,
    roleName,
    openListItemModal,
    openTitleItemModal,
    drawConnections,
    setHoveredStatus,
    setHoveredAction,
    MainData,
    draggingItem,
    setDraggingItem,
    setEpWorkflowjson,
    refsMap,
    isEditMode
}) {
    const [cloneListModalShow, setCloneListModalShow] = useState(false);
    const [deleteListModalShow, setDeleteListModalShow] = useState(false);
    const [cloneListItemModalShow, setCloneListItemModalShow] = useState(false);
    const [deleteListItemModalShow, setDeleteListItemModalShow] = useState(false);
    const [listToClone, setListToClone] = useState(null);
    const [listToDelete, setListToDelete] = useState(null);
    const [listItemToClone, setListItemToClone] = useState(null);
    const [listItemToDelete, setListItemToDelete] = useState(null);
    const [listTitleForItem, setListTitleForItem] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);

    const dragStartPosRef = useRef({ x: 0, y: 0 });

    const handleListMouseHover = (listItemKey) => {
        setHoveredStatus(null);
        setHoveredAction(null);
        const workflowIndex = MainData.length - 1;
        const connections = [];
        if (MainData[workflowIndex]?.workflowmapping) {
            MainData[workflowIndex].workflowmapping.forEach((wf) => {
                if (wf.listeDestinazione.includes(listItemKey)) {
                    connections.push({ startId: wf.keyAzione, endId: listItemKey, color: 'red' });
                }
                if (wf.doNotlisteDestinazione.includes(listItemKey)) {
                    connections.push({ startId: wf.keyAzione, endId: listItemKey, color: 'gray' });
                }
            });
        }
        drawConnections(connections);
    };

    const handleMouseLeave = (listItemKey) => {
        if (!refsMap.current[listItemKey]) return;
        setHoveredStatus(null);
        setHoveredAction(null);
        drawConnections([]);
    };

    const handleListDragStart = (e, listTitle) => {
        if (!isEditMode) {
            e.preventDefault();
            return;
        }
        setDraggingItem({ type: 'listGroup', facultyName: roleName, listTitle });
        e.dataTransfer.setData('text/plain', JSON.stringify({ listTitle, facultyName: roleName }));
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
    };

    const handleListDragOver = (e, listTitle) => {
        e.preventDefault();
        if (draggingItem?.type === 'listGroup' && draggingItem?.facultyName === roleName) {
            setDropTarget({ type: 'listGroup', listTitle });
        }
    };

    const handleListDragLeave = () => {
        setDropTarget(null);
    };

    const handleListDrop = (e, targetListTitle) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggingItem || draggingItem.type !== 'listGroup' || draggingItem.facultyName !== roleName) {
            setDraggingItem(null);
            setDropTarget(null);
            return;
        }

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const sourceListTitle = data.listTitle;

            if (sourceListTitle === targetListTitle) {
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

                const listArray = [...(data[facultyIndex].liste || [])];
                const sourceIndex = listArray.findIndex((list) => list.title === sourceListTitle);
                const targetIndex = listArray.findIndex((list) => list.title === targetListTitle);

                if (sourceIndex === -1 || targetIndex === -1) {
                    console.error('List not found:', { sourceListTitle, targetListTitle });
                    return prevJson;
                }

                const [movedList] = listArray.splice(sourceIndex, 1);
                listArray.splice(targetIndex, 0, movedList);
                data[facultyIndex].liste = listArray;

                return JSON.stringify(data);
            });
        } catch (error) {
            console.error('Error parsing drag data:', error);
        }
        setDraggingItem(null);
        setDropTarget(null);
    };

    const handleListItemDragStart = (e, listTitle, itemKey) => {
        if (!isEditMode) {
            e.preventDefault();
            return;
        }
        setDraggingItem({ type: 'list', facultyName: roleName, listTitle, itemKey });
        e.dataTransfer.setData('text/plain', JSON.stringify({ itemKey, facultyName: roleName, listTitle }));
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
    };

    const handleListItemDragOver = (e, listTitle, itemKey) => {
        e.preventDefault();
        if (draggingItem?.type === 'list' && draggingItem?.facultyName === roleName && draggingItem?.listTitle === listTitle) {
            setDropTarget({ type: 'list', listTitle, itemKey });
        }
    };

    const handleListItemDragLeave = () => {
        setDropTarget(null);
    };

    const handleListItemDrop = (e, listTitle, targetKey) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggingItem || draggingItem.type !== 'list' || draggingItem.facultyName !== roleName || draggingItem.listTitle !== listTitle) {
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
                const listIndex = data[facultyIndex].liste?.findIndex((list) => list.title === listTitle);
                if (listIndex === -1) {
                    console.error('List not found:', listTitle);
                    return prevJson;
                }
                const listArray = [...(data[facultyIndex].liste[listIndex].listArray || [])];
                const oldIndex = listArray.findIndex((item) => item.key === sourceKey);
                const newIndex = listArray.findIndex((item) => item.key === targetKey);

                if (oldIndex === -1 || newIndex === -1) {
                    console.error('Item not found:', { sourceKey, targetKey });
                    return prevJson;
                }

                const [movedItem] = listArray.splice(oldIndex, 1);
                listArray.splice(newIndex, 0, movedItem);
                data[facultyIndex].liste[listIndex].listArray = listArray;

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
                <LayersIcon height={20} width={20} className='d-flex justify-content-center align-item-center me-1' />
                <span style={{ color: '#6c757d', margin: "-2px 0 0 0" }}>LISTE</span>
            </div>
            {liste?.map((listeItem) => (
                <div
                    className={`d-flex flex-column mx-1 liste ${dropTarget?.type === 'listGroup' && dropTarget?.listTitle === listeItem.title ? 'drop-target' : ''}`}
                    key={listeItem.title}
                    draggable={isEditMode}
                    onDragStart={(e) => handleListDragStart(e, listeItem.title)}
                    onDragOver={(e) => handleListDragOver(e, listeItem.title)}
                    onDragLeave={handleListDragLeave}
                    onDrop={(e) => handleListDrop(e, listeItem.title)}
                >
                    <div className="listeItemTitle">
                        <div className='d-flex align-items-center gap-2'>
                            {isEditMode && (
                                <>
                                    <span className='d-flex align-items-center cursor-move ms-1'>
                                        <ArrowMove fill="#495057" width={20} height={20} />
                                    </span>
                                    <span className='vr-line'></span>
                                </>
                            )}
                            <span>{listeItem?.title}</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-center mx-2">
                            {isEditMode && <Dropdown>
                                <Dropdown.Toggle className="role_menu">
                                    <ThreeDotsIcon fill="#495057" className='mb-1' height={17} width={17} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={(e) => { e.stopPropagation(); openTitleItemModal(roleName, 'liste', { title: listeItem.title }) }}>
                                        <i className='bi bi-pencil me-2' /> Modifica
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={(e) => {
                                        e.stopPropagation();
                                        setListToClone(listeItem);
                                        setCloneListModalShow(true);
                                    }}>
                                        <i className='bi bi-files me-2' /> Clona
                                    </Dropdown.Item>
                                    <Dropdown.Item className='text-danger' onClick={(e) => {
                                        e.stopPropagation();
                                        setListToDelete(listeItem.title);
                                        setDeleteListModalShow(true);
                                    }}>
                                        <i className='bi bi-trash me-2' /> Elimina
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>}
                        </div>
                    </div>
                    <div className="listGroup">
                        {listeItem?.listArray?.map((listArrayItem) => (
                            <div
                                key={listArrayItem.key}
                                className={`listeArrayItem ${dropTarget?.type === 'list' && dropTarget?.itemKey === listArrayItem.key && dropTarget?.listTitle === listeItem.title ? 'drop-target' : ''}`}
                                onMouseEnter={() => handleListMouseHover(listArrayItem?.key)}
                                onMouseLeave={() => handleMouseLeave(listArrayItem?.key)}
                                draggable={isEditMode}
                                onDragStart={(e) => handleListItemDragStart(e, listeItem.title, listArrayItem.key)}
                                onDragOver={(e) => handleListItemDragOver(e, listeItem.title, listArrayItem.key)}
                                onDragLeave={handleListItemDragLeave}
                                onDrop={(e) => handleListItemDrop(e, listeItem.title, listArrayItem.key)}
                            >
                                <div className='w-100 d-flex justify-content-between align-items-center' ref={(el) => (refsMap.current[listArrayItem.key] = el)} id={listArrayItem?.key}>
                                    <div className='d-flex align-items-center gap-2'>
                                        {isEditMode && (
                                            <>
                                                <span className='d-flex align-items-center cursor-move ms-1'>
                                                    <ArrowMove fill="#495057" width={20} height={20} />
                                                </span>
                                                <span className='vr-line'></span>
                                            </>
                                        )}
                                        <span>{listArrayItem?.title}</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center mx-2">
                                        {isEditMode && <Dropdown>
                                            <Dropdown.Toggle className="role_menu">
                                                <ThreeDotsIcon fill="#495057" className='mb-1' height={17} width={17} />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={(e) => { e.stopPropagation(); openListItemModal(roleName, listeItem.title, listArrayItem) }}>
                                                    <i className='bi bi-pencil me-2' /> Modifica
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={(e) => {
                                                    e.stopPropagation();
                                                    setListItemToClone(listArrayItem);
                                                    setListTitleForItem(listeItem.title);
                                                    setCloneListItemModalShow(true);
                                                }}>
                                                    <i className='bi bi-files me-2' /> Clona
                                                </Dropdown.Item>
                                                <Dropdown.Item className='text-danger' onClick={(e) => {
                                                    e.stopPropagation();
                                                    setListItemToDelete(listArrayItem);
                                                    setListTitleForItem(listeItem.title);
                                                    setDeleteListItemModalShow(true);
                                                }}>
                                                    <i className='bi bi-trash me-2' /> Elimina
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isEditMode && <span className='listeArrayItem' style={{ width: 'fit-content', padding: '6px 12px', cursor: 'pointer' }} onClick={() => openListItemModal(roleName, listeItem.title)}>
                            <PlusIcon fill="#495057" className="cursor-pointer" height={15} width={15} />
                        </span>}
                    </div>
                </div>
            ))}
            {isEditMode && <div
                className="liste text-center cursor-pointer"
                onClick={() => openTitleItemModal(roleName, 'liste')}
            >
                <PlusIcon fill="#495057" className="cursor-pointer" height={15} width={15} />
            </div>}

            <CloneListModal
                show={cloneListModalShow}
                handleClose={() => {
                    setCloneListModalShow(false);
                    setListToClone(null);
                }}
                roleName={roleName}
                listToClone={listToClone}
                MainData={MainData}
                setEpWorkflowjson={setEpWorkflowjson}
                updateCanvasSize={() => { }}
            />
            <DeleteListModal
                show={deleteListModalShow}
                handleClose={() => {
                    setDeleteListModalShow(false);
                    setListToDelete(null);
                }}
                roleName={roleName}
                listTitle={listToDelete}
                MainData={MainData}
                setEpWorkflowjson={setEpWorkflowjson}
                updateCanvasSize={() => { }}
            />
            <CloneListItemModal
                show={cloneListItemModalShow}
                handleClose={() => {
                    setCloneListItemModalShow(false);
                    setListItemToClone(null);
                    setListTitleForItem(null);
                }}
                roleName={roleName}
                listTitle={listTitleForItem}
                listItemToClone={listItemToClone}
                MainData={MainData}
                setEpWorkflowjson={setEpWorkflowjson}
                updateCanvasSize={() => { }}
            />
            <DeleteListItemModal
                show={deleteListItemModalShow}
                handleClose={() => {
                    setDeleteListItemModalShow(false);
                    setListItemToDelete(null);
                    setListTitleForItem(null);
                }}
                roleName={roleName}
                listTitle={listTitleForItem}
                listItem={listItemToDelete}
                MainData={MainData}
                setEpWorkflowjson={setEpWorkflowjson}
                updateCanvasSize={() => { }}
            />
        </div>
    );
}

export default ListSection;