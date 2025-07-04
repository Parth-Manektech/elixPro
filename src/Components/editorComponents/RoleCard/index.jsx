import React, { useRef } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { CardResizer, ArrowMove, ChevronDown, ChevronUp, ThreeDotsIcon } from '../../../Assets/SVGs';

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
    drawConnections,
    setHoveredStatus,
    setHoveredAction,
    refsMap,
    dropdownToggleRefs,
    hoveredStatus,
    hoveredAction,
    updateCanvasSize,
    zoomLevel,
    isEditMode
}) {
    const roleName = element.ruolo.nome;
    const top = element.layout?.top || 0;
    const left = element.layout?.left || 0;
    const width = element.layout?.width || 350;
    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const resizingRoleRef = useRef(null);
    const originalPositionsRef = useRef({});

    const handleRoleCardDragStart = (e) => {
        if (
            e.target.closest(
                '.listeArrayItem, .StatusItemTitle, .azioniArrayItem, .listeItemTitle, .azioniItemTitle, .CardStatusTitle, .plus-icon'
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


    const handleRoleCardDrag = (e) => {
        if (!draggingItem || draggingItem.type !== 'role') return;

        if (e.clientX === 0 && e.clientY === 0) return;

        const updatedData = [...MainData];
        const roleIndex = updatedData.findIndex((r) => r.ruolo?.nome === roleName);
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
        updateCanvasSize();
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
        updateCanvasSize();
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
        updateCanvasSize();
    };


    return (
        <div
            key={roleName}

            className="mb-3 d-flex justify-content-between flex-wrap Editor_Card"
            style={{
                position: 'absolute',
                top: `${top}px`,
                left: `${left}px`,
                width: collapsedCards[roleName] ? `${width}px` : `${width}px`,
                height: collapsedCards[roleName] ? 'fit-content' : 'fit-content',
                opacity: 1,
                background: draggingItem?.type === 'role' && draggingItem?.roleName === roleName ? '#f0f0f0' : 'white',
            }}
        >
            <Card style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Card.Header
                    style={{
                        position: 'relative',
                        backgroundColor: element.ruolo?.colore || '#6f42c1',
                    }}
                    className='d-flex align-items-center justify-content-between'
                >
                    <div className='d-flex align-items-center gap-2'>
                        <span className='d-flex align-items-center cursor-move'
                            draggable
                            onDragStart={handleRoleCardDragStart}
                            onDrag={handleRoleCardDrag}
                            onDragEnd={handleRoleCardDrop}
                            onDragOver={handleRoleCardDragOver}
                        >
                            <ArrowMove width={25} height={25} />
                        </span>
                        <span className='vr-line' style={{ backgroundColor: '#212529' }}></span>
                        <span>
                            {element.ruolo.nome}
                        </span>
                        <span
                            className="cursor-pointer"
                            onClick={() => {
                                setCollapsedCards((prev) => {
                                    const isCollapsed = !prev[roleName];
                                    return { ...prev, [roleName]: isCollapsed };
                                });
                            }}
                        >
                            {collapsedCards[roleName] ? <ChevronDown height={20} width={20} /> : <ChevronUp height={20} width={20} />}
                        </span>
                    </div>


                    <div className="d-flex gap-3 align-items-center justify-content-center">
                        {isEditMode && <input
                            type="color"
                            className='ColorInput'
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
                            <Dropdown.Toggle className="role_menu" ref={(el) => (dropdownToggleRefs.current[roleName] = el)}>
                                <ThreeDotsIcon className='mb-1' height={20} width={20} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className='darshan'>
                                <Dropdown.Item
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openRoleModal(element?.ruolo);
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
                            drawConnections={drawConnections}
                            setHoveredStatus={setHoveredStatus}
                            setHoveredAction={setHoveredAction}
                            MainData={MainData}
                            draggingItem={draggingItem}
                            setDraggingItem={setDraggingItem}
                            setEpWorkflowjson={setEpWorkflowjson}
                            refsMap={refsMap}
                            isEditMode={isEditMode}
                        />
                        <StatusSection
                            pulsantiAttivi={element.pulsantiAttivi}
                            roleName={roleName}
                            shownStatus={shownStatuses[roleName]}
                            setShownStatuses={setShownStatuses}
                            openStatusItemModal={openStatusItemModal}
                            drawConnections={drawConnections}
                            setHoveredStatus={setHoveredStatus}
                            setHoveredAction={setHoveredAction}
                            MainData={MainData}
                            draggingItem={draggingItem}
                            setDraggingItem={setDraggingItem}
                            setEpWorkflowjson={setEpWorkflowjson}
                            hoveredStatus={hoveredStatus}
                            refsMap={refsMap}
                            isEditMode={isEditMode}
                        />
                        <ActionSection
                            azioni={element.azioni}
                            roleName={roleName}
                            shownStatus={shownStatuses[roleName]}
                            associatedActions={associatedActions}
                            openActionItemModal={openActionItemModal}
                            openTitleItemModal={openTitleItemModal}
                            drawConnections={drawConnections}
                            setHoveredAction={setHoveredAction}
                            setHoveredStatus={setHoveredStatus}
                            MainData={MainData}
                            draggingItem={draggingItem}
                            setDraggingItem={setDraggingItem}
                            setEpWorkflowjson={setEpWorkflowjson}
                            hoveredAction={hoveredAction}
                            refsMap={refsMap}
                            isEditMode={isEditMode}
                        />
                    </div>
                </Card.Body>

                {!collapsedCards[roleName] && (
                    <div
                        className="resize-handle"
                        onMouseDown={handleResizeStart}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            width: '20px',
                            height: '20px',
                            background: 'transparent',
                            cursor: 'se-resize',
                        }}
                    >
                        <CardResizer height={20} width={20} />
                    </div>
                )}
            </Card>
        </div>
    );
}

export default RoleCard;