import './fonts/ys-display/fonts.css'
import './style.css'

// УБИРАЕМ импорт dataset - данные только с сервера
// import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

// Инициализируем API БЕЗ параметров - только серверные данные
const api = initData();

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    // Преобразуем числовые поля
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState();
    let query = {};
    
    // Применяем модули в правильном порядке:
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    // Получаем данные с сервера
    const { total, items } = await api.getRecords(query);
    
    // Обновляем пагинацию после получения данных
    updatePagination(total, query);
    
    sampleTable.render(items);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'filter', 'header'],
    after: ['pagination']
}, render);

// Инициализация модулей
const {applyPagination, updatePagination} = initPagination(
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

const {applyFiltering, updateIndexes} = initFiltering(sampleTable.filter.elements);

const applySearching = initSearching();

// Асинхронная функция инициализации
async function init() {
    try {
        const indexes = await api.getIndexes();
        updateIndexes({
            searchBySeller: indexes.sellers,
            searchByCustomer: indexes.customers
        });
    } catch (error) {
        console.error('Initialization error:', error);
    }
}


const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// Инициализация и первый рендер
init().then(() => {
    render();
});