
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { PencilIcon, RoundPlusIcon, ViewClosedEyeIcon, ViewOpenEyeIcon } from '../../Assets/SVGs';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import ListItemModal from '../../Components/editorComponents/Modals/ListItemModal';
import ActionItemModal from '../../Components/editorComponents/Modals/actionItemModal';
import StatusModal from '../../Components/editorComponents/Modals/StatusModal';
import TitleModal from '../../Components/editorComponents/Modals/TitleModal';
import RoleItemModal from '../../Components/editorComponents/Modals/RoleModal';
import { SortableItem, SortableRoleCard } from '../../Components/editorComponents/ViewComponentUtility';

function View({ epWorkflowjson, setEpWorkflowjson }) {
    const MainData = useMemo(() => epWorkflowjson ? JSON.parse(epWorkflowjson) : [], [epWorkflowjson]);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [shownStatuses, setShownStatuses] = useState({});
    const [hoveredStatus, setHoveredStatus] = useState(null);
    const [hoveredAction, setHoveredAction] = useState(null);
    const [hoveredList, setHoveredList] = useState(null);
    const [listItemModalShow, setListItemModalShow] = useState(false);
    const [actionItemModalShow, setActionItemModalShow] = useState(false);
    const [statusItemModalShow, setStatusItemModalShow] = useState(false);
    const [titleItemModalShow, setTitleItemModalShow] = useState(false);
    const [roleModalShow, setRoleModalShow] = useState(false);
    const [titleModalType, setTitleModalType] = useState('');
    const [currentFaculty, setCurrentFaculty] = useState('');
    const [selectedListItem, setSelectedListItem] = useState(null);
    const [selectedActionItem, setSelectedActionItem] = useState(null);
    const [selectedStatusItem, setSelectedStatusItem] = useState(null);
    const [selectedRoleItem, setSelectedRoleItem] = useState(null);
    const [currentListTitle, setCurrentListTitle] = useState('');
    const [currentActionTitle, setCurrentActionTitle] = useState('');
    const [selectedTitle, setSelectedTitle] = useState(null);
    const [collapsedCards, setCollapsedCards] = useState({});
    const [hoveredRole, setHoveredRole] = useState(null);
    const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const refsMap = useRef({});
    const resizingRef = useRef(null);
    const startPosRef = useRef({ x: 0, y: 0 });
    const startSizeRef = useRef({ width: 0, height: 0 });

    const drawArrow = useCallback((ctx, fromX, fromY, toX, toY, color) => {
        ctx.beginPath();
        ctx.lineWidth = 5 / zoomLevel;
        ctx.strokeStyle = color;
        const horizontalOffset = 10 / zoomLevel;
        let midX1 = toX > fromX ? fromX + horizontalOffset : fromX - horizontalOffset;
        const midY1 = fromY;
        const midX2 = midX1;
        const midY2 = toY;
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(midX1, midY1);
        ctx.lineTo(midX2, midY2);
        ctx.lineTo(toX, toY);
        const headLength = 6 / zoomLevel;
        let angle;
        if (toX > midX2) angle = 0;
        else if (toX < midX2) angle = Math.PI;
        else if (toY > fromY) angle = Math.PI / 2;
        else angle = -Math.PI / 2;
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(toX, toY);
        ctx.fillStyle = color;
        ctx.stroke();
    }, [zoomLevel]);

    const getRoleForElement = (elementId) => {
        for (const role of MainData) {
            if (!role.ruolo?.nome) continue;
            if (role.liste) {
                for (const list of role.liste) {
                    if (list.listArray.some(item => item.key === elementId)) {
                        return role.ruolo.nome;
                    }
                }
            }
            if (role.azioni) {
                for (const action of role.azioni) {
                    if (action.listArray.some(item => item.key === elementId)) {
                        return role.ruolo.nome;
                    }
                }
            }
            if (role.pulsantiAttivi && Object.keys(role.pulsantiAttivi).includes(elementId)) {
                return role.ruolo.nome;
            }
        }
        return null;
    };

    const drawConnections = useCallback((connections) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        connections.forEach(({ startId, endId, color }) => {
            const startElement = refsMap.current[startId];
            const endElement = refsMap.current[endId];
            if (!startElement || !endElement) return;
            const startRole = getRoleForElement(startId);
            const endRole = getRoleForElement(endId);
            if (collapsedCards[startRole] || collapsedCards[endRole]) return;
            const startRect = startElement.getBoundingClientRect();
            const endRect = endElement.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            let fromX = startRect.left < endRect.left ? startRect.right - canvasRect.left : startRect.left - canvasRect.left;
            const fromY = startRect.top + startRect.height / 2 - canvasRect.top;
            let toX = startRect.left < endRect.left ? endRect.left - canvasRect.left : endRect.right - canvasRect.left;
            const toY = endRect.top + endRect.height / 2 - canvasRect.top;
            drawArrow(ctx, fromX / zoomLevel, fromY / zoomLevel, toX / zoomLevel, toY / zoomLevel, color);
        });
    }, [drawArrow, collapsedCards, zoomLevel]);

    const handleListMouseHover = (listItemKey) => {
        setHoveredList(listItemKey);
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

    const handleStatusMouseHover = (statusItemKey) => {
        setHoveredStatus(statusItemKey);
        setHoveredAction(null);
        setHoveredList(null);
        const workflowIndex = MainData.length - 1;
        const connections = [];
        if (MainData[workflowIndex]?.workflowmapping) {
            MainData[workflowIndex].workflowmapping.forEach((wf) => {
                if (wf.statoDestinazione === statusItemKey) {
                    connections.push({ startId: wf.keyAzione, endId: statusItemKey, color: 'blue' });
                }
            });
        }
        drawConnections(connections);
    };

    const handleActionMouseHover = (actionKey) => {
        setHoveredAction(actionKey);
        setHoveredStatus(null);
        setHoveredList(null);
        const workflowIndex = MainData.length - 1;
        const connections = [];
        if (MainData[workflowIndex]?.workflowmapping) {
            const wf = MainData[workflowIndex].workflowmapping.find((item) => item.keyAzione === actionKey);
            if (wf) {
                if (wf.statoDestinazione) connections.push({
                    startId: actionKey,
                    endId: wf.statoDestinazione,
                    color: 'blue'
                });
                wf.listeDestinazione.forEach((listId) => connections.push({
                    startId: actionKey,
                    endId: listId,
                    color: 'red'
                }));
                wf.doNotlisteDestinazione.forEach((listId) => connections.push({
                    startId: actionKey,
                    endId: listId,
                    color: 'gray'
                }));
            }
        }
        drawConnections(connections);
    };

    const handleMouseLeave = () => {
        if (hoveredList || hoveredStatus || hoveredAction) return;
        const canvas = canvasRef.current;
        if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        setHoveredList(null);
        setHoveredStatus(null);
        setHoveredAction(null);
    };

    const updateCanvasSize = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const maxWidth = Math.max(
            container.scrollWidth,
            ...MainData.map(role => ((role.layout?.left || 0) + (role.layout?.width || 320)) * zoomLevel)
        );
        const maxHeight = Math.max(
            container.scrollHeight,
            ...MainData.map(role => ((role.layout?.top || 0) + (role.layout?.height || 461)) * zoomLevel)
        );

        setCanvasSize(prev => {
            if (prev.width !== maxWidth || prev.height !== maxHeight) {
                return { width: maxWidth, height: maxHeight };
            }
            return prev;
        });
    }, [MainData, zoomLevel]);

    useEffect(() => {
        let hasChanges = false;
        const updatedData = MainData.map((role, index) => {
            if (!role.layout) {
                hasChanges = true;
                return {
                    ...role,
                    layout: {
                        top: index * 30,
                        left: index * 30,
                        width: 320,
                        height: 461,
                    }
                };
            }
            return role;
        });

        if (hasChanges) {
            setEpWorkflowjson(JSON.stringify(updatedData));
        } else {
            updateCanvasSize();
        }
    }, [MainData, setEpWorkflowjson, updateCanvasSize]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvasSize.width;
            canvas.height = canvasSize.height;
        }
    }, [canvasSize]);

    const handleRoleCardDragEnd = (event) => {
        const { delta, active } = event;
        const id = active.id;

        MainData.forEach((role) => {
            if (role.ruolo?.nome === id) {
                const currentLayout = role.layout || { top: 0, left: 0, width: 320, height: 461 };
                let newTop = Math.max(0, parseInt(currentLayout.top) + delta.y / zoomLevel);
                let newLeft = Math.max(0, parseInt(currentLayout.left) + delta.x / zoomLevel);

                role.layout = {
                    ...currentLayout,
                    top: newTop,
                    left: newLeft,
                };
            }
        });
        setEpWorkflowjson(JSON.stringify(MainData));
        updateCanvasSize();
        if (hoveredList || hoveredStatus || hoveredAction) {
            if (hoveredList) handleListMouseHover(hoveredList);
            if (hoveredStatus) handleStatusMouseHover(hoveredStatus);
            if (hoveredAction) handleActionMouseHover(hoveredAction);
        }
    };

    const handleDragEndListItem = (event, facultyName, listTitle) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setEpWorkflowjson(prevJson => {
                const data = [...JSON.parse(prevJson)];
                const facultyIndex = data.findIndex(item => item.ruolo?.nome === facultyName);
                const listIndex = data[facultyIndex].liste.findIndex(list => list.title === listTitle);
                const oldIndex = data[facultyIndex].liste[listIndex].listArray.findIndex(item => item.key === active.id);
                const newIndex = data[facultyIndex].liste[listIndex].listArray.findIndex(item => item.key === over.id);
                data[facultyIndex].liste[listIndex].listArray = arrayMove(data[facultyIndex].liste[listIndex].listArray, oldIndex, newIndex);
                return JSON.stringify(data);
            });
        }
    };

    const handleDragEndActionItem = (event, facultyName, actionTitle) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setEpWorkflowjson(prevJson => {
                const data = [...JSON.parse(prevJson)];
                const facultyIndex = data.findIndex(item => item.ruolo?.nome === facultyName);
                const actionIndex = data[facultyIndex].azioni.findIndex(action => action.title === actionTitle);
                const oldIndex = data[facultyIndex].azioni[actionIndex].listArray.findIndex(item => item.key === active.id);
                const newIndex = data[facultyIndex].azioni[actionIndex].listArray.findIndex(item => item.key === over.id);
                data[facultyIndex].azioni[actionIndex].listArray = arrayMove(data[facultyIndex].azioni[actionIndex].listArray, oldIndex, newIndex);
                return JSON.stringify(data);
            });
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const toggleStatusVisibility = (roleName, status) => {
        setShownStatuses(prev => {
            const newStatuses = { ...prev };
            if (newStatuses[roleName] === status) {
                delete newStatuses[roleName];
            } else {
                newStatuses[roleName] = status;
            }
            return newStatuses;
        });
    };

    const toggleActionVisibility = (roleName, status, actionKey) => {
        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === roleName);
        if (roleIndex === -1) return;
        const role = updatedData[roleIndex];
        if (!role.pulsantiAttivi[status]) {
            role.pulsantiAttivi[status] = {};
        }
        if (role.pulsantiAttivi[status][actionKey]) {
            delete role.pulsantiAttivi[status][actionKey];
        } else {
            role.pulsantiAttivi[status][actionKey] = true;
        }
        setEpWorkflowjson(JSON.stringify(updatedData));
    };

    const openListItemModal = (facultyName, listTitle, listItem = null) => {
        setCurrentFaculty(facultyName);
        setCurrentListTitle(listTitle);
        setSelectedListItem(listItem);
        setListItemModalShow(true);
    };

    const openActionItemModal = (facultyName, actionTitle, actionItem = null) => {
        setCurrentFaculty(facultyName);
        setCurrentActionTitle(actionTitle);
        setSelectedActionItem(actionItem);
        setActionItemModalShow(true);
    };

    const openStatusItemModal = (facultyName, statusItem = null) => {
        setCurrentFaculty(facultyName);
        setSelectedStatusItem(statusItem);
        setStatusItemModalShow(true);
    };

    const openTitleItemModal = (facultyName, type, initialData = null) => {
        setCurrentFaculty(facultyName);
        setTitleModalType(type);
        setSelectedTitle(initialData ? initialData.title : null);
        setTitleItemModalShow(true);
    };

    const openRoleModal = (ruolo = null) => {
        setSelectedRoleItem(ruolo);
        setRoleModalShow(true);
    };

    const getStatusOptions = () => {
        if (!MainData) return [];
        const allStatuses = new Set();
        MainData.forEach((element) => {
            if (element.ruolo && element.pulsantiAttivi) {
                Object.keys(element.pulsantiAttivi).forEach((status) => allStatuses.add(status));
            }
        });
        return Array.from(allStatuses);
    };

    const handleResizeStart = (e, roleName) => {
        e.preventDefault();
        e.stopPropagation();
        resizingRef.current = roleName;
        startPosRef.current = { x: e.clientX, y: e.clientY };
        const role = MainData.find(r => r.ruolo?.nome === roleName);
        startSizeRef.current = {
            width: role.layout?.width || 320,
            height: role.layout?.height || 461
        };
        const sortableCard = document.querySelector(`[data-id="${roleName}"]`);
        if (sortableCard) {
            sortableCard.style.pointerEvents = 'none';
        }
    };

    const handleResize = useCallback((e) => {
        if (!resizingRef.current) return;
        const roleName = resizingRef.current;
        const dx = (e.clientX - startPosRef.current.x) / zoomLevel;
        const dy = (e.clientY - startPosRef.current.y) / zoomLevel;
        const newWidth = Math.max(200, startSizeRef.current.width + dx);
        const newHeight = Math.max(200, startSizeRef.current.height + dy);

        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex(r => r.ruolo?.nome === roleName);
        updatedData[roleIndex].layout = {
            ...updatedData[roleIndex].layout,
            width: newWidth,
            height: newHeight
        };
        setEpWorkflowjson(JSON.stringify(updatedData));
        updateCanvasSize();
    }, [MainData, zoomLevel]);

    const handleResizeEnd = () => {
        if (resizingRef.current) {
            const sortableCard = document.querySelector(`[data-id="${resizingRef.current}"]`);
            if (sortableCard) {
                sortableCard.style.pointerEvents = 'auto';
            }
        }
        resizingRef.current = null;
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleResize);
        window.addEventListener('mouseup', handleResizeEnd);
        return () => {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [handleResize]);

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '100vh', border: "2px solid blue", overflow: 'auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px',
                margin: '10px 0px',
                background: '#f0f0f0',
                borderBottom: '1px solid #ccc',
                borderTop: '1px solid #ccc'
            }}>
                <div>
                    <div className='d-flex justify-content-center rounded cursor-pointer bg-dark text-white mb-3 px-3 py-1' onClick={() => openRoleModal()}>
                        Add New Role
                    </div>
                </div>
                <div>
                    <label htmlFor="zoomInput">Zoom: </label>
                    <select
                        id="zoomDropdown"
                        value={zoomLevel}
                        onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                        style={{ marginLeft: '5px' }}
                    >
                        <option value={0.25}>25%</option>
                        <option value={0.5}>50%</option>
                        <option value={0.75}>75%</option>
                        <option value={1}>100%</option>
                        <option value={1.5}>150%</option>
                        <option value={2}>200%</option>
                    </select>
                </div>
            </div>

            <canvas ref={canvasRef} style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: canvasSize.width,
                height: canvasSize.height,
                zIndex: 1000,
                pointerEvents: 'none',
                border: "1px solid red"
            }} />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleRoleCardDragEnd}>
                <SortableContext items={MainData.map(item => item.ruolo?.nome).filter(Boolean)}
                    strategy={horizontalListSortingStrategy}>
                    <div className='d-flex justify-content-around flex-wrap' style={{ position: 'relative', transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `${100 / zoomLevel}%`, height: `${100 / zoomLevel}%` }}>
                        {MainData?.map((element, index) => {
                            if (element?.ruolo) {
                                const roleName = element.ruolo.nome;
                                const shownStatus = shownStatuses[roleName];
                                const associatedActions = shownStatus ? element.pulsantiAttivi?.[shownStatus] || {} : {};
                                const top = element.layout?.top || 0;
                                const left = element.layout?.left || 0;
                                const width = element.layout?.width || 320;
                                const height = element.layout?.height || 461;

                                return (
                                    <SortableRoleCard
                                        key={roleName}
                                        id={roleName}
                                        index={index}
                                        className='mb-3 px-2 d-flex justify-content-between flex-wrap Editor_Card'
                                        style={{
                                            position: 'absolute',
                                            top: `${top}px`,
                                            left: `${left}px`,
                                            width: `${width}px`,
                                            height: `${height}px`
                                        }}
                                    >
                                        <Card style={{ width: '100%', height: '100%', position: 'relative' }}>
                                            <Card.Header
                                                onDoubleClick={() => {
                                                    setCollapsedCards(prev => ({
                                                        ...prev,
                                                        [roleName]: !prev[roleName]
                                                    }));
                                                }}
                                                onMouseEnter={() => setHoveredRole(roleName)}
                                                onMouseLeave={() => setHoveredRole(null)}
                                                style={{
                                                    position: 'relative',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {element?.ruolo?.nome}
                                                {hoveredRole === roleName && (
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openRoleModal(element?.ruolo);
                                                        }}
                                                        className='cursor-pointer mb-2 ms-2'
                                                    >
                                                        <PencilIcon />
                                                    </span>
                                                )}
                                            </Card.Header>
                                            <Card.Body
                                                style={{ display: collapsedCards[roleName] ? 'none' : 'block', overflow: 'auto' }}>
                                                <div className='d-flex gap-2'>
                                                    <div className='d-flex flex-column'>
                                                        {element?.liste?.map((listeItem) => (
                                                            <div className='d-flex flex-column'
                                                                key={listeItem.title}>
                                                                <span
                                                                    className='listeItemTitle text-center cursor-pointer'>
                                                                    <span
                                                                        onClick={() => openTitleItemModal(element.ruolo.nome, 'liste', { title: listeItem.title })}>
                                                                        {listeItem?.title}{' '}
                                                                    </span>
                                                                    <span className="plus-icon"
                                                                        onClick={() => openListItemModal(element.ruolo.nome, listeItem.title)}>
                                                                        <RoundPlusIcon className='cursor-pointer'
                                                                            height={20} width={20} />
                                                                    </span>
                                                                </span>
                                                                <DndContext sensors={sensors}
                                                                    collisionDetection={closestCenter}
                                                                    onDragEnd={(event) => handleDragEndListItem(event, element.ruolo.nome, listeItem.title)}>
                                                                    <SortableContext
                                                                        items={listeItem.listArray.map(item => item.key)}
                                                                        strategy={verticalListSortingStrategy}>
                                                                        <div className='d-flex flex-column'>
                                                                            {listeItem?.listArray?.map((listArrayItem) => (
                                                                                <SortableItem
                                                                                    key={listArrayItem.key}
                                                                                    id={listArrayItem.key}
                                                                                    className='listeArrayItem'
                                                                                    style={{}}
                                                                                    onMouseEnter={() => handleListMouseHover(listArrayItem?.key)}
                                                                                    onMouseLeave={handleMouseLeave}
                                                                                    onClick={() => openListItemModal(element.ruolo.nome, listeItem.title, listArrayItem)}
                                                                                >
                                                                                    <span
                                                                                        ref={(el) => (refsMap.current[listArrayItem.key] = el)}
                                                                                        id={listArrayItem?.key}>
                                                                                        {listArrayItem?.title}
                                                                                    </span>
                                                                                </SortableItem>
                                                                            ))}
                                                                        </div>
                                                                    </SortableContext>
                                                                </DndContext>
                                                            </div>
                                                        ))}
                                                        <div
                                                            className='bg-dark text-white rounded fs-6 text-center cursor-pointer'
                                                            onClick={() => openTitleItemModal(element.ruolo.nome, 'liste')}
                                                        >
                                                            Add List Title
                                                        </div>
                                                    </div>
                                                    <div className='d-flex flex-column align-items-center'>
                                                        <span className='mb-1 CardStatusTitle text-center'>
                                                            Status{' '}
                                                            <span className="plus-icon"
                                                                onClick={() => openStatusItemModal(element.ruolo.nome)}>
                                                                <RoundPlusIcon className='cursor-pointer' height={20}
                                                                    width={20} />
                                                            </span>
                                                        </span>
                                                        {element?.pulsantiAttivi && Object.keys(element?.pulsantiAttivi)?.map((StatusItem) => (
                                                            <span
                                                                ref={(el) => (refsMap.current[StatusItem] = el)}
                                                                className='StatusItemTitle'
                                                                id={StatusItem}
                                                                onMouseEnter={() => {
                                                                    setHoveredStatus({
                                                                        role: roleName,
                                                                        status: StatusItem
                                                                    });
                                                                    handleStatusMouseHover(StatusItem);
                                                                }}
                                                                onMouseLeave={handleMouseLeave}
                                                                onClick={() => openStatusItemModal(element.ruolo.nome, StatusItem)}
                                                                key={StatusItem}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontWeight: shownStatus === StatusItem ? 'bold' : 'normal'
                                                                }}
                                                            >
                                                                {StatusItem}
                                                                {(hoveredStatus?.role === roleName && hoveredStatus?.status === StatusItem) || shownStatus === StatusItem ? (
                                                                    <span
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleStatusVisibility(roleName, StatusItem);
                                                                        }}
                                                                        style={{
                                                                            marginLeft: '5px',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        {shownStatus === StatusItem ? <ViewOpenEyeIcon /> :
                                                                            <ViewClosedEyeIcon />}
                                                                    </span>
                                                                ) : null}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className='d-flex flex-column'>
                                                        {element?.azioni?.map((azioniItem) => (
                                                            <div className='d-flex flex-column'
                                                                key={azioniItem.title}>
                                                                <span
                                                                    className='azioniItemTitle text-center cursor-pointer'>
                                                                    <span
                                                                        onClick={() => openTitleItemModal(element.ruolo.nome, 'azioni', { title: azioniItem.title })}>
                                                                        {azioniItem?.title}{' '}
                                                                    </span>
                                                                    <span className="plus-icon"
                                                                        onClick={() => openActionItemModal(element.ruolo.nome, azioniItem.title)}>
                                                                        <RoundPlusIcon className='cursor-pointer'
                                                                            height={20} width={20} />
                                                                    </span>
                                                                </span>
                                                                <DndContext sensors={sensors}
                                                                    collisionDetection={closestCenter}
                                                                    onDragEnd={(event) => handleDragEndActionItem(event, element.ruolo.nome, azioniItem.title)}>
                                                                    <SortableContext
                                                                        items={azioniItem.listArray.map(item => item.key)}
                                                                        strategy={verticalListSortingStrategy}>
                                                                        <div className='d-flex flex-column'>
                                                                            {azioniItem?.listArray?.map((azioniArrayItem) => {
                                                                                const isAssociated = shownStatus && associatedActions[azioniArrayItem.key];
                                                                                const isHovered = hoveredAction?.role === roleName && hoveredAction?.actionKey === azioniArrayItem.key;

                                                                                return (
                                                                                    <SortableItem
                                                                                        key={azioniArrayItem.key}
                                                                                        id={azioniArrayItem.key}
                                                                                        className='azioniArrayItem'
                                                                                        style={{
                                                                                            fontWeight: shownStatus && isAssociated ? 'bold' : 'normal',
                                                                                            opacity: shownStatus && !isAssociated ? 0.5 : 1,
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'space-between'
                                                                                        }}
                                                                                        onMouseEnter={() => {
                                                                                            setHoveredAction({
                                                                                                role: roleName,
                                                                                                actionKey: azioniArrayItem.key
                                                                                            });
                                                                                            handleActionMouseHover(azioniArrayItem.key);
                                                                                        }}
                                                                                        onMouseLeave={handleMouseLeave}
                                                                                        onClick={() => openActionItemModal(element.ruolo.nome, azioniItem.title, azioniArrayItem)}
                                                                                    >
                                                                                        <span
                                                                                            ref={(el) => (refsMap.current[azioniArrayItem.key] = el)}
                                                                                            id={azioniArrayItem.key}>
                                                                                            {azioniArrayItem?.title}
                                                                                            {shownStatus && isHovered ? (
                                                                                                <span
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        toggleActionVisibility(roleName, shownStatus, azioniArrayItem.key);
                                                                                                    }}
                                                                                                    style={{
                                                                                                        marginLeft: '5px',
                                                                                                        cursor: 'pointer'
                                                                                                    }}
                                                                                                >
                                                                                                    {isAssociated ?
                                                                                                        <ViewOpenEyeIcon /> :
                                                                                                        <ViewClosedEyeIcon />}
                                                                                                </span>
                                                                                            ) : null}
                                                                                        </span>
                                                                                    </SortableItem>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </SortableContext>
                                                                </DndContext>
                                                            </div>
                                                        ))}
                                                        <div
                                                            className='bg-dark text-white rounded fs-6 text-center cursor-pointer'
                                                            onClick={() => openTitleItemModal(element.ruolo.nome, 'azioni')}
                                                        >
                                                            Add Action Title
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    width: '15px',
                                                    height: '15px',
                                                    background: '#ccc',
                                                    cursor: 'se-resize',
                                                    zIndex: 1001
                                                }}
                                                onMouseDown={(e) => handleResizeStart(e, roleName)}
                                            />
                                        </Card>
                                    </SortableRoleCard>
                                );
                            }
                            return null;
                        })}
                    </div>
                </SortableContext>
            </DndContext>

            <ListItemModal
                show={listItemModalShow}
                handleClose={() => {
                    setListItemModalShow(false);
                    setCurrentFaculty('');
                }}
                MainData={MainData}
                currentFaculty={currentFaculty}
                currentListTitle={currentListTitle}
                selectedListItem={selectedListItem}
                setEpWorkflowjson={setEpWorkflowjson}
                setSelectedListItem={setSelectedListItem}
                setListItemModalShow={setListItemModalShow}
                initialData={selectedListItem}
            />

            <ActionItemModal
                show={actionItemModalShow}
                handleClose={() => {
                    setActionItemModalShow(false);
                    setCurrentFaculty('');
                }}
                MainData={MainData}
                currentFaculty={currentFaculty}
                currentActionTitle={currentActionTitle}
                selectedActionItem={selectedActionItem}
                setEpWorkflowjson={setEpWorkflowjson}
                setSelectedActionItem={setSelectedActionItem}
                setActionItemModalShow={setActionItemModalShow}
                initialData={selectedActionItem}
                statusOptions={getStatusOptions()}
            />
            <StatusModal
                show={statusItemModalShow}
                handleClose={() => {
                    setStatusItemModalShow(false);
                    setCurrentFaculty('');
                }}
                MainData={MainData}
                currentFaculty={currentFaculty}
                selectedStatusItem={selectedStatusItem}
                setEpWorkflowjson={setEpWorkflowjson}
                setSelectedStatusItem={setSelectedStatusItem}
                setStatusItemModalShow={setStatusItemModalShow}
                shownStatuses={shownStatuses}
                setShownStatuses={setShownStatuses}
                initialData={selectedStatusItem ? { status: selectedStatusItem } : null}
            />
            <TitleModal
                show={titleItemModalShow}
                handleClose={() => {
                    setTitleItemModalShow(false);
                    setCurrentFaculty('');
                    setSelectedTitle(null);
                }}
                MainData={MainData}
                currentFaculty={currentFaculty}
                selectedTitle={selectedTitle}
                setEpWorkflowjson={setEpWorkflowjson}
                setSelectedTitle={setSelectedTitle}
                setTitleItemModalShow={setTitleItemModalShow}
                titleModalType={titleModalType}
                initialData={selectedTitle ? { title: selectedTitle } : null}
            />
            <RoleItemModal
                show={roleModalShow}
                initialData={selectedRoleItem ? selectedRoleItem : null}
                handleClose={() => {
                    setRoleModalShow(false);
                    setSelectedRoleItem(null);
                }}
                MainData={MainData}
                selectedRoleItem={selectedRoleItem}
                setEpWorkflowjson={setEpWorkflowjson}
                setSelectedRoleItem={setSelectedRoleItem}
                setRoleModalShow={setRoleModalShow}
                setShownStatuses={setShownStatuses}
            />
        </div>
    );
}

export default View;