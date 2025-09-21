export function initFiltering(elements) {
    const updateIndexes = (indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            elements[elementName].append(
                ...Object.values(indexes[elementName]).map(name => {
                    const el = document.createElement('option');
                    el.textContent = name;
                    el.value = name;
                    return el;
                })
            )
        })
    }

    const applyFiltering = (query, state, action) => {
        // Обработка очистки поля
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            const input = action.closest('.filter-wrapper')?.querySelector('input');
            if (input) {
                input.value = '';
                state[field] = '';
            }
        }

        // Формируем параметры фильтрации для сервера
        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) {
                    filter[`filter[${elements[key].name}]`] = elements[key].value;
                }
            }
        })

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    }

    return {
        updateIndexes,
        applyFiltering
    }
}