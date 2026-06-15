import { test, expect } from '@playwright/test';

//const API_URL = 'http://localhost:3000';
const API_URL = process.env.API_URL;
const TEST_USER_EMAIL = 'user1@mail.ru';
const TEST_USER_PASSWORD = '12345678';


test.describe('API: Auth', () => {
    
    // ✅ ВРЕМЕННЫЙ ТЕСТ — для исследования
    // Запустить, посмотреть результат, потом удалить
    test('🔍 ИССЛЕДОВАНИЕ: узнать реальный ответ сервера', async ({ request }) => {
        const existingUser = {
            firstname: 'Ivan',
            lastname: 'Ivanov',
            phoneNumber: '+1234567890',
            email: 'ivan.ivanov@example.com',
            username: 'ivan_ivanov_unique',
            password: 'password123',
            role: 'USER'
        };
        
        const response = await request.post(`${API_URL}/auth/register`, {
            data: existingUser
        });
        
        const body = await response.json();
        console.log('Статус:', response.status());
        console.log('Реальное сообщение:', body.message);
        console.log('Весь ответ:', JSON.stringify(body, null, 2));
    });
    
    // ✅ ОСНОВНОЙ ТЕСТ — постоянный
    test('API-11: POST /auth/register — существующий email', async ({ request }) => {
        // ... уже с правильными проверками
    });
});

