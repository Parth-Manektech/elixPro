import React, { useEffect, useRef, useState } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { CardResizer, ArrowMove, ThreeDotsIcon } from '../../../Assets/SVGs';

import ListSection from './ListSection';
import StatusSection from './StatusSection';
import ActionSection from './ActionSection';


function RoleCard({
    element,
    shownStatuses,
    setShownStatuses,
    associatedActions,
    collapsedCards,
    draggingItem,
    setDraggingItem,
    setEpWorkflowjson,
    MainData,
    openRoleModal,
    handleCloneRole,
    setRoleToDelete,
    setRoleDeleteConfirmation,
    setCollapsedCards,
    openListItemModal,
    openActionItemModal,
    openStatusItemModal,
    openTitleItemModal,
    refsMap,
    dropdownToggleRefs,
    zoomLevel,
    isEditMode,
    containerRef,
    selectedElement,
    setSelectedElement,
    clearLeaderLines,
    createLeaderLine,
    leaderLinesRef,
    onCollapse,
    rDataID,
    dataID
}) {
    const roleName = element.ruolo.nome;
    const top = element.layout?.top || 0;
    const left = element.layout?.left || 0;
    const width = element.layout?.width || 350;
    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const resizingRoleRef = useRef(null);
    const originalPositionsRef = useRef({});
    const [contrastColor, setContrastColor] = useState("")

    const handleCollapseClick = () => {
        onCollapse(element?.ruolo);
    };

    const handleRoleCardDragStart = (e) => {
        if (
            e.target.closest(
                '.list-item, .status-item, .action-item, .catLista-header, .catAzione-header, .plus-icon'
            )
        ) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        setDraggingItem({ type: 'role', roleName });
        e.dataTransfer.setData('roleName', roleName);
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };

        const role = MainData.find((r) => r.ruolo?.nome === roleName);
        originalPositionsRef.current[roleName] = {
            top: role.layout?.top || 0,
            left: role.layout?.left || 0,
            width: role.layout?.width || 350,
            height: role.layout?.height || 690,
        };
    };


    function handleRoleCardDrag(e) {
        if (!draggingItem || draggingItem.type !== 'role') return;

        if (e.clientX === 0 && e.clientY === 0) return;

        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex((r) => r.ruolo?.nome === roleName);
        const currentLayout = updatedData[roleIndex].layout || { top: 0, left: 0, width: 350, height: 690 };

        const deltaX = (e.clientX - dragStartPosRef.current.x) / zoomLevel;
        const deltaY = (e.clientY - dragStartPosRef.current.y) / zoomLevel;

        const originalTop = originalPositionsRef.current[roleName]?.top || 0;
        const originalLeft = originalPositionsRef.current[roleName]?.left || 0;

        let newTop = Math.max(0, Math.round((originalTop + deltaY) / 20) * 20);
        let newLeft = Math.max(0, Math.round((originalLeft + deltaX) / 20) * 20);

        updatedData[roleIndex].layout = {
            ...currentLayout,
            top: newTop,
            left: newLeft,
        };

        setEpWorkflowjson(JSON.stringify(updatedData));
    }


    const handleRoleCardDrop = (e) => {
        e.preventDefault();
        if (!draggingItem || draggingItem.type !== 'role') return;

        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex((r) => r.ruolo?.nome === roleName);
        const currentLayout = updatedData[roleIndex].layout;
        const original = originalPositionsRef.current[roleName];

        if (original && Math.abs(currentLayout.top - original.top) < 10 && Math.abs(currentLayout.left - original.left) < 10) {
            updatedData[roleIndex].layout = {
                ...currentLayout,
                top: original.top,
                left: original.left,
                width: original.width,
                height: original.height,
            };
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setDraggingItem(null);
        delete originalPositionsRef.current[roleName];
    };


    const handleRoleCardDragOver = (e) => {
        e.preventDefault();
    };


    const handleResizeStart = (e) => {
        if (!e.target.closest('.resize-handle')) {
            console.warn('Resize start aborted: Not a resize handle', e.target);
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        resizingRoleRef.current = roleName;
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };

        const role = MainData.find((r) => r.ruolo?.nome === roleName);
        if (!role) {
            console.error('Role not found:', roleName);
            resizingRoleRef.current = null;
            return;
        }

        originalPositionsRef.current[roleName] = {
            top: role.layout?.top || 0,
            left: role.layout?.left || 0,
            width: role.layout?.width || 350,
            height: role.layout?.height || 690,
        };

        document.body.style.cursor = 'w-resize'; // Set cursor to w-resize globally
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', handleResizeStop);
    };


    const handleResize = (e) => {
        if (!resizingRoleRef.current) {
            console.warn('Resize aborted: No resizing role');
            document.removeEventListener('mousemove', handleResize);
            return;
        }

        if (e.clientX === 0 && e.clientY === 0) {
            console.warn('Invalid mouse event:', { clientX: e.clientX, clientY: e.clientY });
            return;
        }

        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex((r) => r.ruolo?.nome === roleName);
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
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    };


    const handleResizeStop = () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeStop);

        if (!resizingRoleRef.current) {
            console.warn('Resize stop called with no resizing role');
            return;
        }

        resizingRoleRef.current = null;
        document.body.style.cursor = 'auto'; // Reset cursor to default
    };

    useEffect(() => {
        function isColorLight(hexColor) {
            const hex = hexColor.replace("#", "");
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
            return luminance > 140;
        }
        const isLight = isColorLight(element.ruolo?.colore ? element.ruolo?.colore : "#343a40");
        if (isLight) {
            setContrastColor("#212529")
        } else {
            setContrastColor("#f8f9fa")
        }
        //eslint-disable-next-line
    }, [MainData])

    return (
        <div
            key={roleName}
            className="draggable-card"
            id={element.ruolo.key}
            data-id={rDataID}
            ref={(el) => (refsMap.current[element.ruolo.key] = el)}
            style={{
                top: `${top}px`,
                left: `${left}px`,
                width: `${width}px`,
                background: draggingItem?.type === 'role' && draggingItem?.roleName === roleName ? '#f0f0f0' : 'white',
            }}
        >
            <Card>
                <Card.Header
                    style={{ backgroundColor: element.ruolo?.colore || '#343a40' }}
                    className='d-flex align-items-center justify-content-between position-relative cursor-default'
                >
                    <div className='d-flex align-items-center gap-2'>
                        <span className='d-flex align-items-center cursor-grab'
                            draggable
                            onDragStart={handleRoleCardDragStart}
                            onDrag={handleRoleCardDrag}
                            onDragEnd={handleRoleCardDrop}
                            onDragOver={handleRoleCardDragOver}
                        >
                            <ArrowMove width={25} height={25} fill={contrastColor} />
                        </span>
                        <span className='vr-line' style={{ backgroundColor: contrastColor }}></span>
                        <span className='cursor-text text-start' style={{ color: contrastColor }}>
                            {element.ruolo.nome}
                        </span>

                        <div className='role-toggle-button'>
                            <span
                                className="cursor-pointer"
                                onClick={() => {
                                    setCollapsedCards((prev) => {
                                        const isCollapsed = !prev[roleName];
                                        return { ...prev, [roleName]: isCollapsed };
                                    });
                                }}
                            >
                                {collapsedCards[roleName] ? <i class="bi bi-chevron-down" style={{ color: contrastColor }}></i> : <i class="bi bi-chevron-up" style={{ color: contrastColor }}></i>}
                            </span>
                        </div>
                    </div>


                    <div className="d-flex gap-2 align-items-center justify-content-center">
                        <div className='role-toggle-button ms-1 cursor-pointer'>
                            <span
                                onClick={handleCollapseClick}
                            >
                                <i className="bi bi-arrows-angle-contract" style={{ color: contrastColor }}></i>
                            </span>
                        </div>

                        {isEditMode && <input
                            type="color"
                            className='ColorInput'
                            style={{ border: `1px solid ${contrastColor}` }}
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
                        />}


                        {isEditMode && <Dropdown>
                            <Dropdown.Toggle className="menu-btn-list" ref={(el) => (dropdownToggleRefs.current[roleName] = el)}>
                                <ThreeDotsIcon fill={contrastColor} className='mb-1' height={20} width={20} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className='darshan'>
                                <Dropdown.Item
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openRoleModal(element?.ruolo, rDataID);
                                        dropdownToggleRefs.current[roleName]?.click();
                                    }}
                                >
                                    <i className='bi bi-pencil me-2' /> Modifica
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCloneRole(element);
                                        dropdownToggleRefs.current[roleName]?.click();
                                    }}
                                >
                                    <i className='bi bi-files me-2' /> Clona
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setRoleToDelete(roleName);
                                        setRoleDeleteConfirmation({ modal: true, value: element.ruolo.nome });
                                        dropdownToggleRefs.current[roleName]?.click();
                                    }}
                                    className='text-danger'
                                >
                                    <i className='bi bi-trash me-2' /> Elimina
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>}
                    </div>
                </Card.Header>

                <Card.Body style={{ display: collapsedCards[roleName] ? 'none' : 'block', overflow: 'auto' }}>
                    <div className="d-flex gap-2 w-100">
                        <ListSection
                            liste={element.liste}
                            roleName={roleName}
                            openListItemModal={openListItemModal}
                            openTitleItemModal={openTitleItemModal}
                            MainData={MainData}
                            draggingItem={draggingItem}
                            setDraggingItem={setDraggingItem}
                            setEpWorkflowjson={setEpWorkflowjson}
                            refsMap={refsMap}
                            isEditMode={isEditMode}
                            containerRef={containerRef}
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            clearLeaderLines={clearLeaderLines}
                            createLeaderLine={createLeaderLine}
                            leaderLinesRef={leaderLinesRef}
                            element={element}
                            dataID={dataID}
                        />
                        <StatusSection
                            pulsantiAttivi={element.pulsantiAttivi}
                            element={element}
                            roleName={roleName}
                            setShownStatuses={setShownStatuses}
                            openStatusItemModal={openStatusItemModal}
                            MainData={MainData}
                            draggingItem={draggingItem}
                            setDraggingItem={setDraggingItem}
                            setEpWorkflowjson={setEpWorkflowjson}
                            refsMap={refsMap}
                            isEditMode={isEditMode}
                            containerRef={containerRef}
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            clearLeaderLines={clearLeaderLines}
                            createLeaderLine={createLeaderLine}
                            leaderLinesRef={leaderLinesRef}
                            dataID={dataID}
                        />
                        <ActionSection
                            azioni={element.azioni}
                            roleName={roleName}
                            shownStatus={shownStatuses[roleName]}
                            associatedActions={associatedActions}
                            openActionItemModal={openActionItemModal}
                            openTitleItemModal={openTitleItemModal}
                            MainData={MainData}
                            draggingItem={draggingItem}
                            setDraggingItem={setDraggingItem}
                            setEpWorkflowjson={setEpWorkflowjson}
                            refsMap={refsMap}
                            isEditMode={isEditMode}
                            containerRef={containerRef}
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            clearLeaderLines={clearLeaderLines}
                            createLeaderLine={createLeaderLine}
                            leaderLinesRef={leaderLinesRef}
                            element={element}
                            dataID={dataID}
                        />
                    </div>
                </Card.Body>

                {!collapsedCards[roleName] && (
                    <div
                        className="resize-handle"
                        onMouseDown={handleResizeStart}
                    >
                        <CardResizer height={16} width={16} />
                    </div>
                )}
            </Card>
        </div>
    );
}

export default RoleCard;