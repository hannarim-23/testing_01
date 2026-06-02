import { test, expect } from '@playwright/test';

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

//const API_URL = 'http://localhost:3000';
const API_URL = process.env.API_URL;
const TEST_USER_EMAIL = 'user1@mail.ru';
const TEST_USER_PASSWORD = '12345678';
const ADMIN_USER = 'admin@test.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('API: Auth', () => {

  test('API-01_1: POST /auth/register — успешная регистрация', async ({
    request,
  }) => {
    // 1. Генерируем уникальные данные
    const userData = newUser();

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

  test('API-01_2: POST /auth/register — ошибочная регистрация (существующий email)', async ({
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

    expect(response.status()).toBe(409);

    const responseBody = await response.json();
    expect(responseBody.message).toContain('already exists');
  });

  test('API-02_1: POST /auth/login — вход существующего пользователя', async ({
    request,
  }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD },
    });

    const responseBody = await response.json();

    expect(response.status()).toBe(201);
    expect(responseBody.email).toBe(TEST_USER_EMAIL);
    expect(responseBody.role).toBe('USER');
    expect(typeof responseBody.id).toBe('number');
    expect(responseBody.id).toBeGreaterThan(0);
  });

  test('API-02_2: POST /auth/login — вход АДМИНА', async ({
    request,
  }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: { email: ADMIN_USER, password: ADMIN_PASSWORD },
    });

    const responseBody = await response.json();

    expect(response.status()).toBe(201);
    expect(responseBody.email).toBe(ADMIN_USER);
    expect(responseBody.role).toBe('ADMIN');
  });

  test('API-02_3: POST /auth/login — вход с не валидными паролем', async ({
    request,
  }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: { email: TEST_USER_EMAIL, password: 'INVALID' },
    });

    const responseBody = await response.json();

    expect(response.status()).toBe(401);
    expect(responseBody.message).toContain('Invalid email or password');
  });

  test('API-03_1: PATCH /auth/{userID} — Обновить данные ', async ({
    request,
  }) => {
    const userData = newUser();

    const response = await request.post(`${API_URL}/auth/register`, {
      data: userData,
    });

    const responseBody = await response.json();
    const id = responseBody.id;

    const updateData = {
      firstname: 'Ivan',
      lastname: 'Ivanov',
      phoneNumber: '+375291471471',
      email: `ivan.ivanov.${Date.now()}@example.com`,
      username: `ivan_ivanov_${Date.now()}`,
    };

    const updateResponse = await request.patch(`${API_URL}/auth/${id}`, {
      data: updateData,
    });

    expect(updateResponse.status()).toBe(200);
    const updateResponseBody = await updateResponse.json();
    expect(updateResponseBody).toHaveProperty('id');
    expect(updateResponseBody).toHaveProperty('email');
    expect(updateResponseBody).toHaveProperty('firstname');
    expect(updateResponseBody).toHaveProperty('lastname');
    expect(updateResponseBody).toHaveProperty('username');
    expect(updateResponseBody).toHaveProperty('role');
  });

  test('API-03_2: PATCH /auth/{userID} — Обновить данные(пользователь не найден) ', async ({
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
    expect(updateResponseBody.message).toContain(
      `User with ID ${9999999} not found`
    );
  });

  test('API-03_3: PATCH /auth/{userID} — Обновить данные(пользователь с таким Email or username существует) ', async ({
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
    expect(updateResponseBody.message).toContain(
      `Email "user1@mail.ru" already exists.`
    );
  });
});
