import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const BASE_URL = process.env.BASE_URL; //baseURL в конфиге, поэтому не обязателен
const EMAIL = process.env.TEST_USER_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;

// Проверяет, что все нужные переменные загрузились из .env. Если какой-то нет — тесты даже не запустятся, а сразу покажут ошибку
if (!BASE_URL || !EMAIL || !PASSWORD) {
  throw new Error('❌ Missing environment variables. Check .env file');
}

test.describe('Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC_LOG_01: Успешный вход @smoke @regression', async () => {
    await loginPage.login(EMAIL, PASSWORD);
    await loginPage.expectSuccess();
  });

  test('TC_LOG_02: Неверный пароль @regression', async () => {
    await loginPage.login(EMAIL, 'wrongpassword');
    await loginPage.expectErrorOnPage();
  });

  test('TC_LOG_03: Несуществующий email @regression', async () => {
    await loginPage.login('nonexistent@mail.ru', PASSWORD);
    await loginPage.expectErrorOnPage();
  });

  test('TC_LOG_04: Пустой email @regression', async () => {
    await loginPage.login('', PASSWORD);
    await loginPage.expectEmailError();
  });

  test('TC_LOG_05: Пустой пароль @regression', async () => {
    await loginPage.login(EMAIL, '');
    await loginPage.expectPasswordError();
  });

  // BUG-03: Фронтенд не проверяет формат email на странице входа
  // Ожидается: ошибка валидации на фронтенде до отправки запроса
  // Фактически: форма отправляется, сервер возвращает "Неверный email или пароль"
  // TODO: добавить проверку фронтенд-валидации после исправления
  test('TC_LOG_06: Невалидный формат email @regression', async () => {
    await loginPage.login('test', PASSWORD);
    await loginPage.expectErrorOnPage();
  });

  test('TC_LOG_07: Оба поля пустые @regression', async () => {
    await loginPage.login('', '');
    await loginPage.expectEmailError();
    await loginPage.expectPasswordError();
  });

  test('TC_LOG_08: SQL инъекция @regression', async () => {
    await loginPage.login(`' OR '1'='1`, `' OR '1'='1`);
    await loginPage.expectErrorOnPage();
  });
});
