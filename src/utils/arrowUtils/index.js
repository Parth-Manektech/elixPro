// arrowUtils.js

export const drawSelectedElementArrows = (
    selectedElement,
    MainData,
    createLeaderLine,
    containerRef,
    refsMap // Add refsMap as a parameter
) => {
    const workflowIndex = MainData.length - 1;
    if (!MainData[workflowIndex]?.workflowmapping) return;

    const isElementVisible = (id) => {
        const element = document.getElementById(id);
        return element && element.offsetParent !== null;
    };

    if (selectedElement?.type === "list") {
        MainData[workflowIndex].workflowmapping.forEach((wf) => {
            if (
                wf.listeDestinazione.includes(selectedElement.itemKey) &&
                isElementVisible(wf.keyAzione) &&
                isElementVisible(selectedElement.itemKey)
            ) {
                createLeaderLine(
                    wf.keyAzione,
                    selectedElement.itemKey,
                    "rgba(41, 115, 147, 1)",
                    "behind",
                    "arrow2",
                    true,
                    containerRef
                );
            }
            if (
                wf.doNotlisteDestinazione.includes(selectedElement.itemKey) &&
                isElementVisible(wf.keyAzione) &&
                isElementVisible(selectedElement.itemKey)
            ) {
                createLeaderLine(
                    wf.keyAzione,
                    selectedElement.itemKey,
                    "rgba(202, 138, 4, 1)",
                    "square",
                    "square",
                    true,
                    containerRef
                );
            }
        });
    } else if (selectedElement?.type === "status") {
        MainData[workflowIndex].workflowmapping.forEach((wf) => {
            if (
                wf.statoDestinazione === selectedElement.statusItemKey &&
                isElementVisible(wf.keyAzione) &&
                isElementVisible(selectedElement.statusItemKey)
            ) {
                createLeaderLine(
                    wf.keyAzione,
                    selectedElement.statusItemKey,
                    "rgba(124, 195, 225, 1)",
                    "behind",
                    "arrow2",
                    true,
                    containerRef
                );
            }
        });
    } else if (selectedElement?.type === "action") {
        const wf = MainData[workflowIndex].workflowmapping.find(
            (item) => item.keyAzione === selectedElement.itemKey
        );
        if (wf) {
            if (
                wf.statoDestinazione &&
                isElementVisible(selectedElement.itemKey) &&
                isElementVisible(wf.statoDestinazione)
            ) {
                createLeaderLine(
                    selectedElement.itemKey,
                    wf.statoDestinazione,
                    "rgba(124, 195, 225, 1)",
                    "behind",
                    "arrow2",
                    true,
                    containerRef
                );
            }
            wf.listeDestinazione.forEach((listId) => {
                if (
                    isElementVisible(selectedElement.itemKey) &&
                    isElementVisible(listId)
                ) {
                    createLeaderLine(
                        selectedElement.itemKey,
                        listId,
                        "rgba(41, 115, 147, 1)",
                        "behind",
                        "arrow2",
                        true,
                        containerRef
                    );
                }
            });
            wf.doNotlisteDestinazione.forEach((listId) => {
                if (
                    isElementVisible(selectedElement.itemKey) &&
                    isElementVisible(listId)
                ) {
                    createLeaderLine(
                        selectedElement.itemKey,
                        listId,
                        "rgba(202, 138, 4, 1)",
                        "square",
                        "square",
                        true,
                        containerRef
                    );
                }
            });
        }
    }
};



export const clearHoverArrows = (leaderLinesRef) => {
    leaderLinesRef.current = leaderLinesRef.current.filter((entry) => {
        if (entry.type === "hover") {
            entry.line.remove();
            return false;
        }
        return true;
    });
};

export const drawHoverArrows = (
    elementType,
    itemKey,
    MainData,
    createLeaderLine,
    containerRef,
    leaderLinesRef
) => {
    const workflowIndex = MainData.length - 1;
    if (!MainData[workflowIndex]?.workflowmapping) return;

    if (elementType === "list") {
        MainData[workflowIndex].workflowmapping.forEach((wf) => {
            if (wf.listeDestinazione.includes(itemKey)) {
                const line = createLeaderLine(
                    wf.keyAzione,
                    itemKey,
                    "rgba(41, 115, 147, 0.25)",
                    "behind",
                    "arrow2",
                    false,
                    containerRef
                );
                if (line) leaderLinesRef.current.push({ line, type: "hover" });
            }
            if (wf.doNotlisteDestinazione.includes(itemKey)) {
                const line = createLeaderLine(
                    wf.keyAzione,
                    itemKey,
                    "rgba(202, 138, 4, 0.25)",
                    "square",
                    "square",
                    false,
                    containerRef
                );
                if (line) leaderLinesRef.current.push({ line, type: "hover" });
            }
        });
    } else if (elementType === "status") {
        MainData[workflowIndex].workflowmapping.forEach((wf) => {
            if (wf.statoDestinazione === itemKey) {
                const line = createLeaderLine(
                    wf.keyAzione,
                    itemKey,
                    "rgba(14, 165, 233, 0.25)",
                    "behind",
                    "arrow2",
                    false,
                    containerRef
                );
                if (line) leaderLinesRef.current.push({ line, type: "hover" });
            }
        });
    } else if (elementType === "action") {
        const wf = MainData[workflowIndex].workflowmapping.find(
            (item) => item.keyAzione === itemKey
        );
        if (wf) {
            if (wf.statoDestinazione) {
                const line = createLeaderLine(
                    itemKey,
                    wf.statoDestinazione,
                    "rgba(14, 165, 233, 0.25)",
                    "behind",
                    "arrow2",
                    false,
                    containerRef
                );
                if (line) leaderLinesRef.current.push({ line, type: "hover" });
            }
            wf.listeDestinazione.forEach((listId) => {
                const line = createLeaderLine(
                    itemKey,
                    listId,
                    "rgba(41, 115, 147, 0.25)",
                    "behind",
                    "arrow2",
                    false,
                    containerRef
                );
                if (line) leaderLinesRef.current.push({ line, type: "hover" });
            });
            wf.doNotlisteDestinazione.forEach((listId) => {
                const line = createLeaderLine(
                    itemKey,
                    listId,
                    "rgba(202, 138, 4, 0.25)",
                    "square",
                    "square",
                    false,
                    containerRef
                );
                if (line) leaderLinesRef.current.push({ line, type: "hover" });
            });
        }
    }
};

// debounce.js
export function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}