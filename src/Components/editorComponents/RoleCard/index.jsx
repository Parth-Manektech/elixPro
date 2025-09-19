import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { CardResizer, ArrowMove, ThreeDotsIcon } from '../../../Assets/SVGs';

import ListSection from './ListSection';
import StatusSection from './StatusSection';
import ActionSection from './ActionSection';
import { debounce } from '../../../utils/arrowUtils';

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
    const initialTop = element.layout?.top || 0;
    const initialLeft = element.layout?.left || 0;
    const initialWidth = element.layout?.width || 350;
    // Fixed height as per original code
    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const resizingRoleRef = useRef(null);
    const originalPositionsRef = useRef({});
    const [contrastColor, setContrastColor] = useState("");
    const [tempPosition, setTempPosition] = useState({ top: initialTop, left: initialLeft });
    const [tempColor, setTempColor] = useState(element.ruolo?.colore || '#6f42c1');
    const [tempWidth, setTempWidth] = useState(initialWidth);

    const handleCollapseClick = () => {
        onCollapse(element?.ruolo);
    };

    const handleRoleCardDragStart = useCallback((e) => {
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

        originalPositionsRef.current[roleName] = {
            top: initialTop,
            left: initialLeft,
            width: initialWidth,
            height: element.layout?.height || 690,
        };
    }, [roleName, setDraggingItem, initialTop, initialLeft, initialWidth]);

    const handleRoleCardDrag = useCallback((e) => {
        if (!draggingItem || draggingItem.type !== 'role' || e.clientX === 0 || e.clientY === 0) return;

        const deltaX = (e.clientX - dragStartPosRef.current.x) / zoomLevel;
        const deltaY = (e.clientY - dragStartPosRef.current.y) / zoomLevel;

        const originalTop = originalPositionsRef.current[roleName]?.top || 0;
        const originalLeft = originalPositionsRef.current[roleName]?.left || 0;

        const newTop = Math.max(0, Math.round((originalTop + deltaY) / 20) * 20);
        const newLeft = Math.max(0, Math.round((originalLeft + deltaX) / 20) * 20);

        setTempPosition({ top: newTop, left: newLeft });
    }, [draggingItem, roleName, zoomLevel]);

    const handleRoleCardDrop = useCallback((e) => {
        e.preventDefault();
        if (!draggingItem || draggingItem.type !== 'role') return;

        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex((r) => r.ruolo?.nome === roleName);
        if (roleIndex === -1) return;

        const currentLayout = updatedData[roleIndex].layout;
        const original = originalPositionsRef.current[roleName];

        if (original && Math.abs(currentLayout.top - original.top) < 10 && Math.abs(currentLayout.left - original.left) < 10) {
            updatedData[roleIndex].layout = {
                ...currentLayout,
                top: tempPosition.top,
                left: tempPosition.left,
                width: tempWidth,
                height: original.height,
            };
        }

        setEpWorkflowjson(JSON.stringify(updatedData));
        setDraggingItem(null);
        delete originalPositionsRef.current[roleName];
    }, [draggingItem, roleName, tempPosition, MainData, setEpWorkflowjson, setDraggingItem]);

    const handleRoleCardDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);



    const handleResizeStart = useCallback((e) => {
        if (!e.target.closest('.resize-handle')) {
            console.warn('Resize start aborted: Not a resize handle', e.target);
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        resizingRoleRef.current = roleName;
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };


        originalPositionsRef.current[roleName] = {
            top: initialTop,
            left: initialLeft,
            width: initialWidth,
            height: element.layout?.height || 690,
        };

        document.body.style.cursor = 'e-resize';
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', handleResizeStop);
    }, [roleName, initialTop, initialLeft, initialWidth]);

    const handleResize = useCallback((e) => {
        if (!resizingRoleRef.current || e.clientX === 0 || e.clientY === 0) {
            document.removeEventListener('mousemove', handleResize);
            return;
        }

        const deltaX = (e.clientX - dragStartPosRef.current.x) / zoomLevel;
        const originalWidth = originalPositionsRef.current[roleName]?.width;

        const newWidth = Math.max(200, originalWidth + deltaX);

        setTempWidth(newWidth);
    }, [roleName, zoomLevel]);

    const handleResizeStop = useCallback(() => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeStop);

        if (!resizingRoleRef.current) {
            console.warn('Resize stop called with no resizing role');
            return;
        }

        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex((r) => r.ruolo?.nome === roleName);
        if (roleIndex === -1) {
            console.error('Role not found during resize:', roleName);
            resizingRoleRef.current = null;
            return;
        }
        const currentLayout = updatedData[roleIndex].layout

        updatedData[roleIndex].layout = {
            ...currentLayout,
            width: tempWidth,
        };

        setEpWorkflowjson(JSON.stringify(updatedData));
        resizingRoleRef.current = null;
        document.body.style.cursor = 'auto';
    }, [roleName, tempWidth, MainData, setEpWorkflowjson]);

    // Create the debounced function only once
    const debouncedColorUpdate = useCallback(
        debounce((newColor) => {
            const updatedData = [...MainData];
            const roleIndex = updatedData.findIndex((r) => r.ruolo?.nome === roleName);
            if (roleIndex !== -1) {
                updatedData[roleIndex].ruolo = {
                    ...updatedData[roleIndex].ruolo,
                    colore: newColor,
                };
                setEpWorkflowjson(JSON.stringify(updatedData));
            }
        }, 800),
        [MainData, roleName, setEpWorkflowjson]
    );

    const handleColorChange = (e) => {
        const newColor = e.target.value;
        setTempColor(newColor);
        debouncedColorUpdate(newColor);
    }

    useEffect(() => {
        setTempColor(element.ruolo?.colore || '#6f42c1');
        setTempWidth(initialWidth);
        setTempPosition({ top: initialTop, left: initialLeft });
    }, [element.ruolo?.colore, initialWidth, initialTop, initialLeft]);

    useEffect(() => {
        function isColorLight(hexColor) {
            const hex = hexColor.replace("#", "");
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
            return luminance > 140;
        }
        const isLight = isColorLight(tempColor || "#343a40");
        setContrastColor(isLight ? "#212529" : "#f8f9fa");
    }, [tempColor])
    return (
        <div
            key={roleName}
            className="draggable-card"
            id={element.ruolo.key}
            data-id={rDataID}
            ref={(el) => (refsMap.current[element.ruolo.key] = el)}
            style={{
                position: 'absolute',
                top: `${tempPosition.top}px`,
                left: `${tempPosition.left}px`,
                width: `${tempWidth}px`,
                background: draggingItem?.type === 'role' && draggingItem?.roleName === roleName ? '#f0f0f0' : 'white',
            }}
        >
            <Card>
                <Card.Header
                    style={{ backgroundColor: tempColor }}
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
                                {collapsedCards[roleName] ? <i className="bi bi-chevron-down" style={{ color: contrastColor }}></i> : <i className="bi bi-chevron-up" style={{ color: contrastColor }}></i>}
                            </span>
                        </div>
                    </div>

                    <div className="d-flex gap-2 align-items-center justify-content-center">
                        <div className='role-toggle-button ms-1 cursor-pointer'>
                            <span onClick={handleCollapseClick}>
                                <i className="bi bi-arrows-angle-contract" style={{ color: contrastColor }}></i>
                            </span>
                        </div>

                        {isEditMode && (
                            <input
                                type="color"
                                className='ColorInput  form-control-color'
                                style={{ border: `1px solid ${contrastColor}` }}
                                value={tempColor}
                                onChange={handleColorChange}
                            />
                        )}

                        {isEditMode && (
                            <Dropdown>
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
                            </Dropdown>
                        )}
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
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            cursor: 'e-resize',
                            width: '16px',
                            height: '16px',
                        }}
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