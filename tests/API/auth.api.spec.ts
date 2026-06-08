import { test, expect } from '@playwright/test';

//const API_URL = 'http://localhost:3000';
const API_URL = process.env.API_URL;
const TEST_USER_EMAIL = 'user1@mail.ru';
const TEST_USER_PASSWORD = '12345678';

test.describe('API: Auth', () => {
  test('API-01_1: POST /auth/register — успешная регистрация', async ({
    request,
  }) => {
    // 1. Генерируем уникальные данные
    const timestamp = Date.now();
    const userData = {
      firstname: 'Ivan',
      lastname: 'Ivanov',
      phoneNumber: `+37529${timestamp}`.slice(0, 13),
      email: `ivan.ivanov.${timestamp}@example.com`,
      username: `ivan_ivanov_${timestamp}`,
      password: '12345678',
      role: 'USER',
    };

    // 2. Отправляем POST-запрос
    const response = await request.post(`${API_URL}/auth/register`, {
      data: userData,
    });

    // 3. Проверяем статус ответа
    expect(response.status()).toBe(201);

    // 4. Проверяем тело ответа
    const responseBody = await response.json();

    // 5. Проверяем, что вернулись нужные поля
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('email');
    expect(responseBody).toHaveProperty('firstname');
    expect(responseBody).toHaveProperty('lastname');
    expect(responseBody).toHaveProperty('username');
    expect(responseBody).toHaveProperty('role');

    // 6. Проверяем, что данные совпадают с отправленными
    expect(responseBody.email).toBe(userData.email);
    expect(responseBody.firstname).toBe(userData.firstname);
    expect(responseBody.username).toBe(userData.username);
    expect(responseBody.role).toBe(userData.role);

    // 7. Проверяем, что вернулся id (число)
    expect(typeof responseBody.id).toBe('number');
    expect(responseBody.id).toBeGreaterThan(0);
  });

  test('API-01_2: POST /auth/register — существующий email', async ({
    request,
  }) => {
    // Данные пользователя, который уже существует
    const existingUser = {
      firstname: 'Ivan',
      lastname: 'Ivanov',
      phoneNumber: '+1234567890',
      email: 'ivan.ivanov@example.com', // уже существует
      username: 'ivan_ivanov_unique',
      password: 'password123',
      role: 'USER',
    };

    const response = await request.post(`${API_URL}/auth/register`, {
      data: existingUser,
    });

    // Ожидаем конфликт (409)
    expect(response.status()).toBe(409);

    const responseBody = await response.json();
    expect(responseBody.message).toContain('already exists');
  });
});

/*
  test('API-11: POST /auth/register — существующий email', async ({
    request,
  }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD },
    });

    expect(response.status()).toBe(201);
    
    const responseBody = await response.json();


  });
   */