import { test, expect } from '@playwright/test';

//const API_URL = 'http://localhost:3000';
const API_URL = process.env.API_URL;
const TEST_USER_EMAIL = 'user1@mail.ru';
const TEST_USER_PASSWORD = '12345678';

const newUser = () => {
    const timestamp = Date.now();
    return {
      firstname: 'Ivan',
      lastname: 'Ivanov',
      phoneNumber: `+37529${timestamp}`.slice(0, 13),
      email: `ivan.ivanov.${timestamp}@example.com`,
      username: `ivan_ivanov_${timestamp}`,
      password: '12345678',
      role: 'USER',
    };
  };


test.describe('API: Auth', () => {
    
    // ✅ ВРЕМЕННЫЙ ТЕСТ — для исследования
    // Запустить, посмотреть результат, потом удалить
    test('01 ИССЛЕДОВАНИЕ: узнать реальный ответ сервера', async ({ request }) => {
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

    test('02_2 ИССЛЕДОВАНИЕ: узнать реальный ответ сервера', async ({ request }) => {
        const response = await request.post(`${API_URL}/auth/login`, {
            data: { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD },
          });
        
        const body = await response.json();
        console.log('Статус:', response.status());
        console.log('Реальное сообщение:', body.message);
        console.log('Весь ответ:', JSON.stringify(body, null, 2));
    });


      test('API-02_2: POST /auth/register — существующий email', async ({
        request,
      }) => {
        const response = await request.post(`${API_URL}/auth/login`, {
          data: { email: TEST_USER_EMAIL, password: 'INVALID' },
        });
        
        const body = await response.json();
        console.log('Статус:', response.status());
        console.log('Реальное сообщение:', body.message);
        console.log('Весь ответ:', JSON.stringify(body, null, 2));
      });
    
});



  test('API-03_2: POST /auth/{userID} — Обновить данные(пользователь не найден) ', async ({
    request,
  }) => {

    const updateData = {
      firstname: 'Ivan',
      lastname: 'Ivanov',
      phoneNumber: '+375291471471',
      email: `ivan.ivanov.${Date.now()}@example.com`,
      username: `ivan_ivanov_${Date.now()}`,
    };
  
    const updateResponse = await request.patch(`${API_URL}/auth/${9999999}`, {
      data: updateData,
    });
  
    const updateResponseBody = await updateResponse.json();
    expect(updateResponse.status()).toBe(404);
    //expect(updateResponseBody.message).toContain('user not found');
    console.log('Реальное сообщение:', updateResponseBody.message);

  });

  
  
  test('API-03_3: POST /auth/{userID} — Обновить данные(пользователь с таким Email or username существует) ', async ({
    request,
  }) => {

    const updateData = {
      firstname: 'Ivan',
      lastname: 'Ivanov',
      phoneNumber: '+375291471471',
      email: 'user1@mail.ru',
      username: `ivan_ivanov_${Date.now()}`,
    };
  
    const updateResponse = await request.patch(`${API_URL}/auth/${1}`, {
      data: updateData,
    });
  
    const updateResponseBody = await updateResponse.json();
    expect(updateResponse.status()).toBe(409);
    console.log('Реальное сообщение:', updateResponseBody.message);
    //expect(updateResponseBody.message).toContain(`Email or username already exists`);

  });