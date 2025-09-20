import {makeIndex} from "./lib/utils.js";

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData(sourceData) {
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    const mapRecords = (data) => {
        // Проверяем что индексы загружены
        if (!sellers || !customers) {
            console.error('Indexes not loaded yet!');
            return [];
        }
        
        return data.map(item => ({
            id: item.receipt_id,
            date: item.date,
            seller: sellers[item.seller_id],
            customer: customers[item.customer_id],
            total: item.total_amount
        }));
    }

    const getIndexes = async () => {
        if (!sellers || !customers) {
            try {
                const [sellersResponse, customersResponse] = await Promise.all([
                    fetch(`${BASE_URL}/sellers`),
                    fetch(`${BASE_URL}/customers`),
                ]);
                
                const sellersData = await sellersResponse.json();
                const customersData = await customersResponse.json();
                
                console.log('Sellers data:', sellersData);
                console.log('Customers data:', customersData);
                
                // Предполагаем что сервер возвращает { items: [...] }
                sellers = makeIndex(sellersData.items, 'id', v => `${v.first_name} ${v.last_name}`);
                customers = makeIndex(customersData.items, 'id', v => `${v.first_name} ${v.last_name}`);
                
            } catch (error) {
                console.error('Error fetching indexes:', error);
                // Fallback на локальные данные
                sellers = makeIndex(sourceData.sellers, 'id', v => `${v.first_name} ${v.last_name}`);
                customers = makeIndex(sourceData.customers, 'id', v => `${v.first_name} ${v.last_name}`);
            }
        }
        return { sellers, customers };
    }

    const getRecords = async (query, isUpdated = false) => {
        try {
            // Убеждаемся что индексы загружены
            if (!sellers || !customers) {
                await getIndexes();
            }
            
            const qs = new URLSearchParams(query);
            const nextQuery = qs.toString();
            
            if (lastQuery === nextQuery && !isUpdated) {
                return lastResult;
            }
            
            const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
            const records = await response.json();
            
            console.log('Records response:', records);
            
            lastQuery = nextQuery;
            lastResult = {
                total: records.total,
                items: mapRecords(records.items)
            };
            
            return lastResult;
        } catch (error) {
            console.error('Error fetching records:', error);
            // Fallback на локальные данные
            if (!sellers || !customers) {
                sellers = makeIndex(sourceData.sellers, 'id', v => `${v.first_name} ${v.last_name}`);
                customers = makeIndex(sourceData.customers, 'id', v => `${v.first_name} ${v.last_name}`);
            }
            
            return {
                total: sourceData.purchase_records.length,
                items: sourceData.purchase_records.map(item => ({
                    id: item.receipt_id,
                    date: item.date,
                    seller: sellers[item.seller_id],
                    customer: customers[item.customer_id],
                    total: item.total_amount
                }))
            };
        }
    };

    return { getIndexes, getRecords };
}