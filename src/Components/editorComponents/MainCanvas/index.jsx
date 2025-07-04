
import React, { useEffect, useCallback } from 'react';

function MainCanvas({ canvasRef, containerRef, canvasSize, setCanvasSize, zoomLevel, MainData, collapsedCards, refsMap, drawConnections }) {
    const updateCanvasSize = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const maxWidth = Math.max(
            container.scrollWidth,
            ...MainData.map((role) => {
                const roleName = role.ruolo?.nome;
                const width = collapsedCards[roleName] ? 350 : role.layout?.width || 350;
                return ((role.layout?.left || 0) + width) * zoomLevel;
            })
        );
        const maxHeight = Math.max(
            container.scrollHeight,
            ...MainData.map((role) => {
                const roleName = role.ruolo?.nome;
                const height = collapsedCards[roleName] ? 50 : role.layout?.height || 690;
                return ((role.layout?.top || 0) + height) * zoomLevel;
            })
        );

        setCanvasSize((prev) => {
            if (prev.width !== maxWidth || prev.height !== maxHeight) {
                return { width: maxWidth, height: maxHeight };
            }
            return prev;
        });
    }, [MainData, zoomLevel, collapsedCards, containerRef, setCanvasSize]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvasSize.width * zoomLevel;
            canvas.height = canvasSize.height * zoomLevel;
            canvas.style.width = `${canvasSize.width}px`;
            canvas.style.height = `${canvasSize.height}px`;
            const ctx = canvas.getContext('2d');
            ctx.scale(zoomLevel, zoomLevel);
            drawConnections([]); // Clear canvas initially
        }
        updateCanvasSize();
    }, [canvasRef, canvasSize, zoomLevel, drawConnections, updateCanvasSize]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                zIndex: 1000,
                pointerEvents: 'none',
            }}
        />
    );
}

export default MainCanvas;