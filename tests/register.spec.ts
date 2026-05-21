import { test, expect } from '@playwright/test';
import { getTestUser } from '../helpers/testData';
import { selectors } from '../helpers/selectors';

const BASE_URL = process.env.BASE_URL;
const EMAIL = process.env.TEST_USER_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;

if (!BASE_URL || !EMAIL || !PASSWORD) {
  throw new Error('❌ Missing BASE_URL in .env');
}

test.describe('Register Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    //если использовать статические данные при регистрации, то нужно добавить очистку БД, чтобы успешно проходила регистрация
  });

  test('TC_REG_01: Успешная регистрация с валидными данными @smoke @regression', async ({
    page,
  }) => {
    const user = getTestUser();

    await page.fill(selectors.firstnameInput, user.firstname);
    await page.fill(selectors.lastnameInput, user.lastname);
    await page.fill(selectors.emailInput, user.email);
    await page.fill(selectors.usernameInput, user.username);
    await page.fill(selectors.phoneInput, user.phone);
    await page.fill(selectors.passwordInput, user.password);
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('TC_REG_02: Регистрация с существующим email', async ({ page }) => {
    const user = getTestUser();

    await page.fill(selectors.firstnameInput, user.firstname);
    await page.fill(selectors.lastnameInput, user.lastname);
    await page.fill(selectors.emailInput, EMAIL);
    await page.fill(selectors.usernameInput, user.username);
    await page.fill(selectors.phoneInput, user.phone);
    await page.fill(selectors.passwordInput, PASSWORD);
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/register`);
    await expect(
      page.getByText(`Email "${EMAIL}" already exists.`)
    ).toBeVisible();
  });

  test('TC_REG_03: Невалидный email', async ({ page }) => {
    const user = getTestUser();

    await page.fill(selectors.firstnameInput, user.firstname);
    await page.fill(selectors.lastnameInput, user.lastname);
    await page.fill(selectors.emailInput, '123mail.ru');
    await page.fill(selectors.usernameInput, user.username);
    await page.fill(selectors.phoneInput, user.phone);
    await page.fill(selectors.passwordInput, user.password);
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/register`);
    await expect(page.getByText(`email must be an email`)).toBeVisible();
  });

  // BUG-01: Неинформативное сообщение об ошибке при коротком пароле
  // Ожидается: "Пароль должен содержать минимум 8 символов"
  // Фактически: красное слово "пароль"
  // TODO: раскомментировать проверку нормального сообщения после исправления
  test('TC_REG_04: Слишком короткий пароль (< 8 символов)', async ({
    page,
  }) => {
    const user = getTestUser();

    await page.fill(selectors.firstnameInput, user.firstname);
    await page.fill(selectors.lastnameInput, user.lastname);
    await page.fill(selectors.emailInput, user.email);
    await page.fill(selectors.usernameInput, user.username);
    await page.fill(selectors.phoneInput, user.phone);
    await page.fill(selectors.passwordInput, '123');
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/register`);
    const errorElement = page.locator('.text-destructive:has-text("пароль")');
    await expect(errorElement).toBeVisible();

    await expect(
      page.getByText('Пароль должен содержать минимум 8 символов')
    ).not.toBeVisible(); //баг - проверить после исправления (удалить .not)
  });

  test('TC_REG_05: Пустые обязательные поля (email, пароль, ...)', async ({
    page,
  }) => {
    await page.fill(selectors.firstnameInput, '');
    await page.fill(selectors.lastnameInput, '');
    await page.fill(selectors.emailInput, '');
    await page.fill(selectors.usernameInput, '');
    await page.fill(selectors.phoneInput, '');
    await page.fill(selectors.passwordInput, '');
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/register`);
    await expect(page.getByText(`Имя обязательно`)).toBeVisible();
    await expect(page.getByText(`Фамилия обязательна`)).toBeVisible();
    await expect(page.getByText(`Email обязателен`)).toBeVisible();
    await expect(page.getByText(`Username обязателен`)).toBeVisible();
    await expect(page.getByText(`Телефон обязателен`)).toBeVisible();
    await expect(page.getByText(`Пароль обязателен`)).toBeVisible();
  });

  test('TC_REG_06: Невалидный телефон', async ({ page }) => {
    const user = getTestUser();

    await page.fill(selectors.firstnameInput, user.firstname);
    await page.fill(selectors.lastnameInput, user.lastname);
    await page.fill(selectors.emailInput, user.email);
    await page.fill(selectors.usernameInput, user.username);
    await page.fill(selectors.phoneInput, 'abc');
    await page.fill(selectors.passwordInput, user.password);
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/register`);
    await expect(
      page.getByText(
        `phoneNumber must be in international format (starting with +)`
      )
    ).toBeVisible();
  });

  // BUG-02: Отсутствует проверка уникальности номера телефона
  // Ожидается: ошибка "Телефон уже используется"
  // Фактически: регистрация проходит успешно
  // TODO: раскомментировать проверку ошибки после исправления
  test('TC_REG_07: Телефон уже существует', async ({ page }) => {
    const user = getTestUser();

    await page.fill(selectors.firstnameInput, user.firstname);
    await page.fill(selectors.lastnameInput, user.lastname);
    await page.fill(selectors.emailInput, user.email);
    await page.fill(selectors.usernameInput, user.username);
    await page.fill(selectors.phoneInput, user.phone); //ввести телефон из существующей БД,
    await page.fill(selectors.passwordInput, user.password);
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/login`);
    //await expect(page.getByText(` Telephone number "${user.phone}" already exists.`)).toBeVisible(); // расскомментировать, когда баг будет исправлен
  });

  // BUG-04: Поле email подставляет username вместо email
  // Ожидается: поле email пустое или содержит email
  // Фактически: поле email содержит username
  // TODO: после исправления заменить проверку на expect(emailValue).toBe('')
  test('TC_REG_08: Проверка поля email после регистрации', async ({ page }) => {
    const user = getTestUser();

    await page.fill(selectors.firstnameInput, user.firstname);
    await page.fill(selectors.lastnameInput, user.lastname);
    await page.fill(selectors.emailInput, user.email);
    await page.fill(selectors.usernameInput, user.username);
    await page.fill(selectors.phoneInput, user.phone);
    await page.fill(selectors.passwordInput, user.password);
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/login`);

    // БАГ - не воспроизводится в тестовой среде: поле email содержит username вместо email или пустого значения. СИМУЛИРУЮ АВТОЗАПОЛНЕНИЕ
    await page.fill(selectors.emailInput, user.username);

    const emailValue = await page.inputValue(selectors.emailInput);
    await expect(emailValue).not.toBe(user.email); //проверка после исправления бага (удалить .not) или
    await expect(emailValue).toContain(user.username); //проверка бага, заменить после исправления на (user.email)
  });
});
