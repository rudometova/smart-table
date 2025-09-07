// src/components/searching.js
import {createComparison, rules} from "../lib/compare.js";

// src/components/searching.js - упрощенная версия
export function initSearching() {
    return (data, state, action) => {
        // Если поле поиска пустое, возвращаем все данные
        if (!state.search || state.search.trim() === '') {
            return data;
        }
        
        const searchTerm = state.search.toLowerCase();
        const searchFields = ['date', 'customer', 'seller'];
        
        return data.filter(row => {
            // Ищем в указанных полях
            for (const field of searchFields) {
                const fieldValue = row[field];
                if (fieldValue && String(fieldValue).toLowerCase().includes(searchTerm)) {
                    return true;
                }
            }
            return false;
        });
    }
}