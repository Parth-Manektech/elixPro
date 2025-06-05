import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { BlackplusIcon, CardResizer, MinusIcon, RoundPlusIcon, ThreeDotsIcon, ViewClosedEyeIcon, ViewOpenEyeIcon } from '../../Assets/SVGs';
import ListItemModal from '../../Components/editorComponents/Modals/ListItemModal';
import ActionItemModal from '../../Components/editorComponents/Modals/actionItemModal';
import StatusModal from '../../Components/editorComponents/Modals/StatusModal';
import TitleModal from '../../Components/editorComponents/Modals/TitleModal';
import RoleItemModal from '../../Components/editorComponents/Modals/RoleModal';

import { initializeWorkflowMapping } from '../../Components/editorComponents/ViewComponentUtility';
import DeleteConfirmationModal from '../../Components/DeleteConfirmationModal';
import CloneRoleModal from '../../Components/editorComponents/Modals/CloneRoleModal';

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
    const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [draggingItem, setDraggingItem] = useState(null);
    const [collapsedDimensions, setCollapsedDimensions] = useState({});
    const [originalPositions, setOriginalPositions] = useState({});
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [cloneRoleModalShow, setCloneRoleModalShow] = useState(false);
    const [roleToClone, setRoleToClone] = useState(null);

    const [visibleRoles, setVisibleRoles] = useState({});

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const refsMap = useRef({});
    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const resizingRoleRef = useRef(null);
    const dropdownToggleRefs = useRef({});

    const drawArrow = useCallback((ctx, fromX, fromY, toX, toY, color) => {
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = color;
        const horizontalOffset = 10;
        let midX1 = toX > fromX ? fromX + horizontalOffset : fromX - horizontalOffset;
        const midY1 = fromY;
        const midX2 = midX1;
        const midY2 = toY;
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(midX1, midY1);
        ctx.lineTo(midX2, midY2);
        ctx.lineTo(toX, toY);
        const headLength = 6;
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
        // eslint-disable-next-line
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
        ctx.save();
        ctx.scale(zoomLevel, zoomLevel);

        const container = containerRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const scrollLeft = container.scrollLeft;
        const scrollTop = container.scrollTop;

        connections.forEach(({ startId, endId, color }) => {
            const startElement = refsMap.current[startId];
            const endElement = refsMap.current[endId];
            if (!startElement || !endElement) return;

            const startRole = getRoleForElement(startId);
            const endRole = getRoleForElement(endId);
            if (collapsedCards[startRole] || collapsedCards[endRole]) return;

            const startRect = startElement.getBoundingClientRect();
            const endRect = endElement.getBoundingClientRect();

            let fromX = startRect.left < endRect.left
                ? startRect.right - containerRect.left + scrollLeft
                : startRect.left - containerRect.left + scrollLeft;
            const fromY = startRect.top + startRect.height / 2 - containerRect.top + scrollTop;
            let toX = startRect.left < endRect.left
                ? endRect.left - containerRect.left + scrollLeft
                : endRect.right - containerRect.left + scrollLeft;
            const toY = endRect.top + endRect.height / 2 - containerRect.top + scrollTop;

            drawArrow(ctx, fromX / zoomLevel, fromY / zoomLevel, toX / zoomLevel, toY / zoomLevel, color);
        });

        ctx.restore();
        // eslint-disable-next-line
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

    const handleStatusMouseHover = (statusItemKey, roleName) => {
        setHoveredStatus({ role: roleName, status: statusItemKey });
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

    const handleActionMouseHover = (actionKey, roleName) => {
        setHoveredAction({ role: roleName, actionKey });
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
            ...MainData.map((role) => {
                const roleName = role.ruolo?.nome;
                const width = collapsedCards[roleName]
                    ? 350
                    : role.layout?.width || 350;
                return ((role.layout?.left || 0) + width) * zoomLevel;
            })
        );
        const maxHeight = Math.max(
            container.scrollHeight,
            ...MainData.map((role) => {
                const roleName = role.ruolo?.nome;
                const height = collapsedCards[roleName]
                    ? 50
                    : role.layout?.height || 690;
                return ((role.layout?.top || 0) + height) * zoomLevel;
            })
        );

        setCanvasSize((prev) => {
            if (prev.width !== maxWidth || prev.height !== maxHeight) {
                return { width: maxWidth, height: maxHeight };
            }
            return prev;
        });
    }, [MainData, zoomLevel, collapsedCards]);



    useEffect(() => {
        let hasChanges = false;
        const updatedData = MainData.map((role, index) => {
            let updatedRole = { ...role };
            if (!role.layout) {
                hasChanges = true;
                updatedRole = {
                    ...updatedRole,
                    layout: {
                        top: index * 50,
                        left: index * 50,
                        width: 768,
                        height: 637,
                    },
                };
            }
            if (role.ruolo && !role.ruolo.colore) {
                hasChanges = true;
                updatedRole = {
                    ...updatedRole,
                    ruolo: {
                        ...role.ruolo,
                        colore: "#00ccff",
                    },
                };
            }
            return updatedRole;
        });

        if (hasChanges) {
            setEpWorkflowjson(JSON.stringify(updatedData));
        } else {
            // Initialize visibleRoles with all roles set to true
            setVisibleRoles((prev) => {
                const newVisibleRoles = {};
                MainData.forEach((role) => {
                    if (role.ruolo?.nome) {
                        newVisibleRoles[role.ruolo.nome] = prev[role.ruolo.nome] ?? true;
                    }
                });
                return newVisibleRoles;
            });
            updateCanvasSize();
        }
    }, [MainData, setEpWorkflowjson, updateCanvasSize]);



    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvasSize.width * zoomLevel;
            canvas.height = canvasSize.height * zoomLevel;
            canvas.style.width = `${canvasSize.width}px`;
            canvas.style.height = `${canvasSize.height}px`;
            const ctx = canvas.getContext('2d');
            ctx.scale(zoomLevel, zoomLevel);
        }

        return () => {
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', handleResizeStop);
        };
        // eslint-disable-next-line
    }, [canvasSize, zoomLevel]);

    const handleRoleCardDragStart = (e, roleName) => {
        if (e.target.closest('.listeArrayItem, .StatusItemTitle, .azioniArrayItem, .listeItemTitle, .azioniItemTitle, .CardStatusTitle, .plus-icon')) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        setDraggingItem({ type: 'role', roleName });
        e.dataTransfer.setData('roleName', roleName);
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };

        const role = MainData.find(r => r.ruolo?.nome === roleName);
        setOriginalPositions(prev => ({
            ...prev,
            [roleName]: {
                top: role.layout?.top || 0,
                left: role.layout?.left || 0,
                width: role.layout?.width || 350,
                height: role.layout?.height || 690
            }
        }));
    };

    const handleRoleCardDrag = (e) => {
        if (!draggingItem || draggingItem.type !== 'role') return;

        const roleName = draggingItem.roleName;

        if (e.clientX === 0 && e.clientY === 0) return;

        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex(r => r.ruolo?.nome === roleName);
        const currentLayout = updatedData[roleIndex].layout || { top: 0, left: 0, width: 350, height: 690 };

        const deltaX = (e.clientX - dragStartPosRef.current.x) / zoomLevel;
        const deltaY = (e.clientY - dragStartPosRef.current.y) / zoomLevel;

        let newTop = Math.max(0, parseInt(currentLayout.top) + deltaY);
        let newLeft = Math.max(0, parseInt(currentLayout.left) + deltaX);

        updatedData[roleIndex].layout = {
            ...currentLayout,
            top: newTop,
            left: newLeft,
        };

        setEpWorkflowjson(JSON.stringify(updatedData));
        updateCanvasSize();
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleRoleCardDrop = (e, roleName) => {
        e.preventDefault();
        if (!draggingItem || draggingItem.type !== 'role') return;

        console.log('Drag Drop:', { roleName, clientX: e.clientX, clientY: e.clientY });

        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex(r => r.ruolo?.nome === roleName);
        const currentLayout = updatedData[roleIndex].layout;
        const original = originalPositions[roleName];

        if (original && Math.abs(currentLayout.top - original.top) < 10 && Math.abs(currentLayout.left - original.left) < 10) {
            console.log('Restoring original position and dimensions:', { roleName, original });
            updatedData[roleIndex].layout = {
                ...currentLayout,
                top: original.top,
                left: original.left,
                width: original.width,
                height: original.height
            };
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setDraggingItem(null);
        setOriginalPositions(prev => {
            const newPositions = { ...prev };
            delete newPositions[roleName];
            return newPositions;
        });
        updateCanvasSize();

        if (hoveredList) handleListMouseHover(hoveredList);
        if (hoveredStatus) handleStatusMouseHover(hoveredStatus.status, hoveredStatus.role);
        if (hoveredAction) handleActionMouseHover(hoveredAction.actionKey, hoveredAction.role);
    };

    const handleRoleCardDragOver = (e) => {
        e.preventDefault();
    };

    const handleListItemDragStart = (e, facultyName, listTitle, itemKey) => {
        setDraggingItem({ type: 'list', facultyName, listTitle, itemKey });
        e.dataTransfer.setData('text/plain', JSON.stringify({ itemKey, facultyName, listTitle }));
        e.stopPropagation();
    };

    const handleListItemDragOver = (e) => {
        e.preventDefault();
    };

    const handleListItemDrop = (e, facultyName, listTitle, targetKey) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggingItem || draggingItem.type !== 'list') return;

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const sourceKey = data.itemKey;
            const sourceFaculty = data.facultyName;
            const sourceListTitle = data.listTitle;

            if (sourceKey === targetKey || sourceFaculty !== facultyName || sourceListTitle !== listTitle) {
                setDraggingItem(null);
                return;
            }

            setEpWorkflowjson(prevJson => {
                const data = JSON.parse(prevJson);
                const facultyIndex = data.findIndex(item => item.ruolo?.nome === facultyName);
                if (facultyIndex === -1) {
                    console.error('Faculty not found:', facultyName);
                    return prevJson;
                }
                const listIndex = data[facultyIndex].liste?.findIndex(list => list.title === listTitle);
                if (listIndex === -1) {
                    console.error('List not found:', listTitle);
                    return prevJson;
                }
                const listArray = [...(data[facultyIndex].liste[listIndex].listArray || [])];
                const oldIndex = listArray.findIndex(item => item.key === sourceKey);
                const newIndex = listArray.findIndex(item => item.key === targetKey);

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
    };

    const handleActionItemDragStart = (e, facultyName, actionTitle, itemKey) => {
        setDraggingItem({ type: 'action', facultyName, actionTitle, itemKey });
        e.dataTransfer.setData('text/plain', JSON.stringify({ itemKey, facultyName, actionTitle }));
        e.stopPropagation();
    };

    const handleActionItemDragOver = (e) => {
        e.preventDefault();
    };

    const handleActionItemDrop = (e, facultyName, actionTitle, targetKey) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggingItem || draggingItem.type !== 'action') return;

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const sourceKey = data.itemKey;
            const sourceFaculty = data.facultyName;
            const sourceActionTitle = data.actionTitle;

            if (sourceKey === targetKey || sourceFaculty !== facultyName || sourceActionTitle !== actionTitle) {
                setDraggingItem(null);
                return;
            }

            setEpWorkflowjson(prevJson => {
                const data = JSON.parse(prevJson);
                const facultyIndex = data.findIndex(item => item.ruolo?.nome === facultyName);
                if (facultyIndex === -1) {
                    console.error('Faculty not found:', facultyName);
                    return prevJson;
                }
                const actionIndex = data[facultyIndex].azioni?.findIndex(action => action.title === actionTitle);
                if (actionIndex === -1) {
                    console.error('Action not found:', actionTitle);
                    return prevJson;
                }
                const actionArray = [...(data[facultyIndex].azioni[actionIndex].listArray || [])];
                const oldIndex = actionArray.findIndex(item => item.key === sourceKey);
                const newIndex = actionArray.findIndex(item => item.key === targetKey);

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
    };

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

    const handleDeleteRole = (roleName) => {
        console.log('Deleting role:', roleName);
        const updatedData = initializeWorkflowMapping([...MainData]);
        const workflowIndex = updatedData.length - 1;

        const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === roleName);
        if (roleIndex === -1) {
            console.error('Role not found:', roleName);
            return;
        }

        const listKeys = [];
        const actionKeys = [];
        const statusKeys = [];

        const role = updatedData[roleIndex];
        if (role.liste) {
            role.liste.forEach(list => {
                list.listArray.forEach(item => {
                    listKeys.push(item.key);
                });
            });
        }
        if (role.azioni) {
            role.azioni.forEach(action => {
                action.listArray.forEach(item => {
                    actionKeys.push(item.key);
                });
            });
        }
        if (role.pulsantiAttivi) {
            statusKeys.push(...Object.keys(role.pulsantiAttivi));
        }

        updatedData[workflowIndex].workflowmapping = updatedData[workflowIndex].workflowmapping.filter(
            (wf) => !actionKeys.includes(wf.keyAzione)
        );
        updatedData[workflowIndex].workflowmapping.forEach((wf) => {
            wf.listeDestinazione = wf.listeDestinazione.filter(key => !listKeys.includes(key));
            wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.filter(key => !listKeys.includes(key));
            if (statusKeys.includes(wf.statoDestinazione)) {
                wf.statoDestinazione = null;
            }
        });

        updatedData.forEach((faculty, index) => {
            if (faculty.azioni) {
                faculty.azioni.forEach(action => {
                    action.listArray.forEach(item => {
                        if (item.moveToList) {
                            const moveToListKeys = item.moveToList.split(',').map(key => key.trim());
                            item.moveToList = moveToListKeys.filter(key => !listKeys.includes(key)).join(', ');
                        }
                        if (item.doNotMoveToList) {
                            const doNotMoveToListKeys = item.doNotMoveToList.split(',').map(key => key.trim());
                            item.doNotMoveToList = doNotMoveToListKeys.filter(key => !listKeys.includes(key)).join(', ');
                        }
                    });
                });
            }
        });

        setShownStatuses(prev => {
            const newStatuses = { ...prev };
            delete newStatuses[roleName];
            return newStatuses;
        });

        updatedData.splice(roleIndex, 1);

        setEpWorkflowjson(JSON.stringify(updatedData));
        setCollapsedCards(prev => {
            const newCollapsed = { ...prev };
            delete newCollapsed[roleName];
            return newCollapsed;
        });
        setCollapsedDimensions(prev => {
            const newDims = { ...prev };
            delete newDims[roleName];
            return newDims;
        });
        updateCanvasSize();
    };

    const handleCloneRole = (role) => {
        setRoleToClone(role);
        setCloneRoleModalShow(true);
    };

    const handleCloneRoleSubmit = ({ nome, key: newKey }) => {
        if (!roleToClone) {
            console.error('No role to clone');
            return;
        }

        const updatedData = initializeWorkflowMapping([...MainData]);
        const workflowIndex = updatedData.length - 1;
        const originalRole = updatedData.find(r => r.ruolo?.nome === roleToClone.ruolo.nome);
        if (!originalRole) {
            console.error('Original role not found:', roleToClone.ruolo.nome);
            return;
        }

        const oldKey = originalRole.ruolo.key;
        if (!oldKey) {
            console.error('Original role has no key:', originalRole.ruolo.nome);
            return;
        }

        // Check if newKey or nome is already used
        if (updatedData.some(r => r.ruolo?.key === newKey)) {
            alert('Key already exists. Please choose a unique key.');
            return;
        }
        if (updatedData.some(r => r.ruolo?.nome === nome)) {
            alert('Role name already exists. Please choose a unique name.');
            return;
        }

        // Helper function to replace oldKey with newKey in a string
        const replaceKeyInString = (str) => {
            if (!str || typeof str !== 'string') return str;
            // Replace oldKey with newKey in composite keys (e.g., __facDes)
            const regex = new RegExp(`(^|__)${oldKey}($|__)`, 'g');
            return str.replace(regex, `$1${newKey}$2`);
        };

        // Clone ruolo
        const clonedRole = {
            ...originalRole,
            ruolo: {
                ...originalRole.ruolo,
                nome: nome,
                descrizione: nome,
                key: newKey,
                listaDefault: replaceKeyInString(originalRole.ruolo.listaDefault)
            },
            // Deep clone liste with key replacement
            liste: originalRole.liste.map(list => ({
                ...list,
                listArray: list.listArray.map(item => ({
                    ...item,
                    key: replaceKeyInString(item.key)
                }))
            })),
            // Clone sezioni with key replacement
            sezioni: replaceKeyInString(originalRole.sezioni),
            // Clone procedimentoTag (unchanged)
            procedimentoTag: originalRole.procedimentoTag,
            // Deep clone azioni with key replacement
            azioni: originalRole.azioni.map(action => ({
                ...action,
                listArray: action.listArray.map(item => ({
                    ...item,
                    key: replaceKeyInString(item.key),
                    status: replaceKeyInString(item.status),
                    moveToList: replaceKeyInString(item.moveToList),
                    doNotMoveToList: replaceKeyInString(item.doNotMoveToList)
                }))
            })),
            // Deep clone pulsantiAttivi with key replacement
            pulsantiAttivi: Object.fromEntries(
                Object.entries(originalRole.pulsantiAttivi || {}).map(([status, actions]) => [
                    replaceKeyInString(status),
                    Object.fromEntries(
                        Object.entries(actions).map(([actionKey, value]) => [
                            replaceKeyInString(actionKey),
                            value
                        ])
                    )
                ])
            ),
            // Clone layout
            layout: {
                top: (originalRole.layout?.top || 0) + 50,
                left: (originalRole.layout?.left || 0) + 50,
                width: originalRole.layout?.width || 350,
                height: originalRole.layout?.height || 690
            }
        };

        // Clone workflowmapping with new entries and deduplicate
        const newWorkflowMapping = [];
        const seenKeys = new Set();
        if (updatedData[workflowIndex].workflowmapping) {
            updatedData[workflowIndex].workflowmapping.forEach(wf => {
                if (
                    wf.keyAzione.includes(oldKey) ||
                    wf.statoDestinazione?.includes(oldKey) ||
                    wf.listeDestinazione.some(key => key.includes(oldKey)) ||
                    wf.doNotlisteDestinazione.some(key => key.includes(oldKey))
                ) {
                    const newWf = {
                        ...wf,
                        keyAzione: replaceKeyInString(wf.keyAzione),
                        statoDestinazione: replaceKeyInString(wf.statoDestinazione),
                        listeDestinazione: wf.listeDestinazione.map(key => replaceKeyInString(key)),
                        doNotlisteDestinazione: wf.doNotlisteDestinazione.map(key => replaceKeyInString(key))
                    };
                    // Deduplicate by keyAzione
                    if (!seenKeys.has(newWf.keyAzione)) {
                        newWorkflowMapping.push(newWf);
                        seenKeys.add(newWf.keyAzione);
                    }
                }
            });
            // Append new mappings, preserving existing ones
            updatedData[workflowIndex].workflowmapping.push(...newWorkflowMapping);
        }

        // Add cloned role before workflowmapping
        updatedData.splice(workflowIndex, 0, clonedRole);
        setEpWorkflowjson(JSON.stringify(updatedData));
        setCloneRoleModalShow(false);
        setRoleToClone(null);
        updateCanvasSize();
    };


    // resize Card 
    const handleResizeStart = (e, roleName) => {
        if (!e.target.closest('.resize-handle')) {
            console.warn('Resize start aborted: Not a resize handle', e.target);
            return;
        }

        e.preventDefault();
        e.stopPropagation();



        resizingRoleRef.current = roleName;
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };

        const role = MainData.find(r => r.ruolo?.nome === roleName);
        if (!role) {
            console.error('Role not found:', roleName);
            resizingRoleRef.current = null;
            return;
        }

        setOriginalPositions(prev => ({
            ...prev,
            [roleName]: {
                top: role.layout?.top || 0,
                left: role.layout?.left || 0,
                width: role.layout?.width || 350,
                height: role.layout?.height || 690
            }
        }));

        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeStop);

        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', handleResizeStop);
    };

    const handleResize = (e) => {
        if (!resizingRoleRef.current) {
            console.warn('Resize aborted: No resizing role');
            document.removeEventListener('mousemove', handleResize);
            return;
        }

        if (!dragStartPosRef.current) {
            console.warn('Resize aborted: No drag start position');
            return;
        }

        if (e.clientX === 0 && e.clientY === 0) {
            console.warn('Invalid mouse event:', { clientX: e.clientX, clientY: e.clientY });
            return;
        }

        const roleName = resizingRoleRef.current;


        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex(r => r.ruolo?.nome === roleName);
        if (roleIndex === -1) {
            console.error('Role not found during resize:', roleName);
            resizingRoleRef.current = null;
            return;
        }

        const currentLayout = updatedData[roleIndex].layout || { top: 0, left: 0, width: 350, height: 690 };

        const deltaX = (e.clientX - dragStartPosRef.current.x) / zoomLevel;
        const deltaY = (e.clientY - dragStartPosRef.current.y) / zoomLevel;

        const newWidth = Math.max(200, currentLayout.width + deltaX);
        const newHeight = Math.max(200, currentLayout.height + deltaY);

        updatedData[roleIndex].layout = {
            ...currentLayout,
            width: newWidth,
            height: newHeight,
        };

        setEpWorkflowjson(JSON.stringify(updatedData));
        updateCanvasSize();
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResizeStop = () => {
        console.log('Resize Stop:', { resizingRole: resizingRoleRef.current });

        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeStop);

        if (!resizingRoleRef.current) {
            console.warn('Resize stop called with no resizing role');
            return;
        }

        resizingRoleRef.current = null;

        updateCanvasSize();

        if (hoveredList) handleListMouseHover(hoveredList);
        if (hoveredStatus) handleStatusMouseHover(hoveredStatus.status, hoveredStatus.role);
        if (hoveredAction) handleActionMouseHover(hoveredAction.actionKey, hoveredAction.role);
    };


    useEffect(() => {
        Object.entries(collapsedCards).forEach(([roleName, isCollapsed]) => {
            console.log(`Collapse State: ${roleName}`, {
                isCollapsed,
                dimensions: collapsedDimensions[roleName] || { width: "N/A", height: "N/A" },
            });
        });
    }, [collapsedCards, collapsedDimensions]);

    return (
        <>
            <div className='toolbar'>
                <div>
                    <div className='d-flex justify-content-center rounded cursor-pointer bg-dark text-white px-3 py-1' onClick={() => openRoleModal()}>
                        Add New Role
                    </div>
                </div>

                <div >
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

                <div>
                    <Dropdown >
                        <Dropdown.Toggle variant="dark" id="filter-roles-dropdown">
                            Filtra ruoli
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {MainData.map((element) => (
                                element.ruolo?.nome && (
                                    <Dropdown.Item
                                        key={element.ruolo.nome}
                                        as="div"
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ display: 'flex', alignItems: 'center', padding: '5px 10px' }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={visibleRoles[element.ruolo.nome] ?? true}
                                            onChange={() => {
                                                setVisibleRoles((prev) => ({
                                                    ...prev,
                                                    [element.ruolo.nome]: !prev[element.ruolo.nome],
                                                }));
                                            }}
                                            style={{ marginRight: '8px' }}
                                        />
                                        {element.ruolo.nome}
                                    </Dropdown.Item>
                                )
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

            </div>
            <div ref={containerRef} className='editor-visualization' style={{ position: 'relative', width: '100%', overflow: 'auto', backgroundColor: '#D6D6D6' }}>


                <canvas ref={canvasRef} style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1000,
                    pointerEvents: 'none',
                    // border: '1px solid red'
                }} />

                <div className='d-flex justify-content-around flex-wrap' style={{
                    position: 'relative',
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'top left',
                    width: `${100 / zoomLevel}%`,
                    height: `${100 / zoomLevel}%`
                }}>
                    {MainData?.map((element) => {

                        if (element?.ruolo && visibleRoles[element.ruolo.nome]) {
                            const roleName = element.ruolo.nome;
                            const shownStatus = shownStatuses[roleName];
                            const associatedActions = shownStatus ? element.pulsantiAttivi?.[shownStatus] || {} : {};
                            const top = element.layout?.top || 0;
                            const left = element.layout?.left || 0;
                            const width = element.layout?.width || 350;
                            // const height = element.layout?.height || 690;

                            return (
                                <div
                                    key={roleName}
                                    draggable
                                    onDragStart={(e) => handleRoleCardDragStart(e, roleName)}
                                    onDrag={(e) => handleRoleCardDrag(e)}
                                    onDragEnd={(e) => handleRoleCardDrop(e, roleName)}
                                    onDragOver={handleRoleCardDragOver}
                                    className="mb-3 d-flex justify-content-between flex-wrap Editor_Card"
                                    style={{
                                        position: "absolute",
                                        top: `${top}px`,
                                        left: `${left}px`,
                                        width: collapsedCards[roleName]
                                            ? `${width}px`
                                            : `${width}px`,
                                        height: collapsedCards[roleName] ? "fit-content" : "fit-content",
                                        opacity: 1,
                                        background:
                                            draggingItem?.type === "role" && draggingItem?.roleName === roleName
                                                ? "#f0f0f0"
                                                : "white",
                                    }}
                                >
                                    <Card style={{ width: '100%', height: '100%', position: 'relative' }}>
                                        <Card.Header
                                            style={{
                                                position: 'relative',
                                                cursor: 'move',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                backgroundColor: element.ruolo?.colore || '#6f42c1',
                                            }}
                                        >
                                            <span>
                                                <input
                                                    type="color"
                                                    value={element.ruolo?.colore || '#6f42c1'}
                                                    onChange={(e) => {
                                                        const updatedData = [...MainData];
                                                        const roleIndex = updatedData.findIndex((r) => r.ruolo?.nome === roleName);
                                                        if (roleIndex !== -1) {
                                                            updatedData[roleIndex] = {
                                                                ...updatedData[roleIndex],
                                                                ruolo: {
                                                                    ...updatedData[roleIndex].ruolo,
                                                                    colore: e.target.value,
                                                                },
                                                            };
                                                            setEpWorkflowjson(JSON.stringify(updatedData));
                                                        }
                                                    }}
                                                    style={{ width: '20px', height: '20px', padding: 0, border: 'none', cursor: 'pointer' }}
                                                />
                                            </span>

                                            {element?.ruolo?.nome}

                                            <div className='d-flex gap-2'>

                                                <span>
                                                    <Dropdown>
                                                        <Dropdown.Toggle
                                                            className='role_menu'
                                                            ref={(el) => (dropdownToggleRefs.current[roleName] = el)}
                                                        >
                                                            <ThreeDotsIcon height={20} width={20} />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openRoleModal(element?.ruolo);
                                                                    dropdownToggleRefs.current[roleName]?.click();
                                                                }}
                                                            >
                                                                Edit
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setRoleToDelete(roleName);
                                                                    setShowDeleteConfirmation(true);
                                                                    dropdownToggleRefs.current[roleName]?.click();
                                                                }}
                                                            >
                                                                Delete
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCloneRole(element);
                                                                    dropdownToggleRefs.current[roleName]?.click();
                                                                }}
                                                            >
                                                                Clone
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </span>
                                                <span
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        setCollapsedCards((prev) => {
                                                            const isCollapsed = !prev[roleName];
                                                            if (isCollapsed) {
                                                                setCollapsedDimensions((prevDims) => ({
                                                                    ...prevDims,
                                                                    [roleName]: {
                                                                        width: element.layout?.width || 350,
                                                                        height: element.layout?.height || 690,
                                                                    },
                                                                }));
                                                            } else {
                                                                setCollapsedDimensions((prevDims) => {
                                                                    const newDims = { ...prevDims };
                                                                    delete newDims[roleName];
                                                                    return newDims;
                                                                });
                                                            }
                                                            return {
                                                                ...prev,
                                                                [roleName]: isCollapsed,
                                                            };
                                                        });
                                                    }}
                                                >
                                                    {collapsedCards[roleName] ? (
                                                        <BlackplusIcon height={20} width={20} />
                                                    ) : (
                                                        <MinusIcon height={20} width={20} />
                                                    )}
                                                </span>
                                            </div>
                                        </Card.Header>
                                        <Card.Body
                                            style={{ display: collapsedCards[roleName] ? "none" : "block", overflow: "auto" }}
                                        >
                                            <div className='d-flex gap-2'>
                                                <div className='d-flex flex-column gap-2'>
                                                    {element?.liste?.map((listeItem) => (
                                                        <div className='d-flex flex-column' key={listeItem.title}>
                                                            <span className='listeItemTitle text-center cursor-pointer'>
                                                                <span
                                                                    onClick={() => openTitleItemModal(element.ruolo.nome, 'liste', { title: listeItem.title })}
                                                                >
                                                                    {listeItem?.title}{' '}
                                                                </span>
                                                                <span className="plus-icon"
                                                                    onClick={() => openListItemModal(element.ruolo.nome, listeItem.title)}
                                                                >
                                                                    <RoundPlusIcon className='cursor-pointer' height={20} width={20} />
                                                                </span>
                                                            </span>
                                                            <div className='d-flex flex-column' >
                                                                {listeItem?.listArray?.map((listArrayItem) => (
                                                                    <div
                                                                        key={listArrayItem.key}
                                                                        draggable
                                                                        onDragStart={(e) => handleListItemDragStart(e, element.ruolo.nome, listeItem.title, listArrayItem.key)}
                                                                        onDragOver={handleListItemDragOver}
                                                                        onDrop={(e) => handleListItemDrop(e, element.ruolo.nome, listeItem.title, listArrayItem.key)}
                                                                        className='listeArrayItem'
                                                                        style={{
                                                                            cursor: 'grab',
                                                                            padding: '5px',
                                                                            background: draggingItem?.type === 'list' && draggingItem?.itemKey === listArrayItem.key ? '#e0e0e0' : 'transparent'
                                                                        }}
                                                                        onMouseEnter={() => handleListMouseHover(listArrayItem?.key)}
                                                                        onMouseLeave={handleMouseLeave}
                                                                        onClick={() => openListItemModal(element.ruolo.nome, listeItem.title, listArrayItem)}
                                                                    >
                                                                        <span
                                                                            ref={(el) => (refsMap.current[listArrayItem.key] = el)}
                                                                            id={listArrayItem?.key}
                                                                        >
                                                                            {listArrayItem?.title}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
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
                                                            onClick={() => openStatusItemModal(element.ruolo.nome)}
                                                        >
                                                            <RoundPlusIcon className='cursor-pointer' height={20} width={20} />
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
                                                                handleStatusMouseHover(StatusItem, roleName);
                                                            }}
                                                            onMouseLeave={handleMouseLeave}
                                                            onClick={() => openStatusItemModal(element.ruolo.nome, StatusItem)}
                                                            key={StatusItem}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: shownStatus === StatusItem ? 'bold' : 'normal',
                                                                cursor: 'pointer',
                                                                padding: '5px',
                                                                margin: '2px 0'
                                                            }}
                                                        >
                                                            {StatusItem}
                                                            {hoveredStatus?.role === roleName && hoveredStatus?.status === StatusItem ? (
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
                                                                    {shownStatus === StatusItem ? <ViewOpenEyeIcon /> : <ViewClosedEyeIcon />}
                                                                </span>
                                                            ) : null}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className='d-flex flex-column gap-2'>
                                                    {element?.azioni?.map((azioniItem) => (
                                                        <div className='d-flex flex-column' key={azioniItem.title}>
                                                            <span className='azioniItemTitle text-center cursor-pointer'>
                                                                <span
                                                                    onClick={() => openTitleItemModal(element.ruolo.nome, 'azioni', { title: azioniItem.title })}
                                                                >
                                                                    {azioniItem?.title}{' '}
                                                                </span>
                                                                <span className="plus-icon"
                                                                    onClick={() => openActionItemModal(element.ruolo.nome, azioniItem.title)}
                                                                >
                                                                    <RoundPlusIcon className='cursor-pointer' height={20} width={20} />
                                                                </span>
                                                            </span>
                                                            <div className='d-flex flex-column'>
                                                                {azioniItem?.listArray?.map((azioniArrayItem) => {
                                                                    const isAssociated = shownStatus && associatedActions[azioniArrayItem.key];
                                                                    return (
                                                                        <div
                                                                            key={azioniArrayItem.key}
                                                                            draggable
                                                                            onDragStart={(e) => handleActionItemDragStart(e, element.ruolo.nome, azioniItem.title, azioniArrayItem.key)}
                                                                            onDragOver={handleActionItemDragOver}
                                                                            onDrop={(e) => handleActionItemDrop(e, element.ruolo.nome, azioniItem.title, azioniArrayItem.key)}
                                                                            className='azioniArrayItem'
                                                                            style={{
                                                                                fontWeight: shownStatus && isAssociated ? 'bold' : 'normal',
                                                                                opacity: shownStatus && !isAssociated ? 0.5 : 1,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'space-between',
                                                                                cursor: 'grab',
                                                                                padding: '5px',
                                                                                background: draggingItem?.type === 'action' && draggingItem?.itemKey === azioniArrayItem.key ? '#e0e0e0' : 'transparent'
                                                                            }}
                                                                            onMouseEnter={() => {
                                                                                setHoveredAction({
                                                                                    role: roleName,
                                                                                    actionKey: azioniArrayItem.key
                                                                                });
                                                                                handleActionMouseHover(azioniArrayItem.key, roleName);
                                                                            }}
                                                                            onMouseLeave={handleMouseLeave}
                                                                            onClick={() => openActionItemModal(element.ruolo.nome, azioniItem.title, azioniArrayItem)}
                                                                        >
                                                                            <span
                                                                                ref={(el) => (refsMap.current[azioniArrayItem.key] = el)}
                                                                                id={azioniArrayItem.key}
                                                                            >
                                                                                {azioniArrayItem?.title}
                                                                                {shownStatus && hoveredAction?.role === roleName && hoveredAction?.actionKey === azioniArrayItem.key ? (
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
                                                                                        {isAssociated ? <ViewOpenEyeIcon /> : <ViewClosedEyeIcon />}
                                                                                    </span>
                                                                                ) : null}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
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
                                        {!collapsedCards[roleName] && (
                                            <div
                                                className="resize-handle"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log("Mouse Down on Resize Handle:", {
                                                        roleName,
                                                        clientX: e.clientX,
                                                        clientY: e.clientY,
                                                    });
                                                    handleResizeStart(e, roleName);
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    bottom: 0,
                                                    right: 0,
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    width: "20px",
                                                    height: "20px",
                                                    background: "#fff",
                                                    cursor: "se-resize",
                                                }}
                                            >
                                                <CardResizer height={20} width={20} />
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>

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
                <CloneRoleModal
                    show={cloneRoleModalShow}
                    handleClose={() => {
                        setCloneRoleModalShow(false);
                        setRoleToClone(null);
                    }}
                    onClone={handleCloneRoleSubmit}
                    initialNome={roleToClone?.ruolo?.nome || ''}
                />

                <DeleteConfirmationModal
                    show={showDeleteConfirmation}
                    handleClose={() => {
                        setShowDeleteConfirmation(false);
                        setRoleToDelete(null);
                    }}
                    handleConfirm={() => {
                        if (roleToDelete) {
                            handleDeleteRole(roleToDelete);
                        }
                        setShowDeleteConfirmation(false);
                        setRoleToDelete(null);
                    }}
                    itemType="role"
                />
            </div>
        </>

    );
}

export default View;