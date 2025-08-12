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
                const ActionElement = MainData.find(item =>
                    item.azioni?.some(azione =>
                        azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                    )
                );
                createLeaderLine(
                    `${ActionElement?.ruolo?.key}_${wf.keyAzione}`,
                    selectedElement.data_id,
                    "rgba(41, 115, 147, 1)",
                    "behind",
                    "arrow2",
                    true,
                    containerRef
                );
            } else if (
                wf.listeDestinazione.includes(selectedElement.itemKey) &&
                !isElementVisible(wf.keyAzione) &&
                isElementVisible(selectedElement.itemKey)
            ) {
                const ActionElement = MainData.find(item =>
                    item.azioni?.some(azione =>
                        azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                    )
                );
                createLeaderLine(
                    `${ActionElement?.ruolo?.key}`,
                    selectedElement.data_id,
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
                const ActionElement = MainData.find(item =>
                    item.azioni?.some(azione =>
                        azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                    )
                );
                createLeaderLine(
                    `${ActionElement?.ruolo?.key}_${wf.keyAzione}`,
                    selectedElement.data_id,
                    "rgba(202, 138, 4, 1)",
                    "square",
                    "square",
                    true,
                    containerRef
                );
            } else if (
                wf.doNotlisteDestinazione.includes(selectedElement.itemKey) &&
                !isElementVisible(wf.keyAzione) &&
                isElementVisible(selectedElement.itemKey)
            ) {
                const ActionElement = MainData.find(item =>
                    item.azioni?.some(azione =>
                        azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                    )
                );
                createLeaderLine(
                    `${ActionElement?.ruolo?.key}`,
                    selectedElement.data_id,
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
                const ActionElement = MainData.find(item =>
                    item.azioni?.some(azione =>
                        azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                    )
                );
                createLeaderLine(
                    `${ActionElement?.ruolo?.key}_${wf.keyAzione}`,
                    selectedElement.data_id,
                    "rgba(124, 195, 225, 1)",
                    "behind",
                    "arrow2",
                    true,
                    containerRef
                );
            } else if (
                wf.statoDestinazione === selectedElement.statusItemKey &&
                !isElementVisible(wf.keyAzione) &&
                isElementVisible(selectedElement.statusItemKey)
            ) {
                const ActionElement = MainData.find(item =>
                    item.azioni?.some(azione =>
                        azione.listArray?.some(listItem => listItem.key === wf.keyAzione)
                    )
                );
                createLeaderLine(
                    `${ActionElement?.ruolo?.key}`,
                    selectedElement.data_id,
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
                const StatusElement = MainData.find(item =>
                    Object.keys(item?.pulsantiAttivi || {}).some(key => key === wf.statoDestinazione)
                );
                createLeaderLine(
                    selectedElement.data_id,
                    `${StatusElement?.ruolo?.key}_${wf.statoDestinazione}`,
                    "rgba(124, 195, 225, 1)",
                    "behind",
                    "arrow2",
                    true,
                    containerRef
                );
            } else if (
                wf.statoDestinazione &&
                isElementVisible(selectedElement.itemKey) &&
                !isElementVisible(wf.statoDestinazione)
            ) {
                const StatusElement = MainData.find(item =>
                    Object.keys(item?.pulsantiAttivi || {}).some(key => key === wf.statoDestinazione)
                );
                createLeaderLine(
                    selectedElement.data_id,
                    `${StatusElement?.ruolo?.key}`,
                    "rgba(124, 195, 225, 1)",
                    "behind",
                    "arrow2",
                    true,
                    containerRef
                );
            }



            if (wf.listeDestinazione) {
                wf.listeDestinazione.forEach((listId) => {
                    if (
                        isElementVisible(selectedElement.itemKey) &&
                        isElementVisible(listId)
                    ) {
                        const ListElement = MainData.find(item =>
                            item.liste?.some(liste =>
                                liste.listArray?.some(listItem => listItem.key === listId)
                            )
                        );
                        createLeaderLine(
                            selectedElement.data_id,
                            `${ListElement?.ruolo?.key}_${listId}`,
                            "rgba(41, 115, 147, 1)",
                            "behind",
                            "arrow2",
                            true,
                            containerRef
                        );
                    } else if (
                        isElementVisible(selectedElement.itemKey) &&
                        !isElementVisible(listId)
                    ) {
                        const ListElement = MainData.find(item =>
                            item.liste?.some(liste =>
                                liste.listArray?.some(listItem => listItem.key === listId)
                            )
                        );
                        createLeaderLine(
                            selectedElement.data_id,
                            `${ListElement?.ruolo?.key}`,
                            "rgba(41, 115, 147, 1)",
                            "behind",
                            "arrow2",
                            true,
                            containerRef
                        );
                    }
                });
            }

            if (wf.doNotlisteDestinazione) {
                wf.doNotlisteDestinazione.forEach((listId) => {
                    if (
                        isElementVisible(selectedElement.itemKey) &&
                        isElementVisible(listId)
                    ) {
                        const ListElement = MainData.find(item =>
                            item.liste?.some(liste =>
                                liste.listArray?.some(listItem => listItem.key === listId)
                            )
                        );
                        createLeaderLine(
                            selectedElement.data_id,
                            `${ListElement?.ruolo?.key}_${listId}`,
                            "rgba(202, 138, 4, 1)",
                            "square",
                            "square",
                            true,
                            containerRef
                        );
                    } else if (
                        isElementVisible(selectedElement.itemKey) &&
                        !isElementVisible(listId)
                    ) {
                        const ListElement = MainData.find(item =>
                            item.liste?.some(liste =>
                                liste.listArray?.some(listItem => listItem.key === listId)
                            )
                        );
                        createLeaderLine(
                            selectedElement.data_id,
                            `${ListElement?.ruolo?.key}`,
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


// debounce.js
export function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}