import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL;
const EMAIL = process.env.TEST_USER_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;

// Проверяет, что все нужные переменные загрузились из .env. Если какой-то нет — тесты даже не запустятся, а сразу покажут ошибку
if (!BASE_URL || !EMAIL || !PASSWORD) {
  throw new Error('❌ Missing environment variables. Check .env file');
}

// Селекторы (легко менять, если изменится вёрстка)
const selectors = {
  emailInput: 'input[name="email"]',
  passwordInput: 'input[name="password"]',
  submitButton: 'button[type="submit"]',
  errorMessage: 'Неверный email или пароль',
  errorPassword: 'Пароль обязателен',
  errorEmail: 'Email обязателен',
};

test.describe('Login Tests', () => {
  // Выполняется перед КАЖДЫМ тестом
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
  });

  test('TC_LOG_01: Успешный вход с валидными данными @smoke @regression', async ({
    page,
  }) => {
    await page.fill(selectors.emailInput, EMAIL);
    await page.fill(selectors.passwordInput, PASSWORD);
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('TC_LOG_02: Неверный пароль @regression', async ({ page }) => {
    await page.fill(selectors.emailInput, EMAIL);
    await page.fill(selectors.passwordInput, 'wrongpassword');
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.getByText(selectors.errorMessage)).toBeVisible();
  });

  test('TC_LOG_03: Несуществующий email', async ({ page }) => {
    await page.fill(selectors.emailInput, 'nonexistent@mail.ru');
    await page.fill(selectors.passwordInput, PASSWORD);
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.getByText(selectors.errorMessage)).toBeVisible();
  });

  test('TC_LOG_04: Пустой email', async ({ page }) => {
    await page.fill(selectors.emailInput, '');
    await page.fill(selectors.passwordInput, '12345678');
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.getByText(selectors.errorEmail)).toBeVisible();
  });

  test('TC_LOG_05: Пустой пароль', async ({ page }) => {
    await page.fill(selectors.emailInput, 'user1@mail.ru');
    await page.fill(selectors.passwordInput, '');
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.getByText(selectors.errorPassword)).toBeVisible();
  });

  test('TC_LOG_06: Невалидный формат email', async ({ page }) => {
    await page.fill(selectors.emailInput, 'test');
    await page.fill(selectors.passwordInput, '12345678');
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.getByText(selectors.errorMessage)).toBeVisible();
  });

  test('TC_LOG_07: Оба поля пустые', async ({ page }) => {
    await page.fill(selectors.emailInput, '');
    await page.fill(selectors.passwordInput, '');
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.getByText(selectors.errorEmail)).toBeVisible();
    await expect(page.getByText(selectors.errorPassword)).toBeVisible();
  });

  test('TC_LOG_08: SQL injection в email', async ({ page }) => {
    await page.fill(selectors.emailInput, "'' OR '1'=1");
    await page.fill(selectors.passwordInput, "'' OR '1'=1");
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.getByText(selectors.errorMessage)).toBeVisible();
  });

});
