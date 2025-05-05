export const initializeWorkflowMapping = (data) => {
    if (!data.some(item => item.hasOwnProperty('workflowmapping'))) {
        data.push({ workflowmapping: [] });
    }
    return data;
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