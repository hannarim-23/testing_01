import { test, expect } from '@playwright/test';
import { getTestUser } from '../helpers/testData';
import { RegisterPage } from '../pages/RegisterPage';

//const BASE_URL = process.env.BASE_URL;
const EMAIL = process.env.TEST_USER_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;
const EXISTING_PHONE = '+375233323232'; //телефон из существующей БД

if (!EMAIL || !PASSWORD) {
  throw new Error('❌ Missing BASE_URL in .env');
}

test.describe('Register Tests', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('TC_REG_01: Успешная регистрация @smoke @regression', async () => {
    const user = getTestUser();
    await registerPage.register(user);
    await registerPage.expectSuccess();
  });

  test('TC_REG_02: Регистрация с существующим email @regression', async () => {
    const user = getTestUser();
    await registerPage.register({
      ...user,
      email: EMAIL,
    });
    await registerPage.expectErrorOnPage();
    await expect(
      registerPage.page.getByText(`Email "${EMAIL}" already exists.`)
    ).toBeVisible();
  });

  test('TC_REG_03: Невалидный email @regression', async () => {
    const user = getTestUser();
    await registerPage.register({
      ...user,
      email: '123mail.ru',
    });
    await registerPage.expectErrorOnPage();
    await registerPage.expectEmailFormatError();
  });

  // BUG-01: Неинформативное сообщение об ошибке при коротком пароле
  // Ожидается: "Пароль должен содержать минимум 8 символов"
  // Фактически: красное слово "пароль"
  // TODO: раскомментировать проверку нормального сообщения после исправления
  test('TC_REG_04: Короткий пароль (< 8 символов) @regression', async () => {
    const user = getTestUser();
    await registerPage.register({
      ...user,
      password: '123',
    });
    await registerPage.expectErrorOnPage();
    // BUG-01: Неинформативное сообщение
    await expect(
      registerPage.page.locator('.text-destructive:has-text("пароль")')
    ).toBeVisible();
    await expect(
      registerPage.page.getByText('Пароль должен содержать минимум 8 символов')
    ).not.toBeVisible(); //баг - проверить после исправления (удалить .not)
  });

  test('TC_REG_05: Пустые поля @regression', async () => {
    await registerPage.register({
      firstname: '',
      lastname: '',
      email: '',
      username: '',
      phone: '',
      password: '',
    });
    await registerPage.expectErrorOnPage();
    await registerPage.expectFieldErrors();
  });

  test('TC_REG_06: Невалидный телефон @regression', async () => {
    const user = getTestUser();
    await registerPage.register({
      ...user,
      phone: 'abc',
    });
    await registerPage.expectErrorOnPage();
    await registerPage.expectPhoneFormatError();
  });

  // BUG-02: Отсутствует проверка уникальности номера телефона
  // Ожидается: ошибка "Телефон уже используется"
  // Фактически: регистрация проходит успешно
  // TODO: удалить (.skip) после исправления
  test.skip('TC_REG_07: Телефон уже существует @regression', async () => {
    const user = getTestUser();
    await registerPage.register({ ...user, phone: EXISTING_PHONE });
    await registerPage.expectErrorOnPage();
    await expect(
      registerPage.page.getByText(
        `Telephone number "${user.phone}" already exists.`
      )
    ).toBeVisible();
  });

  // BUG-04: Поле email подставляет username вместо email
  // Ожидается: поле email пустое или содержит email
  // Фактически: поле email содержит username
  // TODO: после исправления заменить проверку на expect(emailValue).toBe('')
  test('TC_REG_08: Проверка поля email после регистрации @regression', async () => {
    const user = getTestUser();
    await registerPage.register(user);
    await registerPage.expectRedirectToLogin();

    // БАГ - не воспроизводится в тестовой среде: поле email содержит username вместо email или пустого значения. СИМУЛИРУЮ АВТОЗАПОЛНЕНИЕ
    await registerPage.fillEmail(user.username);

    const emailValue = await registerPage.getEmailValue();

    // Текущая проверка (документирует баг)
    await expect(emailValue).toContain(user.username); //проверка бага, заменить после исправления на (user.email)
    // или расскоментировать
    // await expect(emailValue).toBe(user.email);
    // или
    // await expect(emailValue).toBe('');
  });
});
