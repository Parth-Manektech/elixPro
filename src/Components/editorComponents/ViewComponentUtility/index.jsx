export const initializeWorkflowMapping = (data) => {
    if (!data.some(item => item.hasOwnProperty('workflowmapping'))) {
        data.push({ workflowmapping: [] });
    }
    return data;
};
