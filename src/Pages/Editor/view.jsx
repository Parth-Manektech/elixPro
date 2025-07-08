
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
import MainCanvas from '../../Components/editorComponents/MainCanvas';
import RoleCard from '../../Components/editorComponents/RoleCard';

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
        (connections) => {
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

                const startRole = getRoleForElement(MainData, startId);
                const endRole = getRoleForElement(MainData, endId);
                if (collapsedCards[startRole] || collapsedCards[endRole]) return;

                const startRect = startElement.getBoundingClientRect();
                const endRect = endElement.getBoundingClientRect();

                let fromX =
                    startRect.left < endRect.left
                        ? startRect.right - containerRect.left + scrollLeft
                        : startRect.left - containerRect.left + scrollLeft;
                const fromY = startRect.top + startRect.height / 2 - containerRect.top + scrollTop;
                let toX =
                    startRect.left < endRect.left
                        ? endRect.left - containerRect.left + scrollLeft
                        : endRect.right - containerRect.left + scrollLeft;
                const toY = endRect.top + endRect.height / 2 - containerRect.top + scrollTop;

                drawArrow(ctx, fromX / zoomLevel, fromY / zoomLevel, toX / zoomLevel, toY / zoomLevel, color, zoomLevel);
            });

            ctx.restore();
        },
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
                        colore: '#00ccff',
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

    return (
        <>
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
                {/* <MainCanvas
                    canvasRef={canvasRef}
                    containerRef={containerRef}
                    canvasSize={canvasSize}
                    setCanvasSize={setCanvasSize}
                    zoomLevel={zoomLevel}
                    MainData={MainData}
                    collapsedCards={collapsedCards}
                    refsMap={refsMap}
                    drawConnections={drawConnections}
                /> */}
                <div
                    className="d-flex justify-content-around flex-wrap"
                    style={{
                        position: 'relative',
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top left',
                        width: `${100 / zoomLevel}%`,
                        height: `${100 / zoomLevel}%`,
                    }}
                >
                    {MainData?.map((element) =>
                        element?.ruolo && visibleRoles[element.ruolo.nome] ? (
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
                            />
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
        </>
    );
}

export default View;