import React, { useState, useRef, useEffect } from 'react';
import { ArrowMove, LayersIcon, PlusIcon, ThreeDotsIcon } from '../../../../Assets/SVGs';
import { Col, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CloneListModal from '../../Modals/CloneListModal';
import DeleteListModal from '../../Modals/DeleteListModal';
import CloneListItemModal from '../../Modals/CloneListItemModal';
import DeleteListItemModal from '../../Modals/DeleteListItemModal';
import { drawSelectedElementArrows } from '../../../../utils/arrowUtils';

function ListSection({
    liste,
    roleName,
    openListItemModal,
    openTitleItemModal,
    setHoveredStatus,
    setHoveredAction,
    MainData,
    draggingItem,
    setDraggingItem,
    containerRef,
    setEpWorkflowjson,
    refsMap,
    isEditMode,
    selectedElement,
    setSelectedElement,
    clearLeaderLines,
    createLeaderLine,
    leaderLinesRef,
    element,
    rDataID,
    dataID
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
    const [listKeys, setListKeys] = useState([]);
    const [duplicateList, setDuplicateList] = useState([])
    const dragStartSourceRef = useRef(null);

    const dragStartPosRef = useRef({ x: 0, y: 0 });


    const handleListMouseHover = (listItemKey) => {
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
                if (wf.listeDestinazione.includes(listItemKey) && isElementVisible(wf.keyAzione) && isElementVisible(listItemKey)) {
                    const ActionElement = MainData.find(item =>
                        item.azioni?.some(azione =>
                            azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                        ));
                    createLeaderLine(
                        `${ActionElement?.ruolo?.key}_${wf.keyAzione}`,
                        `${element?.ruolo?.key}_${listItemKey}`,
                        'rgba(41, 115, 147, 0.25)',
                        'behind',
                        'arrow2',
                        false,
                        containerRef
                    );
                } else if (wf.listeDestinazione.includes(listItemKey) && !isElementVisible(wf.keyAzione) && isElementVisible(listItemKey)) {
                    const ActionElement = MainData.find(item =>
                        item.azioni?.some(azione =>
                            azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                        ));
                    createLeaderLine(
                        `${ActionElement?.ruolo?.key}`,
                        `${element?.ruolo?.key}_${listItemKey}`,
                        'rgba(41, 115, 147, 0.25)',
                        'behind',
                        'arrow2',
                        false,
                        containerRef
                    );
                }

                if (wf.doNotlisteDestinazione.includes(listItemKey) && isElementVisible(wf.keyAzione) && isElementVisible(listItemKey)) {
                    const ActionElement = MainData.find(item =>
                        item.azioni?.some(azione =>
                            azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                        ));
                    createLeaderLine(
                        `${ActionElement?.ruolo?.key}_${wf.keyAzione}`,
                        `${element?.ruolo?.key}_${listItemKey}`,
                        'rgba(202, 138, 4, 0.25)',
                        'square',
                        'square',
                        false,
                        containerRef
                    );
                } else if (wf.doNotlisteDestinazione.includes(listItemKey) && !isElementVisible(wf.keyAzione) && isElementVisible(listItemKey)) {
                    const ActionElement = MainData.find(item =>
                        item.azioni?.some(azione =>
                            azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                        ));
                    createLeaderLine(
                        `${ActionElement?.ruolo?.key}`,
                        `${element?.ruolo?.key}_${listItemKey}`,
                        'rgba(202, 138, 4, 0.25)',
                        'square',
                        'square',
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

    const handleMouseLeave = (listItemKey) => {
        if (!refsMap.current[`${element?.ruolo?.key}_${listItemKey}`]) return;
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

    const isCheckRelation = (listItemKey) => {
        const workflowIndex = MainData.length - 1;
        if (MainData[workflowIndex]?.workflowmapping) {
            const result = MainData[workflowIndex].workflowmapping.some((wf) =>
                wf.listeDestinazione.includes(listItemKey) ||
                wf.doNotlisteDestinazione.includes(listItemKey)
            );
            return result
        }
    }

    const handleListItemClick = (listItemKey, listTitle) => {
        if (isCheckRelation(listItemKey)) {
            const newSelectedElement = { type: 'list', roleName, listTitle, itemKey: listItemKey, data_id: `${element?.ruolo?.key}_${listItemKey}` };
            if (
                selectedElement?.type === 'list' &&
                selectedElement.itemKey === listItemKey &&
                selectedElement.listTitle === listTitle &&
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

                MainData[workflowIndex].workflowmapping.forEach((wf) => {
                    if (wf.listeDestinazione.includes(listItemKey) && isElementVisible(wf.keyAzione) && isElementVisible(listItemKey)) {
                        const ActionElement = MainData.find(item =>
                            item.azioni?.some(azione =>
                                azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                            ));
                        createLeaderLine(`${ActionElement?.ruolo?.key}_${wf.keyAzione}`, `${element?.ruolo?.key}_${listItemKey}`, 'rgba(41, 115, 147, 1)', 'behind', 'arrow2', true, containerRef);
                    } else if (wf.listeDestinazione.includes(listItemKey) && !isElementVisible(wf.keyAzione) && isElementVisible(listItemKey)) {
                        const ActionElement = MainData.find(item =>
                            item.azioni?.some(azione =>
                                azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                            ));
                        createLeaderLine(
                            `${ActionElement?.ruolo?.key}`,
                            `${element?.ruolo?.key}_${listItemKey}`,
                            'rgba(41, 115, 147, 0.25)',
                            'behind',
                            'arrow2',
                            true,
                            containerRef
                        );
                    }

                    if (
                        wf.doNotlisteDestinazione.includes(listItemKey) &&
                        isElementVisible(wf.keyAzione) &&
                        isElementVisible(listItemKey)
                    ) {
                        const ActionElement = MainData.find(item =>
                            item.azioni?.some(azione =>
                                azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                            ));
                        createLeaderLine(
                            `${ActionElement?.ruolo?.key}_${wf.keyAzione}`,
                            `${element?.ruolo?.key}_${listItemKey}`,
                            'rgba(202, 138, 4, 1)',
                            'square',
                            'square',
                            true,
                            containerRef
                        );
                    } else if (wf.doNotlisteDestinazione.includes(listItemKey) && !isElementVisible(wf.keyAzione) && isElementVisible(listItemKey)) {
                        const ActionElement = MainData.find(item =>
                            item.azioni?.some(azione =>
                                azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                            ));
                        createLeaderLine(
                            `${ActionElement?.ruolo?.key}`,
                            `${element?.ruolo?.key}_${listItemKey}`,
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
    };

    useEffect(() => {
        const container = containerRef.current;
        const updateLeaderLines = () => {
            leaderLinesRef.current.forEach((line) => line.position());
        };

        if (container) {
            container.addEventListener('scroll', updateLeaderLines);
        }

        if (selectedElement?.type === 'list' && selectedElement.roleName === roleName) {
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

    const handleListDragStart = (e, listTitle) => {
        clearLeaderLines();
        const actualClickedElement = dragStartSourceRef.current;

        if (!isEditMode || actualClickedElement?.className?.baseVal !== "ArrowMovelistGroup") {
            e.preventDefault();
            return;
        }
        setDraggingItem({ type: 'listGroup', facultyName: roleName, listTitle });
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'listGroup', listTitle, facultyName: roleName }));
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
    };

    const handleListDragOver = (e, listTitle, targetRoleName) => {
        e.preventDefault();
        clearLeaderLines();
        if (draggingItem?.type === 'listGroup') {
            setDropTarget({ type: 'listGroup', listTitle, roleName: targetRoleName });
        }
    };

    const handleListDragLeave = () => {
        clearLeaderLines()
        setDropTarget(null);
    };

    const handleListDrop = (e, targetListTitle, targetRoleName, isLastPosition = false) => {
        e.preventDefault();
        e.stopPropagation();
        clearLeaderLines()
        if (!draggingItem || draggingItem.type !== 'listGroup') {
            setDraggingItem(null);
            setDropTarget(null);
            return;
        }

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const sourceListTitle = data.listTitle;
            const sourceFacultyName = data.facultyName;

            if (sourceFacultyName === targetRoleName && sourceListTitle === targetListTitle) {
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

                const sourceListArray = [...(data[sourceFacultyIndex].liste || [])];
                const sourceIndex = sourceListArray.findIndex((list) => list.title === sourceListTitle);

                if (sourceIndex === -1) {
                    console.error('Source list not found:', sourceListTitle);
                    return prevJson;
                }

                const [movedList] = sourceListArray.splice(sourceIndex, 1);
                data[sourceFacultyIndex].liste = sourceListArray;

                // Initialize liste array if it doesn't exist
                if (!data[targetFacultyIndex].liste) {
                    data[targetFacultyIndex].liste = [];
                }
                const targetListArray = [...data[targetFacultyIndex].liste];

                if (isLastPosition) {
                    // Append to the end of the target list array
                    targetListArray.push(movedList);
                } else {
                    const targetIndex = targetListArray.findIndex((list) => list.title === targetListTitle);
                    if (targetIndex === -1) {
                        targetListArray.push(movedList);
                    } else {
                        targetListArray.splice(targetIndex, 0, movedList);
                    }
                }
                data[targetFacultyIndex].liste = targetListArray;

                return JSON.stringify(data);
            });
        } catch (error) {
            console.error('Error parsing drag data:', error);
        }
        setDraggingItem(null);
        setDropTarget(null);
    };

    const handleListItemDragStart = (e, listTitle, itemKey) => {
        clearLeaderLines()
        const actualClickedElement = dragStartSourceRef.current;
        if (!isEditMode || actualClickedElement?.className?.baseVal !== "ArrowMovelist") {
            e.preventDefault();
            return;
        }

        setDraggingItem({ type: 'list', facultyName: roleName, listTitle, itemKey });
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'list', itemKey, facultyName: roleName, listTitle }));
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
        e.currentTarget.classList.add("list-item-dragging");
    };

    const handleListItemDragOver = (e, listTitle, itemKey, targetRoleName) => {
        clearLeaderLines()
        if (draggingItem?.type === 'list') {
            setDropTarget({ type: 'list', listTitle, itemKey, roleName: targetRoleName });
        }
    };

    const handleListItemDragLeave = (e) => {
        setDropTarget(null);
        clearLeaderLines();
    };

    const handleListItemDrop = (e, targetListTitle, targetKey, targetRoleName, isLastPosition = false) => {
        e.preventDefault();
        e.stopPropagation();
        clearLeaderLines();
        if (!draggingItem || draggingItem.type !== 'list') {
            setDraggingItem(null);
            setDropTarget(null);
            return;
        }

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const sourceKey = data.itemKey;
            const sourceFacultyName = data.facultyName;
            const sourceListTitle = data.listTitle;

            if (sourceFacultyName === targetRoleName && sourceListTitle === targetListTitle && sourceKey === targetKey) {
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

                const sourceListIndex = data[sourceFacultyIndex].liste?.findIndex((list) => list.title === sourceListTitle);
                const targetListIndex = data[targetFacultyIndex].liste?.findIndex((list) => list.title === targetListTitle);

                if (sourceListIndex === -1 || targetListIndex === -1) {
                    console.error('List not found:', { sourceListTitle, targetListTitle });
                    return prevJson;
                }

                const sourceListArray = [...(data[sourceFacultyIndex].liste[sourceListIndex].listArray || [])];
                const sourceIndex = sourceListArray.findIndex((item) => item.key === sourceKey);

                if (sourceIndex === -1) {
                    console.error('Source item not found:', sourceKey);
                    return prevJson;
                }

                const [movedItem] = sourceListArray.splice(sourceIndex, 1);
                data[sourceFacultyIndex].liste[sourceListIndex].listArray = sourceListArray;

                // Initialize listArray if it doesn't exist
                if (!data[targetFacultyIndex].liste[targetListIndex].listArray) {
                    data[targetFacultyIndex].liste[targetListIndex].listArray = [];
                }
                const targetListArray = [...data[targetFacultyIndex].liste[targetListIndex].listArray];

                if (isLastPosition) {
                    // Append to the end of the target list array
                    targetListArray.push(movedItem);
                } else {
                    const targetIndex = targetListArray.findIndex((item) => item.key === targetKey);
                    if (targetIndex === -1) {
                        targetListArray.push(movedItem);
                    } else {
                        targetListArray.splice(targetIndex, 0, movedItem);
                    }
                }
                data[targetFacultyIndex].liste[targetListIndex].listArray = targetListArray;

                return JSON.stringify(data);
            });
        } catch (error) {
            console.error('Error parsing drag data:', error);
        }
        setDraggingItem(null);
        setDropTarget(null);
        document.querySelectorAll('.list-item-dragging').forEach((element) => {
            element.classList.remove('list-item-dragging');
        });
        console.log('drop');

    };

    const handleListItemDragEnd = (e, listTitle, itemKey) => {
        e.preventDefault();
        e.stopPropagation();
        clearLeaderLines();

        document.querySelectorAll('.list-item-dragging').forEach((element) => {
            element.classList.remove('list-item-dragging');
        });

        setDraggingItem(null);
        setDropTarget(null);
    };

    useEffect(() => {
        const AllList = [];
        const dublicateLists = []
        MainData.forEach(item => {
            if (item.ruolo && item.ruolo.key !== element?.ruolo?.key) {
                if (item.liste && Array.isArray(item.liste)) {
                    item.liste.forEach(list => {
                        if (list.listArray && Array.isArray(list.listArray)) {
                            list.listArray.forEach(listItem => {
                                if (listItem.key) {
                                    const Addlist = {
                                        label: `${item?.ruolo?.key}-${list.title?.replaceAll(" ", "-")}-${listItem.key}`,
                                        value: listItem.key
                                    }
                                    dublicateLists.push(Addlist)
                                    AllList.push(listItem.key);
                                }
                            });
                        }
                    });
                }
            }
        });
        setListKeys(AllList);
        setDuplicateList(dublicateLists)
    }, [MainData, element]);

    const renderTooltip = (props, msg) => (
        <Tooltip id="button-tooltip" {...props}>
            La Key non è univoca! Viene usata più volte: {msg}.
        </Tooltip>
    );



    return (
        <Col>
            <div className='column-header'>
                <i class="bi bi-layers me-1"></i>LISTE
            </div>
            <div className="container-catLista d-flex flex-column gap-1">
                {liste?.map((listeItem) => {
                    const catListkey = `${element?.ruolo?.key}-${listeItem?.title?.replaceAll(" ", "-")}`
                    const clDataID = dataID.catlistId[catListkey]
                    return <div
                        data-id={clDataID}
                        className={`catLista ${dropTarget?.type === 'listGroup' && dropTarget?.listTitle === listeItem.title && dropTarget?.roleName === roleName ? 'drop-target' : ''}`}
                        key={listeItem.title}
                        draggable={isEditMode}
                        onDragStart={(e) => handleListDragStart(e, listeItem.title)}
                        onDragOver={(e) => handleListDragOver(e, listeItem.title, roleName)}
                        onDragLeave={handleListDragLeave}
                        onMouseDown={(e) => {
                            dragStartSourceRef.current = e.target;
                        }}
                        onDrop={(e) => handleListDrop(e, listeItem.title, roleName)}
                    >
                        <div className="catLista-header">
                            <div className='d-flex align-items-center gap-2'>
                                {isEditMode && (
                                    <>
                                        <div className='catLista-title ArrowMovelistGroup d-flex align-items-center cursor-grab ms-1'>
                                            <ArrowMove className='ArrowMovelistGroup' fill="#495057" width={20} height={20} />
                                        </div>
                                        <span className='vr-line'></span>
                                    </>
                                )}
                                <span className='catLista-text'>{listeItem?.title}</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-center mx-2 DrpDownlistitem" >
                                {isEditMode && (
                                    <Dropdown>
                                        <Dropdown.Toggle className="menu-btn-list">
                                            <ThreeDotsIcon fill="#495057" className='mb-1' height={17} width={17} />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={(e) => { e.stopPropagation(); openTitleItemModal(roleName, 'liste', { title: listeItem.title }, clDataID) }}>
                                                <i className='bi bi-pencil me-2' /> Modifica
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setListToClone(listeItem);
                                                    setCloneListModalShow(true);
                                                }}>
                                                <i className='bi bi-files me-2' /> Clona
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                className='text-danger' onClick={(e) => {
                                                    e.stopPropagation();
                                                    setListToDelete(listeItem.title);
                                                    setDeleteListModalShow(true);
                                                }}>
                                                <i className='bi bi-trash me-2' /> Elimina
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                )}
                            </div>
                        </div>

                        <div className="listGroup">
                            {listeItem?.listArray?.map((listArrayItem) => {
                                const isDuplicateList = listKeys?.includes(listArrayItem?.key);
                                const lDataID = dataID.listId[`${catListkey}-${listArrayItem.key}`]
                                let sameDataId
                                if (isDuplicateList) {
                                    const sameList = duplicateList.find(e => e.value === listArrayItem?.key);
                                    sameDataId = dataID.listId[sameList?.label]
                                }
                                return (
                                    <div
                                        key={listArrayItem.key}
                                        ref={(el) => (refsMap.current[`${element?.ruolo?.key}_${listArrayItem?.key}`] = el)}
                                        id={listArrayItem?.key}
                                        data-id={lDataID}
                                        data-key={`${listArrayItem?.key}`}
                                        className={`list-item ${dropTarget?.type === 'list' && dropTarget?.itemKey === listArrayItem.key && dropTarget?.listTitle === listeItem.title && dropTarget?.roleName === roleName ? 'drop-target' : ''}`}
                                        onMouseEnter={() => handleListMouseHover(listArrayItem?.key)}
                                        onMouseLeave={() => handleMouseLeave(listArrayItem?.key)}
                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleListItemClick(listArrayItem?.key, listeItem.title) }}
                                        draggable={isEditMode}
                                        onDragStart={(e) => handleListItemDragStart(e, listeItem.title, listArrayItem.key)}
                                        onDragOver={(e) => handleListItemDragOver(e, listeItem.title, listArrayItem.key, roleName)}
                                        onDragLeave={handleListItemDragLeave}
                                        onDragEnd={(e) => handleListItemDragEnd(e, listeItem.title, listArrayItem.key)}
                                        onDrop={(e) => handleListItemDrop(e, listeItem.title, listArrayItem.key, roleName)}
                                        onMouseDown={(e) => {
                                            dragStartSourceRef.current = e.target;
                                        }}
                                        style={{
                                            backgroundColor: selectedElement?.type === 'list' && selectedElement.itemKey === listArrayItem.key && selectedElement.listTitle === listeItem.title && selectedElement.roleName === roleName ? '#343a40' : '',
                                            color: selectedElement?.type === 'list' && selectedElement.itemKey === listArrayItem.key && selectedElement.listTitle === listeItem.title && selectedElement.roleName === roleName ? 'white' : '',
                                        }}
                                    >
                                        <div className='w-100 d-flex justify-content-between align-items-center'>
                                            <div className='list-title'>
                                                {isEditMode && (
                                                    <>
                                                        <span className='ArrowMovelist  d-flex align-items-center cursor-grab ms-1'>
                                                            <ArrowMove className='ArrowMovelist' fill={selectedElement?.type === 'list' && selectedElement.itemKey === listArrayItem.key && selectedElement.listTitle === listeItem.title && selectedElement.roleName === roleName ? 'white' : '#495057'} width={20} height={20} />
                                                        </span>
                                                        <span className='vr-line'></span>
                                                    </>
                                                )}
                                                <span className='item-title'>
                                                    {/* {(isEditMode && isDuplicateList) && <OverlayTrigger overlay={(e) => renderTooltip(e, `${lDataID}, ${sameDataId}`)} placement='top'><i className='bi bi-exclamation-triangle-fill text-danger'></i></OverlayTrigger>} */}
                                                    {listArrayItem?.title}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-center mx-2" onClick={(e) => e.stopPropagation()}>
                                                {isEditMode && (
                                                    <Dropdown>
                                                        <Dropdown.Toggle className="menu-btn-list ">
                                                            <ThreeDotsIcon fill={selectedElement?.type === 'list' && selectedElement.itemKey === listArrayItem.key && selectedElement.listTitle === listeItem.title && selectedElement.roleName === roleName ? 'white' : '#495057'} className='mb-1' height={17} width={17} />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                onMouseEnter={(e) => {
                                                                    e.stopPropagation(); e.preventDefault()
                                                                }}
                                                                onClick={(e) => { e.stopPropagation(); openListItemModal(roleName, listeItem.title, listArrayItem, lDataID) }}>
                                                                <i className='bi bi-pencil me-2' /> Modifica
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setListItemToClone(listArrayItem);
                                                                    setListTitleForItem(listeItem.title);
                                                                    setCloneListItemModalShow(true);
                                                                }}>
                                                                <i className='bi bi-files me-2' /> Clona
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                className='text-danger' onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setListItemToDelete(listArrayItem);
                                                                    setListTitleForItem(listeItem.title);
                                                                    setDeleteListItemModalShow(true);
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
                                    className={`drop-target-last ${dropTarget?.type === 'list' && dropTarget?.listTitle === listeItem.title && dropTarget?.isLastPosition ? 'drop-target' : ''} w-100`}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        if (draggingItem?.type === 'list') {
                                            setDropTarget({ type: 'list', listTitle: listeItem.title, roleName, isLastPosition: true });
                                        }
                                    }}
                                    onDragLeave={handleListItemDragLeave}
                                    onDrop={(e) => handleListItemDrop(e, listeItem.title, null, roleName, true)}
                                >
                                    <span className='add-list-btn' onClick={() => openListItemModal(roleName, listeItem.title)}>
                                        <i class="bi bi-plus-lg"></i>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                })}
                {isEditMode && (
                    <div
                        className={`add-catList-btn drop-target-last ${dropTarget?.type === 'listGroup' && dropTarget?.isLastPosition ? 'drop-target' : ''}`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (draggingItem?.type === 'listGroup') {
                                setDropTarget({ type: 'listGroup', roleName, isLastPosition: true });
                            }
                        }}
                        onDragLeave={handleListDragLeave}
                        onDrop={(e) => handleListDrop(e, null, roleName, true)}
                        onClick={() => openTitleItemModal(roleName, 'liste')}
                    >
                        <i class="bi bi-plus-lg"></i>
                    </div>
                )}
            </div>

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
        </Col>
    );
}

export default ListSection;