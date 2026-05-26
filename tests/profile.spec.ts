import { test, expect } from '@playwright/test';
import { ProfilePage } from '../pages/ProfilePage';
import { LoginPage } from '../pages/LoginPage';
import { getTestUser } from '../helpers/testData';
import { RegisterPage } from '../pages/RegisterPage';

const EMAIL = process.env.TEST_USER_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;

if (!EMAIL || !PASSWORD) {
  throw new Error('❌ Missing environment variables. Check .env file');
}

test.describe('Profile Tests', () => {
  let profilePage: ProfilePage;
  let loginPage: LoginPage;

  test.describe('Existing user', () => {
    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(EMAIL, PASSWORD);
      await loginPage.expectSuccess();

      profilePage = new ProfilePage(page);
      await profilePage.goto();
    });

    test('PROFILE-01: Просмотр данных профиля @smoke', async () => {
      const firstName = await profilePage.getFirstName();
      const phone = await profilePage.getPhone();
      const lastName = await profilePage.getPhone();
      const username = await profilePage.getPhone();
      const email = await profilePage.getPhone();

      await profilePage.expecButtonSave();
      expect(username).not.toBe('');
      expect(email).not.toBe('');
      expect(lastName).not.toBe('');
      expect(firstName).not.toBe('');
      expect(phone).not.toBe('');
    });

    test('PROFILE-02: Редактирование имени @smoke', async () => {
      const newFirstName = `new_First_Name`;
      const newLastName = `new_Last_Name`;

      await profilePage.changeFirstName(newFirstName);
      await profilePage.changeLastName(newLastName);
      await profilePage.clickSave();
      await profilePage.expectSuccessMessage();
      await profilePage.expectFirstName(newFirstName);
      await profilePage.expectLastName(newLastName);
    });

    test('PROFILE-03: Редактирование телефона (позитивный) @regression', async () => {
      const newPhone = `+37529${Date.now()}`.slice(0, 13);

      await profilePage.changePhone(newPhone);
      await profilePage.clickSave();
      await profilePage.expectSuccessMessage();
      await profilePage.expectPhone(newPhone);
    });

    test('PROFILE-04: Редактирование телефона (негативный) @regression', async () => {
      const invalidPhone = '123';

      await profilePage.changePhone(invalidPhone);
      await profilePage.clickSave();
      await profilePage.expectErrorMessage();
    });

    test('PROFILE-06: Переход в историю заказов @smoke', async () => {
      await profilePage.clickProfile();
      await profilePage.goToOrders();
    });

    test('PROFILE-07: Выход из аккаунта @smoke', async () => {
      await profilePage.clickProfile();
      await profilePage.logout();
      await profilePage.expectNotLoggedIn();
    });
  });

  test.describe('Email uniqueness', () => {
    test('PROFILE-05: Редактирование email на уже существующий @regression', async ({
      page,
    }) => {
      const secondUser = getTestUser();

      const registerPage = new RegisterPage(page);
      await registerPage.goto();
      await registerPage.register(secondUser);
      await registerPage.expectSuccess();

      // Входим как основной пользователь
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(secondUser.email, secondUser.password);
      await loginPage.expectSuccess();

      // Пытаемся изменить email на email второго пользователя
      const profilePage = new ProfilePage(page);
      await profilePage.goto();
      await profilePage.changeEmail(EMAIL);
      await profilePage.clickSave();

      await expect(profilePage.errorEmail).toBeVisible();
    });
  });
});
