import React, { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { Card, Col } from 'react-bootstrap';
import { RoundPlusIcon } from '../../Assets/SVGs';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ListItemModal from '../../Components/editorComponents/Modals/ListItemModal';
import ActionItemModal from '../../Components/editorComponents/Modals/actionItemModal';
import StatusModal from '../../Components/editorComponents/Modals/StatusModal';
import TitleModal from '../../Components/editorComponents/Modals/TitleModal';
import RoleItemModal from '../../Components/editorComponents/Modals/RoleModal';

// SVG icons for open and closed eye
const ClosedEyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <path d="M3 3l18 18" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height={20} width={20} viewBox="0 0 512 512" >
        <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0l-30.1 30 97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2l-18.7-18.6zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5l167.3-167.4-98-98-167.3 167.4zM96 64c-53 0-96 43-96 96v256c0 53 43 96 96 96h256c53 0 96-43 96-96v-96c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z" />
    </svg>
);

const OpenEyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

// Sortable Item Component for Role Cards
const SortableRoleCard = ({ id, children, className, style }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const styleWithTransform = {
        ...style,
        transform: CSS.Transform.toString(transform),
        transition: transition || 'none',
    };

    return (
        <Col
            ref={setNodeRef}
            className={className}
            style={styleWithTransform}
            {...attributes}
            {...listeners}
        >
            {children}
        </Col>
    );
};

// Sortable Item Component for List/Action Items
const SortableItem = ({ id, children, className, style, onMouseEnter, onMouseLeave, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const styleWithTransform = {
        ...style,
        transform: CSS.Transform.toString(transform),
        transition: transition || 'none',
        cursor: 'grab',
    };

    // Prevent drag events from interfering with click and hover
    const handleMouseDown = (e) => {
        e.stopPropagation();
        listeners?.onMouseDown?.(e);
    };

    return (
        <span
            ref={setNodeRef}
            className={className}
            style={styleWithTransform}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            {...attributes}
            {...listeners}
            onMouseDown={handleMouseDown}
        >
            {children}
        </span>
    );
};

function View({ epWorkflowjson, setEpWorkflowjson }) {
    // eslint-disable-next-line
    const MainData = epWorkflowjson ? JSON.parse(epWorkflowjson) : [];

    const DEFAULT_ROLE_WIDTH = 320;

    const containerRef = useRef(null);
    const initialRoles = containerRef.current ? Math.max(1, Math.floor((containerRef.current.offsetWidth || window.innerWidth) / DEFAULT_ROLE_WIDTH)) : 1;

    const [initialRolesInRow, setInitialRolesInRow] = useState(initialRoles);
    const [maxRolesInRow, setMaxRolesInRow] = useState(initialRoles);
    const [currentRolesInRow, setCurrentRolesInRow] = useState(initialRoles);
    const [zoom, setZoom] = useState(1);

    const [shownStatuses, setShownStatuses] = useState({});
    const [hoveredStatus, setHoveredStatus] = useState(null);
    const [hoveredAction, setHoveredAction] = useState(null);

    const [listItemModalShow, setListItemModalShow] = useState(false);
    const [actionItemModalShow, setActionItemModalShow] = useState(false);
    const [statusItemModalShow, setStatusItemModalShow] = useState(false);
    const [titleItemModalShow, setTitleItemModalShow] = useState(false);
    const [roleModalShow, setRoleModalShow] = useState(false);
    const [titleModalType, setTitleModalType] = useState('');
    const [currentFaculty, setCurrentFaculty] = useState('');

    const [activeConnections, setActiveConnections] = useState([]);
    const [selectedListItem, setSelectedListItem] = useState(null);
    const [selectedActionItem, setSelectedActionItem] = useState(null);
    const [selectedStatusItem, setSelectedStatusItem] = useState(null);
    const [selectedRoleItem, setSelectedRoleItem] = useState(null);
    const [currentListTitle, setCurrentListTitle] = useState('');
    const [currentActionTitle, setCurrentActionTitle] = useState('');
    const [selectedTitle, setSelectedTitle] = useState(null);

    const [collapsedCards, setCollapsedCards] = useState({});
    const [hoveredRole, setHoveredRole] = useState(null);

    const canvasRef = useRef(null);
    const refsMap = useRef({});

    const initializeWorkflowMapping = (data) => {
        if (!data.some(item => item.hasOwnProperty('workflowmapping'))) {
            data.push({ workflowmapping: [] });
        }
        return data;
    };

    const calculateRolesInRow = useCallback(() => {
        if (!containerRef.current) return initialRoles;
        const containerWidth = containerRef.current.offsetWidth;
        const roleWidth = DEFAULT_ROLE_WIDTH * zoom;
        const calculatedRoles = Math.max(1, Math.floor(containerWidth / roleWidth));
        return calculatedRoles;
    }, [zoom, initialRoles]);

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
    }, []);

    const drawConnections = useCallback((connections) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        connections.forEach(({ startId, endId, color }) => {
            const startElement = refsMap.current[startId];
            const endElement = refsMap.current[endId];
            if (startElement && endElement) {
                const startRect = startElement.getBoundingClientRect();
                const endRect = endElement.getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();
                let fromX = startRect.left < endRect.left ? startRect.right - canvasRect.left - 5 : startRect.left - canvasRect.left + 5;
                const fromY = startRect.top + startRect.height / 2 - canvasRect.top;
                let toX = startRect.left < endRect.left ? endRect.left - canvasRect.left + 15 : endRect.right - canvasRect.left - 15;
                const toY = endRect.top + endRect.height / 2 - canvasRect.top;
                drawArrow(ctx, fromX, fromY, toX, toY, color);
            }
        });
    }, [canvasRef, drawArrow]);

    const handleListMouseHover = (listItemKey) => {
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
        setActiveConnections(connections);
        drawConnections(connections);
    };

    const handleStatusMouseHover = (statusItemKey) => {
        const workflowIndex = MainData.length - 1;
        const connections = [];
        if (MainData[workflowIndex]?.workflowmapping) {
            MainData[workflowIndex].workflowmapping.forEach((wf) => {
                if (wf.statoDestinazione === statusItemKey) {
                    connections.push({ startId: wf.keyAzione, endId: statusItemKey, color: 'blue' });
                }
            });
        }
        setActiveConnections(connections);
        drawConnections(connections);
    };

    const handleActionMouseHover = (actionKey) => {
        const workflowIndex = MainData.length - 1;
        const connections = [];
        if (MainData[workflowIndex]?.workflowmapping) {
            const wf = MainData[workflowIndex].workflowmapping.find((item) => item.keyAzione === actionKey);
            if (wf) {
                if (wf.statoDestinazione) connections.push({ startId: actionKey, endId: wf.statoDestinazione, color: 'blue' });
                wf.listeDestinazione.forEach((listId) => connections.push({ startId: actionKey, endId: listId, color: 'red' }));
                wf.doNotlisteDestinazione.forEach((listId) => connections.push({ startId: actionKey, endId: listId, color: 'gray' }));
            }
        }
        setActiveConnections(connections);
        drawConnections(connections);
    };

    const handleMouseLeave = () => {
        setActiveConnections([]);
        const canvas = canvasRef.current;
        if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    };

    useEffect(() => {
        const handleResize = () => {
            const calculatedRoles = calculateRolesInRow();
            setCurrentRolesInRow(calculatedRoles);
            setMaxRolesInRow(prev => Math.min(prev, calculatedRoles, initialRolesInRow));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [calculateRolesInRow, initialRolesInRow]);

    useLayoutEffect(() => {
        const calculatedRoles = calculateRolesInRow();
        if (calculatedRoles !== initialRolesInRow) {
            setInitialRolesInRow(calculatedRoles);
            setCurrentRolesInRow(calculatedRoles);
            const FinalValue = calculatedRoles < initialRoles ? calculatedRoles : initialRoles;
            setMaxRolesInRow(FinalValue);
        }
        // eslint-disable-next-line
    }, [calculateRolesInRow, initialRolesInRow]);

    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (canvas && container) {
                const width = container.scrollWidth || container.clientWidth || window.innerWidth;
                const height = container.scrollHeight || container.clientHeight || window.innerHeight;
                canvas.width = width;
                canvas.height = height;
                if (activeConnections.length > 0) drawConnections(activeConnections);
            }
        };
        const rafId = requestAnimationFrame(() => resizeCanvas());
        window.addEventListener('resize', resizeCanvas);
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [MainData, activeConnections, drawConnections, maxRolesInRow, currentRolesInRow, zoom]);

    // Handle drag end for role cards
    const handleDragEndRole = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setEpWorkflowjson(prevJson => {
                const data = [...JSON.parse(prevJson)];
                const oldIndex = data.findIndex(item => item.ruolo?.nome === active.id);
                const newIndex = data.findIndex(item => item.ruolo?.nome === over.id);
                const newData = arrayMove(data, oldIndex, newIndex);
                return JSON.stringify(newData);
            });
        }
    };

    // Handle drag end for list items
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

    // Handle drag end for action items
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

    // Configure sensors with activation constraints to distinguish clicks from drags
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Require a 5-pixel movement to initiate a drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleAddListItem = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        const listIndex = updatedData[facultyIndex].liste.findIndex((list) => list.title === currentListTitle);
        if (selectedListItem) {
            const oldKey = selectedListItem.key;
            const newKey = data.key.trim();
            const itemIndex = updatedData[facultyIndex].liste[listIndex].listArray.findIndex((item) => item.key === selectedListItem.key);
            updatedData[facultyIndex].liste[listIndex].listArray[itemIndex] = data;

            updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                wf.listeDestinazione = wf.listeDestinazione.map(key => key === oldKey ? newKey : key);
                wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.map(key => key === oldKey ? newKey : key);
            });

            updatedData[facultyIndex].azioni.forEach(action => {
                action.listArray.forEach(item => {
                    if (item.moveToList) {
                        const moveToListKeys = item.moveToList.split(',').map(key => key.trim());
                        const updatedMoveToList = moveToListKeys.map(key => key === oldKey ? newKey : key).join(', ');
                        item.moveToList = updatedMoveToList;
                    }
                    if (item.doNotMoveToList) {
                        const doNotMoveToListKeys = item.doNotMoveToList.split(',').map(key => key.trim());
                        const updatedDoNotMoveToList = doNotMoveToListKeys.map(key => key === oldKey ? newKey : key).join(', ');
                        item.doNotMoveToList = updatedDoNotMoveToList;
                    }
                });
            });
        } else {
            updatedData[facultyIndex].liste[listIndex].listArray.push(data);
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedListItem(null);
        setListItemModalShow(false);
    };

    const handleDeleteListItem = () => {
        if (!selectedListItem) return;
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        const listIndex = updatedData[facultyIndex].liste.findIndex((list) => list.title === currentListTitle);
        const itemKey = selectedListItem.key;
        updatedData[facultyIndex].liste[listIndex].listArray = updatedData[facultyIndex].liste[listIndex].listArray.filter(
            (item) => item.key !== selectedListItem.key
        );

        updatedData[workflowIndex].workflowmapping.forEach((wf) => {
            wf.listeDestinazione = wf.listeDestinazione.filter(key => key !== itemKey);
            wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.filter(key => key !== itemKey);
        });

        updatedData[facultyIndex].azioni.forEach(action => {
            action.listArray.forEach(item => {
                if (item.moveToList) {
                    const moveToListKeys = item.moveToList.split(',').map(key => key.trim());
                    item.moveToList = moveToListKeys.filter(key => key !== itemKey).join(', ');
                }
                if (item.doNotMoveToList) {
                    const doNotMoveToListKeys = item.doNotMoveToList.split(',').map(key => key.trim());
                    item.doNotMoveToList = doNotMoveToListKeys.filter(key => key !== itemKey).join(', ');
                }
            });
        });

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedListItem(null);
        setListItemModalShow(false);
    };

    const handleAddActionItem = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const actionIndex = updatedData[facultyIndex].azioni.findIndex((action) => action.title === currentActionTitle);
        const workflowIndex = updatedData.length - 1;

        if (selectedActionItem) {
            const oldKey = selectedActionItem.key;
            const newKey = data.key.trim();
            const itemIndex = updatedData[facultyIndex].azioni[actionIndex].listArray.findIndex((item) => item.key === selectedActionItem.key);
            updatedData[facultyIndex].azioni[actionIndex].listArray[itemIndex] = data;

            updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                if (wf.keyAzione === oldKey) {
                    wf.keyAzione = newKey;
                }
                wf.listeDestinazione = wf.listeDestinazione.map(key => key === oldKey ? newKey : key);
                wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.map(key => key === oldKey ? newKey : key);
                if (wf.statoDestinazione === oldKey) {
                    wf.statoDestinazione = newKey;
                }
            });

            updatedData.forEach((faculty, index) => {
                if (faculty.pulsantiAttivi) {
                    const oldStatusKeys = Object.keys(faculty.pulsantiAttivi);
                    oldStatusKeys.forEach(oldStatus => {
                        if (faculty.pulsantiAttivi[oldStatus][oldKey]) {
                            const value = faculty.pulsantiAttivi[oldStatus][oldKey];
                            delete faculty.pulsantiAttivi[oldStatus][oldKey];
                            faculty.pulsantiAttivi[oldStatus][newKey] = value;
                        }
                    });
                }
            });
        } else {
            updatedData[facultyIndex].azioni[actionIndex].listArray.push(data);
        }

        const actionKey = data.key;
        const moveToListKeys = data.moveToList ? data.moveToList.split(',').map(key => key.trim()).filter(key => key) : [];
        const doNotMoveToListKeys = data.doNotMoveToList ? data.doNotMoveToList.split(',').map(key => key.trim()).filter(key => key) : [];

        let workflowItemIndex = updatedData[workflowIndex].workflowmapping.findIndex((wf) => wf.keyAzione === actionKey);
        if (workflowItemIndex === -1) {
            updatedData[workflowIndex].workflowmapping.push({
                keyAzione: actionKey,
                behaviour: data.behaviourTag || '',
                statoDestinazione: data.status || null,
                listeDestinazione: moveToListKeys,
                doNotlisteDestinazione: doNotMoveToListKeys
            });
        } else {
            const existingWorkflow = updatedData[workflowIndex].workflowmapping[workflowItemIndex];
            existingWorkflow.statoDestinazione = data.status || existingWorkflow.statoDestinazione || null;
            existingWorkflow.listeDestinazione = moveToListKeys;
            existingWorkflow.doNotlisteDestinazione = doNotMoveToListKeys;
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedActionItem(null);
        setActionItemModalShow(false);
    };

    const handleDeleteActionItem = () => {
        if (!selectedActionItem) return;
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const actionIndex = updatedData[facultyIndex].azioni.findIndex((action) => action.title === currentActionTitle);
        const workflowIndex = updatedData.length - 1;

        const itemKey = selectedActionItem.key;
        updatedData[facultyIndex].azioni[actionIndex].listArray = updatedData[facultyIndex].azioni[actionIndex].listArray.filter(
            (item) => item.key !== selectedActionItem.key
        );

        updatedData[workflowIndex].workflowmapping = updatedData[workflowIndex].workflowmapping.filter(
            (wf) => wf.keyAzione !== itemKey
        );
        updatedData[workflowIndex].workflowmapping.forEach((wf) => {
            wf.listeDestinazione = wf.listeDestinazione.filter(key => key !== itemKey);
            wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.filter(key => key !== itemKey);
            if (wf.statoDestinazione === itemKey) {
                wf.statoDestinazione = null;
            }
        });

        updatedData.forEach((faculty, index) => {
            if (faculty.pulsantiAttivi) {
                Object.keys(faculty.pulsantiAttivi).forEach(status => {
                    delete faculty.pulsantiAttivi[status][itemKey];
                });
            }
        });

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedActionItem(null);
        setActionItemModalShow(false);
    };

    const handleAddStatusItem = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        if (selectedStatusItem) {
            const oldStatus = selectedStatusItem;
            const newStatus = data.status.trim();
            if (!updatedData[facultyIndex].pulsantiAttivi) {
                updatedData[facultyIndex].pulsantiAttivi = {};
            }

            const oldValue = updatedData[facultyIndex].pulsantiAttivi[oldStatus] || {};
            delete updatedData[facultyIndex].pulsantiAttivi[oldStatus];
            updatedData[facultyIndex].pulsantiAttivi[newStatus] = oldValue;

            updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                if (wf.statoDestinazione === oldStatus) {
                    wf.statoDestinazione = newStatus;
                }
            });

            if (shownStatuses[currentFaculty] === oldStatus) {
                setShownStatuses(prev => ({
                    ...prev,
                    [currentFaculty]: newStatus
                }));
            }
        } else {
            if (!updatedData[facultyIndex].pulsantiAttivi) {
                updatedData[facultyIndex].pulsantiAttivi = {};
            }
            updatedData[facultyIndex].pulsantiAttivi[data.status.trim()] = {};
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedStatusItem(null);
        setStatusItemModalShow(false);
    };

    const handleDeleteStatusItem = () => {
        if (!selectedStatusItem) return;
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        delete updatedData[facultyIndex].pulsantiAttivi[selectedStatusItem];

        updatedData[workflowIndex].workflowmapping.forEach((wf) => {
            if (wf.statoDestinazione === selectedStatusItem) {
                wf.statoDestinazione = null;
            }
        });

        if (shownStatuses[currentFaculty] === selectedStatusItem) {
            setShownStatuses(prev => {
                const newStatuses = { ...prev };
                delete newStatuses[currentFaculty];
                return newStatuses;
            });
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedStatusItem(null);
        setStatusItemModalShow(false);
    };

    const handleAddTitleItem = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        const trimmedTitle = data.title.trim();
        if (selectedTitle) {
            if (titleModalType === 'liste') {
                const listIndex = updatedData[facultyIndex].liste.findIndex((list) => list.title === selectedTitle);
                if (listIndex !== -1) {
                    updatedData[facultyIndex].liste[listIndex].title = trimmedTitle;
                    updatedData[facultyIndex].liste[listIndex].listArray.forEach(item => {
                        const oldKey = item.key;
                        const newKey = item.key;
                        updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                            wf.listeDestinazione = wf.listeDestinazione.map(key => key === oldKey ? newKey : key);
                            wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.map(key => key === oldKey ? newKey : key);
                        });
                    });
                }
            } else if (titleModalType === 'azioni') {
                const actionIndex = updatedData[facultyIndex].azioni.findIndex((action) => action.title === selectedTitle);
                if (actionIndex !== -1) {
                    updatedData[facultyIndex].azioni[actionIndex].title = trimmedTitle;
                    updatedData[facultyIndex].azioni[actionIndex].listArray.forEach(item => {
                        const oldKey = item.key;
                        const newKey = item.key;
                        updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                            if (wf.keyAzione === oldKey) {
                                wf.keyAzione = newKey;
                            }
                            wf.listeDestinazione = wf.listeDestinazione.map(key => key === oldKey ? newKey : key);
                            wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.map(key => key === oldKey ? newKey : key);
                            if (wf.statoDestinazione === oldKey) {
                                wf.statoDestinazione = newKey;
                            }
                        });
                        updatedData.forEach((faculty, index) => {
                            if (faculty.pulsantiAttivi) {
                                const oldStatusKeys = Object.keys(faculty.pulsantiAttivi);
                                oldStatusKeys.forEach(oldStatus => {
                                    if (faculty.pulsantiAttivi[oldStatus][oldKey]) {
                                        const value = faculty.pulsantiAttivi[oldStatus][oldKey];
                                        delete faculty.pulsantiAttivi[oldStatus][oldKey];
                                        faculty.pulsantiAttivi[oldStatus][newKey] = value;
                                    }
                                });
                            }
                        });
                    });
                }
            }
        } else {
            const newTitleObject = { title: trimmedTitle, listArray: [] };
            if (titleModalType === 'liste') {
                updatedData[facultyIndex].liste.push(newTitleObject);
            } else if (titleModalType === 'azioni') {
                updatedData[facultyIndex].azioni.push(newTitleObject);
            }
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedTitle(null);
        setTitleItemModalShow(false);
    };

    const handleDeleteTitle = (title, type) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const facultyIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === currentFaculty);
        const workflowIndex = updatedData.length - 1;

        if (type === 'liste') {
            const list = updatedData[facultyIndex].liste.find(item => item.title === title);
            if (list) {
                list.listArray.forEach(item => {
                    const itemKey = item.key;
                    updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                        wf.listeDestinazione = wf.listeDestinazione.filter(key => key !== itemKey);
                        wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.filter(key => key !== itemKey);
                    });
                    updatedData[facultyIndex].azioni.forEach(action => {
                        action.listArray.forEach(item => {
                            if (item.moveToList) {
                                const moveToListKeys = item.moveToList.split(',').map(key => key.trim());
                                item.moveToList = moveToListKeys.filter(key => key !== itemKey).join(', ');
                            }
                            if (item.doNotMoveToList) {
                                const doNotMoveToListKeys = item.doNotMoveToList.split(',').map(key => key.trim());
                                item.doNotMoveToList = doNotMoveToListKeys.filter(key => key !== itemKey).join(', ');
                            }
                        });
                    });
                });
                updatedData[facultyIndex].liste = updatedData[facultyIndex].liste.filter(
                    (item) => item.title !== title
                );
            }
        } else if (type === 'azioni') {
            const action = updatedData[facultyIndex].azioni.find(item => item.title === title);
            if (action) {
                action.listArray.forEach(item => {
                    const itemKey = item.key;
                    updatedData[workflowIndex].workflowmapping = updatedData[workflowIndex].workflowmapping.filter(
                        (wf) => wf.keyAzione !== itemKey
                    );
                    updatedData[workflowIndex].workflowmapping.forEach((wf) => {
                        wf.listeDestinazione = wf.listeDestinazione.filter(key => key !== itemKey);
                        wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.filter(key => key !== itemKey);
                        if (wf.statoDestinazione === itemKey) {
                            wf.statoDestinazione = null;
                        }
                    });
                    updatedData.forEach((faculty, index) => {
                        if (faculty.pulsantiAttivi) {
                            Object.keys(faculty.pulsantiAttivi).forEach(status => {
                                delete faculty.pulsantiAttivi[status][itemKey];
                            });
                        }
                    });
                    updatedData[facultyIndex].azioni.forEach(otherAction => {
                        otherAction.listArray.forEach(otherItem => {
                            if (otherItem.moveToList) {
                                const moveToListKeys = otherItem.moveToList.split(',').map(key => key.trim());
                                otherItem.moveToList = moveToListKeys.filter(key => key !== itemKey).join(', ');
                            }
                            if (otherItem.doNotMoveToList) {
                                const doNotMoveToListKeys = otherItem.doNotMoveToList.split(',').map(key => key.trim());
                                otherItem.doNotMoveToList = doNotMoveToListKeys.filter(key => key !== itemKey).join(', ');
                            }
                        });
                    });
                });
                updatedData[facultyIndex].azioni = updatedData[facultyIndex].azioni.filter(
                    (item) => item.title !== title
                );
            }
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setTitleItemModalShow(false);
        setSelectedTitle(null);
    };

    const handleAddRole = (data) => {
        const updatedData = initializeWorkflowMapping([...MainData]);
        const workflowIndex = updatedData.length - 1;

        const trimmedData = {
            ruolo: {
                nome: data.nome.trim(),
                descrizione: data.descrizione.trim(),
                listaDefault: data.listaDefault.trim()
            },
            liste: [],
            azioni: []
        };

        if (selectedRoleItem) {
            const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === selectedRoleItem.nome);
            if (roleIndex !== -1) {
                const existingRole = updatedData[roleIndex];
                updatedData[roleIndex] = {
                    ...existingRole,
                    ruolo: trimmedData.ruolo
                };
            }
        } else {
            updatedData.splice(workflowIndex, 0, trimmedData);
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedRoleItem(null);
        setRoleModalShow(false);
    };

    const handleDeleteRole = () => {
        if (!selectedRoleItem) return;
        const updatedData = initializeWorkflowMapping([...MainData]);
        const workflowIndex = updatedData.length - 1;

        const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === selectedRoleItem.nome);
        if (roleIndex === -1) return;

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
            delete newStatuses[selectedRoleItem.nome];
            return newStatuses;
        });

        updatedData.splice(roleIndex, 1);

        setEpWorkflowjson(JSON.stringify(updatedData));
        setSelectedRoleItem(null);
        setRoleModalShow(false);
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

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', margin: '10px 0px', background: '#f0f0f0', borderBottom: '1px solid #ccc', borderTop: '1px solid #ccc' }}>
                <div>
                    <label htmlFor="maxRolesInput">Max Roles in a Row: </label>
                    <input
                        id="maxRolesInput"
                        type="number"
                        value={maxRolesInRow}
                        min={1}
                        max={initialRoles}
                        onChange={(e) => {
                            const value = Math.max(1, Math.min(initialRolesInRow, parseInt(e.target.value) || 1));
                            setMaxRolesInRow(value);
                        }}
                        style={{ width: '60px', marginLeft: '5px' }}
                    />
                </div>
                <div>
                    <label htmlFor="zoomInput">Zoom: </label>
                    <input
                        id="zoomInput"
                        type="number"
                        value={zoom}
                        min={0.1}
                        max={5}
                        step={0.1}
                        onChange={(e) => {
                            const value = Math.max(0.1, parseFloat(e.target.value) || 0.1);
                            setZoom(value);
                        }}
                        style={{ width: '60px', marginLeft: '5px' }}
                    />
                </div>
            </div>
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000, pointerEvents: 'none' }} />
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndRole}>
                <SortableContext items={MainData.map(item => item.ruolo?.nome).filter(Boolean)} strategy={horizontalListSortingStrategy}>
                    <div className='d-flex justify-content-around flex-wrap' style={{ position: 'relative', zIndex: 1 }}>
                        {MainData?.map((element) => {
                            if (element?.ruolo) {
                                const roleName = element.ruolo.nome;
                                const shownStatus = shownStatuses[roleName];
                                const associatedActions = shownStatus ? element.pulsantiAttivi?.[shownStatus] || {} : {};

                                return (
                                    <SortableRoleCard
                                        key={roleName}
                                        id={roleName}
                                        className='mb-3 px-2 d-flex justify-content-between flex-wrap Editor_Card'
                                        style={{
                                            flex: `0 0 ${100 / Math.min(maxRolesInRow, currentRolesInRow)}%`,
                                            maxWidth: `${100 / Math.min(maxRolesInRow, currentRolesInRow)}%`,
                                            width: `${DEFAULT_ROLE_WIDTH * zoom}px`,
                                        }}
                                    >
                                        <Card>
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
                                            <Card.Body style={{ display: collapsedCards[roleName] ? 'none' : 'block' }}>
                                                <div className='d-flex gap-2'>
                                                    <div className='d-flex flex-column'>
                                                        {element?.liste?.map((listeItem) => (
                                                            <div className='d-flex flex-column' key={listeItem.title}>
                                                                <span className='listeItemTitle text-center cursor-pointer'>
                                                                    <span onClick={() => openTitleItemModal(element.ruolo.nome, 'liste', { title: listeItem.title })}>
                                                                        {listeItem?.title}{' '}
                                                                    </span>
                                                                    <span className="plus-icon" onClick={() => openListItemModal(element.ruolo.nome, listeItem.title)}>
                                                                        <RoundPlusIcon className='cursor-pointer' height={20} width={20} />
                                                                    </span>
                                                                </span>
                                                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => handleDragEndListItem(event, element.ruolo.nome, listeItem.title)}>
                                                                    <SortableContext items={listeItem.listArray.map(item => item.key)} strategy={verticalListSortingStrategy}>
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
                                                                                    <span ref={(el) => (refsMap.current[listArrayItem.key] = el)} id={listArrayItem?.key}>
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
                                                            <span className="plus-icon" onClick={() => openStatusItemModal(element.ruolo.nome)}>
                                                                <RoundPlusIcon className='cursor-pointer' height={20} width={20} />
                                                            </span>
                                                        </span>
                                                        {element?.pulsantiAttivi && Object.keys(element?.pulsantiAttivi)?.map((StatusItem) => (
                                                            <span
                                                                ref={(el) => (refsMap.current[StatusItem] = el)}
                                                                className='StatusItemTitle'
                                                                id={StatusItem}
                                                                onMouseEnter={() => {
                                                                    setHoveredStatus({ role: roleName, status: StatusItem });
                                                                    handleStatusMouseHover(StatusItem);
                                                                }}
                                                                onMouseLeave={() => {
                                                                    setHoveredStatus(null);
                                                                    handleMouseLeave();
                                                                }}
                                                                onClick={() => openStatusItemModal(element.ruolo.nome, StatusItem)}
                                                                key={StatusItem}
                                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            >
                                                                {StatusItem}
                                                                {(hoveredStatus?.role === roleName && hoveredStatus?.status === StatusItem) || shownStatus === StatusItem ? (
                                                                    <span
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleStatusVisibility(roleName, StatusItem);
                                                                        }}
                                                                        style={{ marginLeft: '5px', cursor: 'pointer' }}
                                                                    >
                                                                        {shownStatus === StatusItem ? <OpenEyeIcon /> : <ClosedEyeIcon />}
                                                                    </span>
                                                                ) : null}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className='d-flex flex-column'>
                                                        {element?.azioni?.map((azioniItem) => (
                                                            <div className='d-flex flex-column' key={azioniItem.title}>
                                                                <span className='azioniItemTitle text-center cursor-pointer'>
                                                                    <span onClick={() => openTitleItemModal(element.ruolo.nome, 'azioni', { title: azioniItem.title })}>
                                                                        {azioniItem?.title}{' '}
                                                                    </span>
                                                                    <span className="plus-icon" onClick={() => openActionItemModal(element.ruolo.nome, azioniItem.title)}>
                                                                        <RoundPlusIcon className='cursor-pointer' height={20} width={20} />
                                                                    </span>
                                                                </span>
                                                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => handleDragEndActionItem(event, element.ruolo.nome, azioniItem.title)}>
                                                                    <SortableContext items={azioniItem.listArray.map(item => item.key)} strategy={verticalListSortingStrategy}>
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
                                                                                            setHoveredAction({ role: roleName, actionKey: azioniArrayItem.key });
                                                                                            handleActionMouseHover(azioniArrayItem.key);
                                                                                        }}
                                                                                        onMouseLeave={() => {
                                                                                            setHoveredAction(null);
                                                                                            handleMouseLeave();
                                                                                        }}
                                                                                        onClick={() => openActionItemModal(element.ruolo.nome, azioniItem.title, azioniArrayItem)}
                                                                                    >
                                                                                        <span ref={(el) => (refsMap.current[azioniArrayItem.key] = el)} id={azioniArrayItem.key}>
                                                                                            {azioniArrayItem?.title}
                                                                                            {shownStatus && isHovered ? (
                                                                                                <span
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        toggleActionVisibility(roleName, shownStatus, azioniArrayItem.key);
                                                                                                    }}
                                                                                                    style={{ marginLeft: '5px', cursor: 'pointer' }}
                                                                                                >
                                                                                                    {isAssociated ? <OpenEyeIcon /> : <ClosedEyeIcon />}
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
                                        </Card>
                                    </SortableRoleCard>
                                );
                            }
                            return null;
                        })}
                        <Col
                            className='mb-3 px-2 d-flex justify-content-between flex-wrap Editor_Card_new'
                            style={{
                                flex: `0 0 ${100 / Math.min(maxRolesInRow, currentRolesInRow)}%`,
                                maxWidth: `${100 / Math.min(maxRolesInRow, currentRolesInRow)}%`,
                                width: `${DEFAULT_ROLE_WIDTH * zoom}px`,
                            }}
                        >
                            <Card>
                                <Card.Body className='d-flex justify-content-center Editor_Card_new'>
                                    <div className='d-flex justify-content-center rounded cursor-pointer bg-dark text-white mb-3 px-3 py-1' onClick={() => openRoleModal()}>
                                        Add New Role
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </div>
                </SortableContext>
            </DndContext>
            <ListItemModal
                show={listItemModalShow}
                handleClose={() => { setListItemModalShow(false); setCurrentFaculty(''); }}
                handleAddListItem={handleAddListItem}
                handleDeleteListItem={handleDeleteListItem}
                initialData={selectedListItem}
            />
            <ActionItemModal
                show={actionItemModalShow}
                handleClose={() => { setActionItemModalShow(false); setCurrentFaculty(''); }}
                handleAddActionItem={handleAddActionItem}
                handleDeleteActionItem={handleDeleteActionItem}
                initialData={selectedActionItem}
                statusOptions={getStatusOptions()}
            />
            <StatusModal
                show={statusItemModalShow}
                handleClose={() => { setStatusItemModalShow(false); setCurrentFaculty(''); }}
                handleAddStatusItem={handleAddStatusItem}
                handleDeleteStatusItem={handleDeleteStatusItem}
                initialData={selectedStatusItem ? { status: selectedStatusItem } : null}
            />
            <TitleModal
                show={titleItemModalShow}
                handleClose={() => { setTitleItemModalShow(false); setCurrentFaculty(''); setSelectedTitle(null); }}
                handleTitleItem={handleAddTitleItem}
                handleDeleteTitle={handleDeleteTitle}
                titleModalType={titleModalType}
                initialData={selectedTitle ? { title: selectedTitle } : null}
            />
            <RoleItemModal
                show={roleModalShow}
                initialData={selectedRoleItem ? selectedRoleItem : null}
                handleClose={() => { setRoleModalShow(false); setSelectedRoleItem(null); }}
                handleAddRole={handleAddRole}
                handleDeleteRole={handleDeleteRole}
            />
        </div>
    );
}

export default View;