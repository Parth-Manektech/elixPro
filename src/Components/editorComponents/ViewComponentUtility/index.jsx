import { ErrorToast } from "../../../utils/Toster";

export const initializeWorkflowMapping = (data) => {
    // Check if workflowmapping exists
    const hasWorkflowMapping = data.some(item => item.hasOwnProperty('workflowmapping'));

    // Check if ajWFStatiName exists
    const hasAjWFStatiName = data.some(item => item.hasOwnProperty('ajWFStatiName'));

    // Create a copy of the data array
    let updatedData = [...data];

    // If ajWFStatiName is missing, add it at the second-to-last position
    if (!hasAjWFStatiName) {
        updatedData.splice(updatedData.length - (hasWorkflowMapping ? 1 : 0), 0, { ajWFStatiName: {} });
    }

    // If workflowmapping is missing, add it at the last position
    if (!hasWorkflowMapping) {
        updatedData.push({ workflowmapping: [] });
    }

    return updatedData;
};


export const customFormatSql = (sql) => {
    if (!sql || typeof sql !== 'string') return '';
    try {
        // Escape single quotes in string literals (e.g., 'Facolta' di TEST' -> 'Facolta'' di TEST')
        const escapedSql = sql.replace(/(?<!\\)'((?:[^'\\]|\\.)*?)'/g, (match, content) => {
            const escapedContent = content.replace(/(?<!\\)'/g, "''");
            return `'${escapedContent}'`;
        });

        // Split statements by semicolon and format
        return escapedSql
            .split(';')
            .map((statement) => statement.trim())
            .filter((statement) => statement)
            .map((statement) => `    ${statement};`) // Indent with 4 spaces
            .join('\n');
    } catch (error) {
        console.error('Custom SQL formatting failed:', error.message, 'SQL:', sql);
        return sql; // Fallback to raw SQL
    }
};



// Toggles status visibility for a role
export const toggleStatusVisibility = (roleName, status, setShownStatuses) => {
    setShownStatuses((prev) => {
        const newStatuses = { ...prev };
        // Only update if the status is different or if no status is set for the role
        if (newStatuses[roleName] !== status) {
            newStatuses[roleName] = status;
        }
        return newStatuses;
    });
};

// Toggles action visibility for a role and status
export const toggleActionVisibility = (roleName, status, actionKey, MainData, setEpWorkflowjson) => {
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

// Deletes a role and updates workflow mappings
export const handleDeleteRole = (roleName, MainData, setEpWorkflowjson, setShownStatuses, setCollapsedCards) => {
    const updatedData = initializeWorkflowMapping([...MainData]);
    const workflowIndex = updatedData.length - 1;

    const roleIndex = updatedData.findIndex((elem) => elem.ruolo?.nome === roleName);
    if (roleIndex === -1) {
        console.error('Role not found:', roleName);
        return;
    }

    const listKeys = [];
    const actionKeys = [];
    const statusKeys = [];

    const role = updatedData[roleIndex];
    if (role.liste) {
        role.liste.forEach((list) => {
            list.listArray.forEach((item) => {
                listKeys.push(item.key);
            });
        });
    }
    if (role.azioni) {
        role.azioni.forEach((action) => {
            action.listArray.forEach((item) => {
                actionKeys.push(item.key);
            });
        });
    }
    if (role.pulsantiAttivi) {
        statusKeys.push(...Object.keys(role.pulsantiAttivi));
    }

    updatedData[workflowIndex].workflowmapping = updatedData[workflowIndex].workflowmapping.filter((wf) =>
        !actionKeys.includes(wf.keyAzione)
    );
    updatedData[workflowIndex].workflowmapping.forEach((wf) => {
        wf.listeDestinazione = wf.listeDestinazione.filter((key) => !listKeys.includes(key));
        wf.doNotlisteDestinazione = wf.doNotlisteDestinazione.filter((key) => !listKeys.includes(key));
        if (statusKeys.includes(wf.statoDestinazione)) {
            wf.statoDestinazione = null;
        }
    });

    updatedData.forEach((faculty) => {
        if (faculty.azioni) {
            faculty.azioni.forEach((action) => {
                action.listArray.forEach((item) => {
                    if (item.moveToList) {
                        const moveToListKeys = item.moveToList.split(',').map((key) => key.trim());
                        item.moveToList = moveToListKeys.filter((key) => !listKeys.includes(key)).join(', ');
                    }
                    if (item.doNotMoveToList) {
                        const doNotMoveToListKeys = item.doNotMoveToList.split(',').map((key) => key.trim());
                        item.doNotMoveToList = doNotMoveToListKeys.filter((key) => !listKeys.includes(key)).join(', ');
                    }
                });
            });
        }
    });

    setShownStatuses((prev) => {
        const newStatuses = { ...prev };
        delete newStatuses[roleName];
        return newStatuses;
    });

    updatedData.splice(roleIndex, 1);

    setEpWorkflowjson(JSON.stringify(updatedData));
    setCollapsedCards((prev) => {
        const newCollapsed = { ...prev };
        delete newCollapsed[roleName];
        return newCollapsed;
    });
};

// Clones a role with a new name and key
export const handleCloneRoleSubmit = (roleToClone, NewData, MainData, setEpWorkflowjson, setCloneRoleModalShow, setRoleToClone) => {
    if (!roleToClone) {
        console.error('No role to clone');
        return;
    }
    const { nome, key: newKey, descrizione, listaDefault } = NewData;

    const updatedData = initializeWorkflowMapping([...MainData]);
    const workflowIndex = updatedData.length - 1;
    const originalRole = updatedData.find((r) => r.ruolo?.nome === roleToClone.ruolo.nome);
    if (!originalRole) {
        console.error('Original role not found:', roleToClone.ruolo.nome);
        return;
    }

    const oldKey = originalRole.ruolo.key;
    if (!oldKey) {
        console.error('Original role has no key:', originalRole.ruolo.nome);
        return;
    }

    if (updatedData.some((r) => r.ruolo?.key === newKey)) {
        ErrorToast('Key already exists. Please choose a unique key.');
        return;
    }
    if (updatedData.some((r) => r.ruolo?.nome === nome)) {
        ErrorToast('Role name already exists. Please choose a unique name.');
        return;
    }

    const replaceKeyInString = (str) => {
        if (!str || typeof str !== 'string') return str;
        const regex = new RegExp(`(^|__)${oldKey}($|__)`, 'g');
        return str.replace(regex, `$1${newKey}$2`);
    };

    const clonedRole = {
        ...originalRole,
        ruolo: {
            ...originalRole.ruolo,
            nome: nome,
            descrizione: descrizione,
            key: newKey,
            listaDefault: replaceKeyInString(listaDefault),
        },
        liste: originalRole.liste.map((list) => ({
            ...list,
            listArray: list.listArray.map((item) => ({
                ...item,
                key: replaceKeyInString(item.key),
            })),
        })),
        sezioni: replaceKeyInString(originalRole.sezioni),
        procedimentoTag: originalRole.procedimentoTag,
        azioni: originalRole.azioni.map((action) => ({
            ...action,
            listArray: action.listArray.map((item) => ({
                ...item,
                key: replaceKeyInString(item.key),
                status: replaceKeyInString(item.status),
                moveToList: replaceKeyInString(item.moveToList),
                doNotMoveToList: replaceKeyInString(item.doNotMoveToList),
            })),
        })),
        pulsantiAttivi: Object.fromEntries(
            Object.entries(originalRole.pulsantiAttivi || {}).map(([status, actions]) => [
                replaceKeyInString(status),
                Object.fromEntries(Object.entries(actions).map(([actionKey, value]) => [replaceKeyInString(actionKey), value])),
            ])
        ),
        layout: {
            top: (originalRole.layout?.top || 0) + 50,
            left: (originalRole.layout?.left || 0) + 50,
            width: originalRole.layout?.width || 350,
            height: originalRole.layout?.height || 690,
        },
    };

    const newWorkflowMapping = [];
    const seenKeys = new Set();
    if (updatedData[workflowIndex].workflowmapping) {
        updatedData[workflowIndex].workflowmapping.forEach((wf) => {
            if (
                wf.keyAzione.includes(oldKey) ||
                wf.statoDestinazione?.includes(oldKey) ||
                wf.listeDestinazione.some((key) => key.includes(oldKey)) ||
                wf.doNotlisteDestinazione.some((key) => key.includes(oldKey))
            ) {
                const newWf = {
                    ...wf,
                    keyAzione: replaceKeyInString(wf.keyAzione),
                    statoDestinazione: replaceKeyInString(wf.statoDestinazione),
                    listeDestinazione: wf.listeDestinazione.map((key) => replaceKeyInString(key)),
                    doNotlisteDestinazione: wf.doNotlisteDestinazione.map((key) => replaceKeyInString(key)),
                };
                if (!seenKeys.has(newWf.keyAzione)) {
                    newWorkflowMapping.push(newWf);
                    seenKeys.add(newWf.keyAzione);
                }
            }
        });
        updatedData[workflowIndex].workflowmapping.push(...newWorkflowMapping);
    }

    updatedData.splice(workflowIndex, 0, clonedRole);
    setEpWorkflowjson(JSON.stringify(updatedData));
    setCloneRoleModalShow(false);
    setRoleToClone(null);
};