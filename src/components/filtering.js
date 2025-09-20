export function initFiltering(elements) {
    const updateIndexes = (indexes) => {
        Object.keys(indexes).forEach(elementName => {
            if (elements[elementName]) {
                while (elements[elementName].options.length > 1) {
                    elements[elementName].remove(1);
                }
                
                const options = Object.values(indexes[elementName]).map(name => {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    return option;
                });
                
                elements[elementName].append(...options);
            }
        });
    }

    const applyFiltering = (query, state, action) => {
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            const input = action.closest('.filter-wrapper')?.querySelector('input');
            if (input) {
                input.value = '';
                state[field] = '';
            }
        }

        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key] && ['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) {
                filter[`filter[${elements[key].name}]`] = elements[key].value;
            }
        });

        return Object.keys(filter).length ? { ...query, ...filter } : query;
    }

    return {
        updateIndexes,
        applyFiltering
    };
}