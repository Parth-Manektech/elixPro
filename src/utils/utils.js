export function parseList(val) {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        if (val.trim().startsWith('[')) {
            try {
                return JSON.parse(val);
            } catch {
                return [];
            }
        }
        return val
            .split(',')
            .map(s => s.trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean);
    }
    return [];
}