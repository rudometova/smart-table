import {makeIndex} from "./lib/utils.js";

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData() {
    // переменные для кеширования данных
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    // функция для приведения строк в тот вид, который нужен нашей таблице
    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id], // Используем seller_id как ключ
        customer: customers[item.customer_id], // Используем customer_id как ключ
        total: item.total_amount
    }));

    // функция получения индексов
    const getIndexes = async () => {
        if (!sellers || !customers) { // если индексы ещё не установлены, то делаем запросы
           [sellers, customers] = await Promise.all([ // запрашиваем и деструктурируем в уже объявленные ранее переменные
            fetch(`${BASE_URL}/sellers`).then(res => res.json()), // запрашиваем продавцов
            fetch(`${BASE_URL}/customers`).then(res => res.json()), // запрашиваем покупателей
           ]);
        }

    return { sellers, customers };
    }

    // функция получения записей о продажах с сервера
    const getRecords = async (query, isUpdated = false) => {
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}