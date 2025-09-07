import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

// Исходные данные используемые в render()
const {data, ...indexes} = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    // Преобразуем числовые поля
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);
    
    // Создаем массив для диапазона сумм [from, to]
    const totalRange = [];
    if (state.totalFrom) totalRange.push(parseFloat(state.totalFrom));
    if (state.totalTo) totalRange.push(parseFloat(state.totalTo));
    
    // Если есть оба значения, сортируем их
    if (totalRange.length === 2) {
        totalRange.sort((a, b) => a - b);
    }

    return {
        ...state,
        rowsPerPage,
        page,
        total: totalRange.length > 0 ? totalRange : undefined
    };
}

/**
 * Перерисовка состояния таблицы при любых измененияв
 * @param {HTMLButtonElement?} action
 */
function render(action) {
    let state = collectState(); // состояние полей из таблицы
    let result = [...data]; // копируем для последующего изменения
    
    // Применяем модули в правильном порядке:
    // 1. Поиск (самый общий)
    // 2. Фильтрация (более конкретная)
    // 3. Сортировка
    // 4. Пагинация
    result = applySearching(result, state, action);
    result = applyFiltering(result, state, action);
    result = applySorting(result, state, action);
    result = applyPagination(result, state, action);

    sampleTable.render(result)
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'filter', 'header'], // Порядок важен: поиск, фильтр, заголовок
    after: ['pagination']
}, render);

// Инициализация модулей
const applyPagination = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const applyFiltering = initFiltering(
    sampleTable.filter.elements,
    { 
        searchBySeller: indexes.sellers,
        searchByCustomer: indexes.customers 
    }
);

const applySearching = initSearching();

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

render();