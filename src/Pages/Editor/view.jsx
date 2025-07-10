
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import LeaderLine from 'leader-line-new';

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

function View({ epWorkflowjson, setEpWorkflowjson, hendelGenrateCode }) {
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



    const handleCollapseCard = (role) => {
        console.log('role', role);
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

    const canvasRef = useRef(null);
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
                        colore: '#343a40',
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
    }, [MainData, setEpWorkflowjson]);


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

    const handleCloneRole = (role) => {
        setRoleToClone(role);
        setCloneRoleModalShow(true);
    };

    const updateCanvasSize = () => {
        setCanvasSize((prev) => ({ ...prev }));
    };

    useEffect(() => {
        if (isEditMode) {
            const result = findDuplicateKeys(MainData);
            console.log(result.message); // "1 list key and 2 status keys and 0 action keys are duplicate"
            console.log(result.result);
            if (result?.result?.actionDuplicateCount > 0 || result?.result?.listDuplicateCount > 0 || result?.result?.statusDuplicateCount > 0) {
                const TotalCount = result?.result?.actionDuplicateCount + result?.result?.listDuplicateCount + result?.result?.statusDuplicateCount
                DuplicateErrorToast(`Sono stati rilevati ${TotalCount * 2} errori di key duplicata.`)
            }
        }
    }, [isEditMode]);

    function findDuplicateKeys(jsonData) {
        // Initialize arrays to store keys
        const listKeys = [];
        const statusKeys = [];
        const actionKeys = [];

        // Helper function to count duplicates
        const countDuplicates = (keysArray) => {
            const keyCountMap = {};
            keysArray.forEach(key => {
                keyCountMap[key] = (keyCountMap[key] || 0) + 1;
            });
            const totalKeys = keysArray.length;
            const uniqueKeys = new Set(keysArray).size;
            return totalKeys - uniqueKeys; // Duplicates = total - unique
        };

        // Process each item in the JSON data
        jsonData.forEach(item => {
            if (item.ruolo) {
                // Extract list keys from liste[].listArray[].key
                if (item.liste && Array.isArray(item.liste)) {
                    item.liste.forEach(list => {
                        if (list.listArray && Array.isArray(list.listArray)) {
                            list.listArray.forEach(listItem => {
                                if (listItem.key) {
                                    listKeys.push(listItem.key);
                                }
                            });
                        }
                    });
                }

                // Extract status keys from pulsantiAttivi
                if (item.pulsantiAttivi && typeof item.pulsantiAttivi === 'object') {
                    Object.keys(item.pulsantiAttivi).forEach(statusKey => {
                        statusKeys.push(statusKey);
                    });
                }

                // Extract action keys from azioni[].listArray[].key
                if (item.azioni && Array.isArray(item.azioni)) {
                    item.azioni.forEach(action => {
                        if (action.listArray && Array.isArray(action.listArray)) {
                            action.listArray.forEach(actionItem => {
                                if (actionItem.key) {
                                    actionKeys.push(actionItem.key);
                                }
                            });
                        }
                    });
                }
            }
        });

        // Count duplicates for each category
        const listDuplicateCount = countDuplicates(listKeys);
        const statusDuplicateCount = countDuplicates(statusKeys);
        const actionDuplicateCount = countDuplicates(actionKeys);

        // Create formatted message
        const message = `${listDuplicateCount} list key${listDuplicateCount !== 1 ? 's' : ''} and ${statusDuplicateCount} status key${statusDuplicateCount !== 1 ? 's' : ''} and ${actionDuplicateCount} action key${actionDuplicateCount !== 1 ? 's' : ''} are duplicate`;

        // Return result object
        return {
            message,
            result: {
                listDuplicateCount,
                statusDuplicateCount,
                actionDuplicateCount
            }
        };
    }


    return (
        <div style={{ position: 'relative' }}>
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
                            {collapsedRoles.length > 0 && collapsedRoles.length < MainData.length
                                ? 'Collassa tutti'
                                : 'Espandi tutti'}
                        </a>
                    </div>
                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Cerca ruolo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="collapsed-roles-container">
                        {filteredCollapsedRoles.map((role) => {
                            return (<div key={role?.ruolo?.key}
                                style={{ backgroundColor: role.ruolo?.colore || '#6f42c1', }}
                                className="collapsed-role">
                                <div className='d-flex gap-2 align-items-center'>
                                    <span className="drag-handle ms-2">
                                        <i className="bi bi-arrows-move"></i>
                                    </span>

                                    <span className="vr-line bg-secondary"></span>
                                    <span className="role-name">{role?.ruolo?.nome}</span>
                                </div>


                                <span
                                    onClick={() => handleExpandCard(role?.ruolo?.key)}
                                >
                                    <i className="bi bi-arrows-angle-expand text-dark fw-bold"></i>
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
                className="editor-visualization"
                style={{ position: 'relative', width: '100%', overflow: 'auto' }}
            >
                <div
                    className="d-flex justify-content-around flex-wrap"
                    style={{
                        position: 'relative',
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top left',
                        width: `${250 / zoomLevel}%`,
                        height: `${280 / zoomLevel}%`,
                    }}
                >
                    {MainData?.map((element) =>
                        element?.ruolo && visibleRoles[element.ruolo.nome] ? (
                            !collapsedRoles.includes(element.ruolo.key) && (
                                <RoleCard
                                    key={element.ruolo.nome}
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
                                />)
                        ) : null
                    )}


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