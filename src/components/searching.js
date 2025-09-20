export function initSearching() {
    return (query, state, action) => {
        if (!state.search || state.search.trim() === '') {
            return query;
        }
        
        return {
            ...query,
            search: state.search
        };
    }
}