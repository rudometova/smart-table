import {createComparison, defaultRules, rules} from "../lib/compare.js";

export function initFiltering(elements, indexes) {
    // Создаем компаратор с дополнительным правилом для числовых диапазонов
    const compare = createComparison(defaultRules, [
        // Правило для обработки числовых диапазонов totalFrom/totalTo
        (key, sourceValue, targetValue, source, target) => {
            // Обрабатываем только поля totalFrom и totalTo
            if (key !== 'totalFrom' && key !== 'totalTo') {
                return { continue: true }; // Продолжаем с другими правилами
            }
            
            // Пропускаем пустые значения
            if (!targetValue) {
                return { skip: true };
            }
            
            // Преобразуем в числа
            const numValue = parseFloat(targetValue);
            const sourceTotal = parseFloat(source.total);
            
            if (isNaN(numValue) || isNaN(sourceTotal)) {
                return { skip: true };
            }
            
            if (key === 'totalFrom' && sourceTotal < numValue) {
                return { result: false };
            }
            
            if (key === 'totalTo' && sourceTotal > numValue) {
                return { result: false };
            }
            
            return { skip: true };
        }
    ]);

    // Заполнить выпадающие списки опциями
    Object.keys(indexes).forEach(elementName => {
        if (elements[elementName]) {
            // Создаем опции для выпадающего списка
            const options = Object.values(indexes[elementName]).map(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                return option;
            });
            
            // Добавляем пустую опцию в начало
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '-- Все --';
            elements[elementName].prepend(emptyOption);
            
            // Добавляем все опции в select
            elements[elementName].append(...options);
        }
    });

    return (data, state, action) => {
        // Обработать очистку поля
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            // Находим соответствующий input и очищаем его
            const input = action.closest('.filter-wrapper')?.querySelector('input');
            if (input) {
                input.value = '';
                // Также очищаем значение в state
                state[field] = '';
            }
        }

        // Отфильтровать данные используя компаратор
        return data.filter(row => compare(row, state));
    }
}