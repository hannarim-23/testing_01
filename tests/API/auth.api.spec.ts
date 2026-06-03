import { test, expect } from '@playwright/test';
import { newUser } from '../../helpers/newUser';

const API_URL = process.env.API_URL;
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;
const invalid = 99999;

test.describe('API: Auth', () => {
  const createdUserIds: number[] = [];

  test.afterEach(async () => {
    if (createdUserIds.length > 0) {
      console.log(`📦 Создано пользователей: ${createdUserIds.length}`);
      console.log(` IDs: ${createdUserIds.join(', ')}`);
      console.log(`⚠️ Очистка не реализована (нет DELETE /auth/{id})`);
      createdUserIds.length = 0;
    }
  });

  test('API-01_1: POST /auth/register — успешная регистрация', async ({
    request,
  }) => {
    const userData = newUser();
    const response = await request.post(`${API_URL}/auth/register`, {
      data: userData,
    });

    expect(response.status()).toBe(201);

    const responseBody = await response.json();

    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('email');
    expect(responseBody).toHaveProperty('firstname');
    expect(responseBody).toHaveProperty('lastname');
    expect(responseBody).toHaveProperty('username');
    expect(responseBody).toHaveProperty('role');

    expect(responseBody.email).toBe(userData.email);
    expect(responseBody.firstname).toBe(userData.firstname);
    expect(responseBody.username).toBe(userData.username);
    expect(responseBody.role).toBe(userData.role);

    expect(typeof responseBody.id).toBe('number');
    expect(responseBody.id).toBeGreaterThan(0);

    const createdUser = await response.json();
    createdUserIds.push(createdUser.id); // запоминаем для удаления
  });

  test('API-01_2: POST /auth/register — ошибочная регистрация (существующий email)', async ({
    request,
  }) => {
    // Данные пользователя, который уже существует
    const existingUser = {
      firstname: 'Ivan',
      lastname: 'Ivanov',
      phoneNumber: '+1234567890',
      email: 'user1@test.com', // уже существует
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

  test('API-02_2: POST /auth/login — вход АДМИНА', async ({ request }) => {
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

    expect(updateResponseBody.firstname).toBe(updateData.firstname);
    expect(updateResponseBody.lastname).toBe(updateData.lastname);
    expect(updateResponseBody.email).toBe(updateData.email);
    expect(updateResponseBody.username).toBe(updateData.username);
    expect(updateResponseBody.phoneNumber).toBe(updateData.phoneNumber);

    const createdUser = await response.json();
    createdUserIds.push(createdUser.id); // запоминаем для удаления
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

    const updateResponse = await request.patch(`${API_URL}/auth/${invalid}`, {
      data: updateData,
    });

    const updateResponseBody = await updateResponse.json();
    expect(updateResponse.status()).toBe(404);
    expect(updateResponseBody.message).toContain(
      `User with ID ${invalid} not found`
    );
  });

  test('API-03_3: PATCH /auth/{userID} — Обновить данные(пользователь с таким Email or username существует) ', async ({
    request,
  }) => {

    const userData = newUser();
    const response = await request.post(`${API_URL}/auth/register`, {
      data: userData,
    });

    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    const updateId = responseBody.id;

    const updateData = {
      firstname: 'Ivan',
      lastname: 'Ivanov',
      phoneNumber: '+375291471471',
      email: 'user1@mail.ru',
      username: `ivan_ivanov_${Date.now()}`,
    };

    const updateResponse = await request.patch(`${API_URL}/auth/${updateId}`, {
      data: updateData,
    });

    const updateResponseBody = await updateResponse.json();
    expect(updateResponse.status()).toBe(409);
    expect(updateResponseBody.message).toContain(
      `Email "user1@mail.ru" already exists.`
    );

    createdUserIds.push(updateId); // запоминаем для удаления
  });
});
