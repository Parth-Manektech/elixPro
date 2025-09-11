
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import LeaderLine from 'leader-line-new';
import * as bootstrap from 'bootstrap';

import DeleteConfirmationModal from '../../Components/DeleteConfirmationModal';
import ListItemModal from '../../Components/editorComponents/Modals/ListItemModal';
import ActionItemModal from '../../Components/editorComponents/Modals/actionItemModal';
import StatusModal from '../../Components/editorComponents/Modals/StatusModal';
import TitleModal from '../../Components/editorComponents/Modals/TitleModal';
import RoleItemModal from '../../Components/editorComponents/Modals/RoleModal';
import CloneRoleModal from '../../Components/editorComponents/Modals/CloneRoleModal';

import { getRoleForElement, drawArrow, handleDeleteRole, handleCloneRoleSubmit } from '../../Components/editorComponents/ViewComponentUtility';
import Toolbar from '../../Components/editorComponents/Toolbar';
// import MainCanvas from '../../Components/editorComponents/MainCanvas';
import RoleCard from '../../Components/editorComponents/RoleCard';
import { DuplicateErrorToast } from '../../utils/Toster';
import { parseList } from '../../utils/utils';

function View({ epWorkflowjson, setEpWorkflowjson, hendelGenrateCode, activeKey }) {
    const MainData = useMemo(() => (epWorkflowjson ? JSON.parse(epWorkflowjson) : []), [epWorkflowjson]);
    const [zoomLevel, setZoomLevel] = useState(1);
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
    const [roleDeleteConfirmation, setRoleDeleteConfirmation] = useState({ modal: false, value: null });
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [cloneRoleModalShow, setCloneRoleModalShow] = useState(false);
    const [roleToClone, setRoleToClone] = useState(null);
    const [visibleRoles, setVisibleRoles] = useState({});
    const [selectedElement, setSelectedElement] = useState(null);

    const [collapsedRoles, setCollapsedRoles] = useState([]); // Holds keys
    const [searchTerm, setSearchTerm] = useState('');
    const [isRightBarOpen, setIsRightBarOpen] = useState(true);
    const [duplicateCount, setDuplicateCount] = useState(0);
    const [dataID, setDataID] = useState({});
    const [currentDataId, setCurrentDataId] = useState(null)

    const handleCollapseCard = (role) => {

        setCollapsedCards((prev) => {
            const newCollapsed = { ...prev };
            delete newCollapsed[role.nome]; // Still use nome for collapsedCards if needed
            return newCollapsed;
        });
        setCollapsedRoles((prev) => [...prev, role.key]);
        setSelectedElement(null);
        clearLeaderLines();
    };

    const handleExpandCard = (key) => {
        setCollapsedCards((prev) => {
            const newCollapsed = { ...prev };
            const role = MainData.find((role) => role?.ruolo?.key === key);
            if (role) delete newCollapsed[role.nome];
            return newCollapsed;
        });
        setCollapsedRoles((prev) => prev.filter((r) => r !== key));
        setSelectedElement(null);
        clearLeaderLines();
    };

    const handleToggleAll = () => {
        const allKeys = MainData.map((role) => role?.ruolo?.key).filter(Boolean);
        if (collapsedRoles.length === 0 || collapsedRoles.length < allKeys.length) {
            setCollapsedCards({});
            setCollapsedRoles(allKeys);
        } else {
            setCollapsedCards({});
            setCollapsedRoles([]);
        }
        setSelectedElement(null);
        clearLeaderLines();
    };

    const filteredCollapsedRoles = useMemo(() => {
        return MainData.filter((role) => collapsedRoles.includes(role?.ruolo?.key) && role?.ruolo?.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [collapsedRoles, searchTerm, MainData]);

    const toggleRightBar = () => {
        setIsRightBarOpen((prev) => !prev);
    };


    const [isEditMode, setIsEditMode] = useState(false)
    const leaderLinesRef = useRef([]);

    const clearLeaderLines = () => {
        leaderLinesRef.current.forEach(line => line.remove());
        leaderLinesRef.current = [];
    };

    const updateLeaderLines = () => {
        leaderLinesRef.current.forEach(line => line.position());
    };

    const containerRef = useRef(null);
    const refsMap = useRef({});
    const dropdownToggleRefs = useRef({});

    const createLeaderLine = (startId, endId, color, startPlug, endPlug, isSelected = false, containerRef) => {
        const startElement = refsMap.current[startId];
        const endElement = refsMap.current[endId];
        if (startElement && endElement && containerRef.current) {
            const startRect = startElement.getBoundingClientRect();
            const endRect = endElement.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            const startX = startRect.left - containerRect.left + startRect.width / 2;
            const endX = endRect.left - containerRect.left + endRect.width / 2;

            const startSocket = startX < endX ? 'right' : 'left';
            const endSocket = startX < endX ? 'left' : 'right';

            const line = new LeaderLine(startElement, endElement, {
                color: isSelected ? color.replace('0.25', '1') : color,
                startPlug: startPlug,
                endPlug: endPlug,
                arcDrift: 1,
                path: 'fluid',
                size: 2,
                endPlugSize: 2,
                dropShadow: true,
                startPlugSize: 2,
                gradient: true,
                container: containerRef.current,
                zIndex: 1,
                startSocket: startSocket,
                endSocket: endSocket,
            });
            leaderLinesRef.current.push(line);
        }
    };

    const drawConnections = useCallback(
        (connections) => { console.log('connections', connections) },
        [zoomLevel, collapsedCards, MainData]
    );

    function detectAndMarkDuplicatedKeys() {
        const keyMap = {};
        const items = document.querySelectorAll('[data-key]');

        // Pulisce tutte le icone precedenti
        items.forEach(el => {
            el.querySelectorAll('.duplicate-key-alert')?.forEach(icon => icon.remove());
        });

        // Costruisce la mappa delle key
        items.forEach(el => {
            const key = el.dataset.key?.trim();
            if (!key || key === 'undefined') return;
            if (!keyMap[key]) keyMap[key] = [];
            keyMap[key].push(el);
        });

        // Applica le icone solo dove necessario
        Object.entries(keyMap).forEach(([key, els]) => {
            if (els.length <= 1) return;

            const ids = els.map(el => el.dataset.id).filter(Boolean).join(', ');

            els.forEach(el => {
                const vr = el.querySelector('.vr-line');
                if (!vr) return;

                const alertIcon = document.createElement('i');
                alertIcon.className = 'bi bi-exclamation-triangle-fill text-danger duplicate-key-alert';
                alertIcon.setAttribute('data-bs-toggle', 'tooltip');
                alertIcon.setAttribute('data-bs-title', `La Key non è univoca! Viene usata più volte per: ${ids}`);
                alertIcon.setAttribute('data-bs-placement', 'top');

                vr.insertAdjacentElement('afterend', alertIcon);

                // Tooltip Bootstrap
                new bootstrap.Tooltip(alertIcon);
            });
        });
    }

    useEffect(() => {
        let hasChanges = false;
        const updatedData = MainData.map((role, index) => {
            let updatedRole = { ...role };
            if (!role.layout && role?.ruolo?.key) {
                hasChanges = true;
                updatedRole = {
                    ...updatedRole,
                    layout: {
                        top: (Math.floor(index / 4) * (480)) + 20, // Increment top after every 3rd role with a 50px gap
                        left: ((index % 4) * 785) + 20, // Horizontal spacing for each role within a group of 3
                        width: 768,
                        height: 637,
                    },
                };
            }
            // Function to generate a random color
            function generateRoleColor(index, total = 4) {
                const excludedZones = [
                    [0, 20], // evitiamo il rosso
                    [70, 180], // evitiamo il verde
                    [230, 300] // evitiamo il viola
                ];

                const safeHueRange = [];
                for (let h = 0; h < 360; h++) {
                    const inExcluded = excludedZones.some(([start, end]) => h >= start && h <= end);
                    if (!inExcluded) safeHueRange.push(h);
                }

                const step = Math.floor(safeHueRange.length / total);
                const hue = safeHueRange[(index * step) % safeHueRange.length];

                const h = hue;
                const s = 30; // saturazione tenue
                const l = 65; // luminosità chiara

                return hslToHex(h, s, l);
            }
            function hslToHex(h, s, l) {
                s /= 100;
                l /= 100;

                const k = n => (n + h / 30) % 12;
                const a = s * Math.min(l, 1 - l);
                const f = n =>
                    Math.round(255 * (l - a * Math.max(-1, Math.min(Math.min(k(n) - 3, 9 - k(n)), 1))));

                return `#${f(0).toString(16).padStart(2, '0')}${f(8).toString(16).padStart(2, '0')}${f(4)
                    .toString(16)
                    .padStart(2, '0')}`;
            }

            if (role.ruolo && !role.ruolo.colore) {
                hasChanges = true;
                updatedRole = {
                    ...updatedRole,
                    ruolo: {
                        ...role.ruolo,
                        colore: generateRoleColor(index, MainData?.length),
                    },
                };
            }
            return updatedRole;
        });

        if (hasChanges) {
            setEpWorkflowjson(JSON.stringify(updatedData));
        } else {
            setVisibleRoles((prev) => {
                const newVisibleRoles = {};
                MainData.forEach((role) => {
                    if (role.ruolo?.nome) {
                        newVisibleRoles[role.ruolo.nome] = prev[role.ruolo.nome] ?? true;
                    }
                });
                return newVisibleRoles;
            });
        }

        const listKeys = [];
        const statusKeys = [];
        const actionKeys = [];

        const rolekeysforId = [];
        const catlistkeysforid = [];
        const listKeysforid = [];
        const statusKeysforid = [];
        const catactionlistfroid = []
        const actionKeysforid = [];


        MainData.forEach((item, i) => {
            if (item.ruolo) {
                // Extract list keys from liste[].listArray[].key
                rolekeysforId.push(item.ruolo.key.concat("-", String(i)))

                if (item.liste && Array.isArray(item.liste)) {
                    item.liste.forEach(list => {
                        const catList = item.ruolo.key.concat("-", list.title?.replaceAll(" ", "-"))
                        catlistkeysforid.push(catList)
                        if (list.listArray && Array.isArray(list.listArray)) {
                            list.listArray.forEach((listItem, index) => {
                                if (listItem.key) {
                                    listKeysforid.push(`${catList.concat("-", listItem.key.replaceAll(" ", "-"))}-${index}`)
                                    listKeys.push(listItem.key);
                                }
                            });
                        }
                    });
                }

                // Extract status keys from pulsantiAttivi
                if (item.pulsantiAttivi && typeof item.pulsantiAttivi === 'object') {
                    Object.keys(item.pulsantiAttivi).forEach((statusKey, index) => {
                        statusKeysforid.push(`${item.ruolo.key.concat("-", statusKey)}-${index}`)
                        statusKeys.push(statusKey);
                    });
                }

                // Extract action keys from azioni[].listArray[].key
                if (item.azioni && Array.isArray(item.azioni)) {
                    item.azioni.forEach(action => {
                        const catAction = item.ruolo.key.concat("-", action.title?.replaceAll(" ", "-"))
                        catactionlistfroid.push(catAction)
                        if (action.listArray && Array.isArray(action.listArray)) {
                            action.listArray.forEach((actionItem, index) => {
                                actionKeysforid.push(`${catAction.concat("-", actionItem.key.replaceAll(" ", "-"))}-${index}`)
                                if (actionItem.key) {
                                    actionKeys.push(actionItem.key);
                                }
                            });
                        }
                    });
                }
            }
        });

        const DataIds = {
            roleId: {},
            catlistId: {},
            listId: {},
            statusId: {},
            catactionId: {},
            action: {}
        }

        rolekeysforId.forEach((e, i) => {
            DataIds.roleId[e] = `R-${String(i + 1).padStart(2, '0')}`;
        })
        catlistkeysforid.forEach((e, i) => {
            DataIds.catlistId[e] = `CL-${String(i + 1).padStart(3, '0')}`;
        })
        listKeysforid.forEach((e, i) => {
            DataIds.listId[e] = `L-${String(i + 1).padStart(4, '0')}`;
        })
        statusKeysforid.forEach((e, i) => {
            DataIds.statusId[e] = `S-${String(i + 1).padStart(4, '0')}`
        })
        catactionlistfroid.forEach((e, i) => {
            DataIds.catactionId[e] = `CA-${String(i + 1).padStart(3, '0')}`;
        })
        actionKeysforid.forEach((e, i) => {
            DataIds.action[e] = `A-${String(i + 1).padStart(4, '0')}`;
        })

        setDataID(DataIds);

        setTimeout(() => {
            addFrecciaClass();
        }, 10);
        isEditMode && detectAndMarkDuplicatedKeys();
    }, [MainData, setEpWorkflowjson]);


    const addFrecciaClass = () => {
        if (MainData) {
            const allActions = MainData.flatMap(card => (card.azioni || []).flatMap(cat => cat.listArray || []));

            const listItemSet = new Set();
            allActions.forEach(a => {
                const move = Array.isArray(a.moveToList) ?
                    a.moveToList :
                    typeof a.moveToList === 'string' ?
                        a.moveToList.split(',').map(s => s.trim()).filter(Boolean) :
                        [];

                const noMove = Array.isArray(a.doNotMoveToList) ?
                    a.doNotMoveToList :
                    typeof a.doNotMoveToList === 'string' ?
                        a.doNotMoveToList.split(',').map(s => s.trim()).filter(Boolean) :
                        [];

                [...move, ...noMove].forEach(key => {
                    if (key) listItemSet.add(key);
                });
            });

            // Applica alle liste
            document.querySelectorAll('.list-item').forEach(listEl => {
                listEl.classList.remove('has-freccia');
                if (listItemSet.has(listEl.id)) {
                    listEl.classList.add('has-freccia');
                }
            });

            // Applica alle azioni
            document.querySelectorAll('.action-item').forEach(actionEl => {
                actionEl.classList.remove('has-freccia');
                const hasStatus = !!actionEl.dataset.status?.trim();
                const hasMove = parseList(actionEl.dataset.movetolist).length > 0;
                const hasNoMove = parseList(actionEl.dataset.donotmovetolist).length > 0;

                if (hasStatus || hasMove || hasNoMove) {
                    actionEl.classList.add('has-freccia');
                }
            });
        }

    }


    const openListItemModal = (facultyName, listTitle, listItem = null, dataid) => {
        setCurrentFaculty(facultyName);
        setCurrentListTitle(listTitle);
        setSelectedListItem(listItem);
        setListItemModalShow(true);
        setCurrentDataId(dataid)
    };

    const openActionItemModal = (facultyName, actionTitle, actionItem = null, dataid) => {
        setCurrentFaculty(facultyName);
        setCurrentActionTitle(actionTitle);
        setSelectedActionItem(actionItem);
        setActionItemModalShow(true);
        setCurrentDataId(dataid)
    };

    const openStatusItemModal = (facultyName, statusItem = null, dataid) => {
        setCurrentFaculty(facultyName);
        setSelectedStatusItem(statusItem);
        setStatusItemModalShow(true);
        setCurrentDataId(dataid)
    };

    const openTitleItemModal = (facultyName, type, initialData = null, dataid) => {
        setCurrentFaculty(facultyName);
        setTitleModalType(type);
        setSelectedTitle(initialData ? initialData.title : null);
        setTitleItemModalShow(true);
        setCurrentDataId(dataid)
    };

    const openRoleModal = (ruolo = null, dataid) => {
        setSelectedRoleItem(ruolo);
        setRoleModalShow(true);
        setCurrentDataId(dataid)
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

    const handleCloneRole = (role) => {
        setRoleToClone(role);
        setCloneRoleModalShow(true);
    };

    const updateCanvasSize = () => {
        setCanvasSize((prev) => ({ ...prev }));
    };

    const removeDuplicateKeyAlerts = () => {
        document.querySelectorAll('.duplicate-key-alert').forEach((icon) => {
            const tooltip = bootstrap.Tooltip.getInstance(icon); // Get tooltip instance
            if (tooltip) {
                tooltip.dispose(); // Dispose of tooltip to prevent memory leaks
            }
            icon.remove(); // Remove the icon from the DOM
        });
    };
    useEffect(() => {
        if (isEditMode) {
            detectAndMarkDuplicatedKeys();
            const duplicateIcons = document.querySelectorAll('.duplicate-key-alert');
            const count = duplicateIcons.length;
            if (count) DuplicateErrorToast(`Sono stati rilevati ${count} errori di key duplicata.`)

        } else {
            removeDuplicateKeyAlerts();
        }
    }, [isEditMode]);


    function isColorLight(hexColor) {
        const hex = hexColor.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
        return luminance > 140;
    }

    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const originalPositionsRef = useRef({});

    const handleCollapsedRoleDragStart = (e, ruolo) => {
        if (!ruolo?.nome) return;
        setDraggingItem({ type: 'collapsedRole', roleName: ruolo.nome });
        e.dataTransfer.setData('roleName', ruolo.nome);
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };

        const role = MainData.find((r) => r.ruolo?.nome === ruolo.nome);
        originalPositionsRef.current[ruolo.nome] = {
            top: role.layout?.top || 0,
            left: role.layout?.left || 0,
            width: role.layout?.width || 350,
            height: role.layout?.height || 690,
        };
    };

    const handleCollapsedRoleDrag = (e, ruolo) => {
        if (!draggingItem || draggingItem.type !== 'collapsedRole' || draggingItem.roleName !== ruolo.nome) return;

        if (e.clientX === 0 && e.clientY === 0) return;

        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex((r) => r.ruolo?.nome === ruolo.nome);
        const currentLayout = updatedData[roleIndex].layout || { top: 0, left: 0, width: 350, height: 690 };

        const containerRect = containerRef.current.getBoundingClientRect();
        const deltaX = (e.clientX - containerRect.left - dragStartPosRef.current.x) / zoomLevel;
        const deltaY = (e.clientY - containerRect.top - dragStartPosRef.current.y) / zoomLevel;

        const originalTop = originalPositionsRef.current[ruolo.nome]?.top || 0;
        const originalLeft = originalPositionsRef.current[ruolo.nome]?.left || 0;

        let newTop = Math.max(0, Math.round((originalTop + deltaY) / 20) * 20);
        let newLeft = Math.max(0, Math.round((originalLeft + deltaX) / 20) * 20);

        updatedData[roleIndex].layout = {
            ...currentLayout,
            top: newTop,
            left: newLeft,
        };

        setEpWorkflowjson(JSON.stringify(updatedData));
        updateCanvasSize({
            top: newTop + (currentLayout.height || 690) + 100,
            left: newLeft + (currentLayout.width || 350) + 100,
        });
    };

    const handleCollapsedRoleDragEnd = (e, ruolo) => {
        e.preventDefault();
        if (!draggingItem || draggingItem.type !== 'collapsedRole' || draggingItem.roleName !== ruolo.nome) return;

        setCollapsedRoles((prev) => prev.filter((key) => key !== ruolo.key));
        // setCollapsedCards((prev) => {
        //     const newCollapsed = { ...prev };
        //     delete newCollapsed[ruolo.nome];
        //     return newCollapsed;
        // });

        setCollapsedCards((prev) => {
            const isCollapsed = !prev[ruolo.nome];
            return { ...prev, [ruolo.nome]: isCollapsed };
        });



        setDraggingItem(null);
        delete originalPositionsRef.current[ruolo.nome];
        updateCanvasSize();
        clearLeaderLines();
    };

    const handleCollapsedRoleDrop = (e) => {
        e.preventDefault();
        if (!draggingItem || draggingItem.type !== 'collapsedRole') return;

        const roleName = e.dataTransfer.getData('roleName');
        const role = MainData.find((r) => r.ruolo?.nome === roleName);
        if (!role) return;

        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex((r) => r.ruolo?.nome === roleName);
        const currentLayout = updatedData[roleIndex].layout || { top: 0, left: 0, width: 350, height: 690 };

        const containerRect = containerRef.current.getBoundingClientRect();
        const newTop = Math.max(0, Math.round((e.clientY - containerRect.top) / zoomLevel / 20) * 20);
        const newLeft = Math.max(0, Math.round((e.clientX - containerRect.left) / zoomLevel / 20) * 20);

        updatedData[roleIndex].layout = {
            ...currentLayout,
            top: newTop,
            left: newLeft,
        };

        setEpWorkflowjson(JSON.stringify(updatedData));
        setCollapsedRoles((prev) => prev.filter((key) => key !== role.ruolo.key));

        // setCollapsedCards((prev) => {
        //     const newCollapsed = { ...prev };
        //     delete newCollapsed[roleName];
        //     return newCollapsed;
        // });

        setCollapsedCards((prev) => {
            const isCollapsed = !prev[roleName];
            return { ...prev, [roleName]: isCollapsed };
        });

        setDraggingItem(null);
        delete originalPositionsRef.current[roleName];
        updateCanvasSize();
        clearLeaderLines();
    };

    useEffect(() => {
        setTimeout(() => {
            updateLeaderLines()
        }, 0);
    }, [isEditMode, MainData])

    useEffect(() => {
        if (activeKey === "code") {
            setSelectedElement(null);
            clearLeaderLines()
        }
    }, [activeKey])

    return (
        <div className='position-relative'>
            <button
                className="right-bar-toggle"
                onClick={toggleRightBar}
                style={{ right: isRightBarOpen ? "300px" : "15px" }}
            >
                <i className={`bi ${isRightBarOpen ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
            </button>


            {isRightBarOpen && (
                <div className="right-bar">
                    <div className="right-bar-header">
                        <h4>Ruoli</h4>
                        <a
                            href="#"
                            className="filter-toggle-all-ruoli"
                            onClick={(e) => {
                                e.preventDefault();
                                handleToggleAll();
                            }}
                        >
                            {collapsedRoles.length == MainData.map((role) => role?.ruolo?.key).filter(Boolean).length
                                ? 'Espandi tutti'
                                : 'Collassa tutti'}

                        </a>
                    </div>
                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Cerca ruolo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="right-bar-body">
                        {filteredCollapsedRoles.map((role) => {
                            let Color = '#fff'
                            const isLight = isColorLight(role.ruolo?.colore ? role.ruolo?.colore : "#343a40");
                            if (isLight) {
                                Color = "#212529";
                            } else {
                                Color = "#f8f9fa";
                            }
                            return (<div
                                key={role?.ruolo?.key}
                                id={role.ruolo.key}
                                ref={(el) => (refsMap.current[role.ruolo.key] = el)}
                                style={{ backgroundColor: role.ruolo?.colore || '#6f42c1' }}
                                className="collapsed-role"
                                draggable
                                onDragStart={(e) => handleCollapsedRoleDragStart(e, role?.ruolo)}
                                onDrag={(e) => handleCollapsedRoleDrag(e, role?.ruolo)}
                                onDragEnd={(e) => handleCollapsedRoleDragEnd(e, role?.ruolo)}
                            >
                                <div className='d-flex gap-2 align-items-center'>
                                    <span className="drag-handle cursor-grab ms-2">
                                        <i className="bi bi-arrows-move" style={{ color: Color }}></i>
                                    </span>
                                    <span className="vr-line" style={{ backgroundColor: Color }}></span>
                                    <span style={{ color: Color }}>{role?.ruolo?.nome}</span>
                                </div>
                                <span
                                    onClick={() => handleExpandCard(role?.ruolo?.key)}
                                    className='cursor-pointer'
                                >
                                    <i className="bi bi-arrows-angle-expand fw-bold" style={{ color: Color }}></i>
                                </span>
                            </div>)
                        })}
                    </div>
                </div>
            )}
            <Toolbar
                openRoleModal={openRoleModal}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                MainData={MainData}
                visibleRoles={visibleRoles}
                setVisibleRoles={setVisibleRoles}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                hendelGenrateCode={hendelGenrateCode}
            />
            <div
                ref={containerRef}
                className="board"
                id='board'
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleCollapsedRoleDrop(e)}
            >
                <div
                    className="d-flex justify-content-around flex-wrap position-relative"
                    style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top left',
                        width: `${200 / zoomLevel}%`,
                        height: `${300 / zoomLevel}%`,
                    }}
                >
                    {MainData?.map((element, roleIndex) => {
                        const rDataID = dataID.roleId[`${element?.ruolo?.key}-${roleIndex}`]
                        return element?.ruolo && visibleRoles[element.ruolo.nome] ? (
                            !collapsedRoles.includes(element.ruolo.key) && (
                                <RoleCard
                                    key={element.ruolo.nome}
                                    dataID={dataID}
                                    element={element}
                                    visibleRoles={visibleRoles}
                                    shownStatuses={shownStatuses}
                                    setShownStatuses={setShownStatuses}
                                    associatedActions={
                                        shownStatuses[element.ruolo.nome] ? element.pulsantiAttivi?.[shownStatuses[element.ruolo.nome]] || {} : {}
                                    }
                                    collapsedCards={collapsedCards}
                                    draggingItem={draggingItem}
                                    setDraggingItem={setDraggingItem}
                                    setEpWorkflowjson={setEpWorkflowjson}
                                    MainData={MainData}
                                    openRoleModal={openRoleModal}
                                    handleCloneRole={handleCloneRole}
                                    setRoleToDelete={setRoleToDelete}
                                    setRoleDeleteConfirmation={setRoleDeleteConfirmation}
                                    setCollapsedCards={setCollapsedCards}
                                    openListItemModal={openListItemModal}
                                    openActionItemModal={openActionItemModal}
                                    openStatusItemModal={openStatusItemModal}
                                    openTitleItemModal={openTitleItemModal}
                                    drawConnections={drawConnections}
                                    setHoveredStatus={setHoveredStatus}
                                    setHoveredAction={setHoveredAction}
                                    refsMap={refsMap}
                                    dropdownToggleRefs={dropdownToggleRefs}
                                    hoveredStatus={hoveredStatus}
                                    hoveredAction={hoveredAction}
                                    updateCanvasSize={updateCanvasSize}
                                    zoomLevel={zoomLevel}
                                    containerRef={containerRef}
                                    isEditMode={isEditMode}
                                    setSelectedElement={setSelectedElement}
                                    selectedElement={selectedElement}
                                    clearLeaderLines={clearLeaderLines}
                                    createLeaderLine={createLeaderLine}
                                    leaderLinesRef={leaderLinesRef}
                                    onCollapse={handleCollapseCard}
                                    duplicateCount={duplicateCount}
                                    setDuplicateCount={setDuplicateCount}
                                    rDataID={rDataID}
                                />)
                        ) : null
                    }
                    )}


                </div>


                <ListItemModal
                    show={listItemModalShow}
                    currentDataId={currentDataId}
                    handleClose={() => {
                        setListItemModalShow(false);
                        setCurrentFaculty('');
                        setCurrentDataId(null);
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
                    currentDataId={currentDataId}
                    handleClose={() => {
                        setActionItemModalShow(false);
                        setCurrentFaculty('');
                        setCurrentDataId(null);
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
                    currentDataId={currentDataId}
                    handleClose={() => {
                        setStatusItemModalShow(false);
                        setCurrentFaculty('');
                        setCurrentDataId(null);
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
                    currentDataId={currentDataId}
                    handleClose={() => {
                        setTitleItemModalShow(false);
                        setCurrentFaculty('');
                        setSelectedTitle(null);
                        setCurrentDataId(null);
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
                    currentDataId={currentDataId}
                    initialData={selectedRoleItem ? selectedRoleItem : null}
                    handleClose={() => {
                        setRoleModalShow(false);
                        setSelectedRoleItem(null);
                        setCurrentDataId(null);
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
                    onClone={(data) =>
                        handleCloneRoleSubmit(roleToClone, data, MainData, setEpWorkflowjson, setCloneRoleModalShow, setRoleToClone, updateCanvasSize)
                    }
                    initialNome={roleToClone?.ruolo?.nome || ''}
                    roleToClone={roleToClone}
                />


                <DeleteConfirmationModal
                    show={roleDeleteConfirmation?.modal}
                    handleClose={() => {
                        setRoleDeleteConfirmation({ modal: false, value: null });
                        setRoleToDelete(null);
                    }}

                    handleConfirm={() => {
                        if (roleToDelete) {
                            handleDeleteRole(
                                roleToDelete,
                                MainData,
                                setEpWorkflowjson,
                                setShownStatuses,
                                setCollapsedCards,
                                updateCanvasSize
                            );
                        }
                        setRoleDeleteConfirmation({ modal: false, value: null });
                        setRoleToDelete(null);
                    }}
                    itemMessages={`Sei sicuro di voler eliminare il Ruolo`}
                    itemName={roleDeleteConfirmation?.value}
                    itemType="Ruolo"
                />
            </div>
        </div>
    );
}

export default View;