import { test, expect } from '@playwright/test';
import { OrdersPage } from '../../pages/UI/OrdersPage';
import { LoginPage } from '../../pages/UI/LoginPage';
import { CartPage } from '../../pages/UI/CartPage';
import { getTestUser } from '../../helpers/testData';
import { RegisterPage } from '../../pages/UI/RegisterPage';

const EMAIL = process.env.TEST_USER_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;

if (!EMAIL || !PASSWORD) {
  throw new Error('❌ Missing environment variables. Check .env file');
}

test.describe('Orders Tests', () => {
  let ordersPage: OrdersPage;
  let loginPage: LoginPage;
  let cartPage: CartPage;

  test.describe('Existing user with orders', () => {
    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(EMAIL, PASSWORD);
      await loginPage.expectSuccess();

      ordersPage = new OrdersPage(page);
      await ordersPage.goto();
    });

    test('ORD-01: Просмотр деталей заказа @smoke', async () => {
      const ordersCount = await ordersPage.getOrdersCount();
      expect(ordersCount).toBeGreaterThan(0);

      await ordersPage.clickOnOrderByIndex(0);
      await ordersPage.expectOrderDetailsVisible();
      await ordersPage.expectOrderNumberVisible();
      await ordersPage.expectOrderTotalPriceVisible();
    });

    test('ORD-03: Статус заказа @regression', async () => {
      const ordersCount = await ordersPage.getOrdersCount();
      expect(ordersCount).toBeGreaterThan(0);

      await ordersPage.expectAllOrdersHaveValidStatus();
    });

    test('ORD-04: Кнопка "Оформить заказ" неактивна при пустой корзине @regression', async ({
      page,
    }) => {
      const cartPage = new CartPage(page);
      await cartPage.clearCart();
      await cartPage.goToCart();
      await cartPage.expectEmptyCart();

      await ordersPage.expectCheckoutButtonDisabled();
    });
  });

  test.describe('New user without orders', () => {
    test('ORD-02: Пустой список заказов @regression', async ({ page }) => {
      //регистрация
      const newUser = getTestUser();
      const registerPage = new RegisterPage(page);
      await registerPage.goto();
      await registerPage.register(newUser);
      await registerPage.expectSuccess();

      // Вход
      const loginPage = new LoginPage(page);
      await loginPage.login(newUser.email, newUser.password);
      await loginPage.expectSuccess();

      ordersPage = new OrdersPage(page);
      await ordersPage.goto();

      await ordersPage.expectEmptyOrdersMessage();

      // Проверяем, что нет ни одного заказа
      const ordersCount = await ordersPage.getOrdersCount();
      expect(ordersCount).toBe(0);
    });
  });
});
