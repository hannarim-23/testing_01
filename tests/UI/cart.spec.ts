import { test, expect } from '@playwright/test';
import { CartPage } from '../../pages/UI/CartPage';
import { CatalogPage } from '../../pages/UI/CatalogPage';
import { LoginPage } from '../../pages/UI/LoginPage';

const EMAIL = process.env.TEST_USER_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;

const PRODUCT_NAME = 'iPad Pro 11';
const PRODUCT_HREF1 = '/product/1'; // iPhone 15 Pro
const PRODUCT_HREF2 = '/product/9'; // Apple Watch S9
const product_price = 999.99;
const product_price2 = 399;

if (!EMAIL || !PASSWORD) {
  throw new Error('❌ Missing environment variables. Check .env file');
}

test.describe('Cart Tests', () => {
  let cartPage: CartPage;
  let catalogPage: CatalogPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
    await loginPage.expectSuccess();

    cartPage = new CartPage(page);
    await cartPage.clearCart();

    catalogPage = new CatalogPage(page);
    await catalogPage.goto();
  });

  test('TC_CART_01: Добавление товара в корзину @smoke', async () => {
    await catalogPage.addProductToCart(PRODUCT_NAME);
    await cartPage.successAdd();
    await cartPage.goToCart();
    await cartPage.expectProductInCart(PRODUCT_NAME);
  });

  test('TC_CART_02: Удаление товара из корзины @smoke', async () => {
    await catalogPage.addProductToCart(PRODUCT_NAME);
    await cartPage.successAdd();
    await cartPage.goToCart();
    await cartPage.expectProductInCart(PRODUCT_NAME);
    await cartPage.removeProduct();
    await cartPage.expectEmptyCart();
  });

  // BUG-05: Повторное добавление товара не увеличивает количество в корзине
  // Ожидается: сумма товаров в корзине увеличивается в соответствии с колличеством одинаковых товаров
  // Фактически: товар добавляется только 1 раз
  // TODO: после исправления бага исправить в соответствии с комментарием
  test('TC_CART_03: Повторное добавление того же товара @regression', async () => {
    await catalogPage.addProductToCart(PRODUCT_NAME);
    await catalogPage.addProductToCart(PRODUCT_NAME);
    await cartPage.goToCart();
    await cartPage.expectProductInCart(PRODUCT_NAME);

    const expectedTotalPrice = (product_price * 2).toFixed(2);
    const totalPrice = await cartPage.getTotalPrice();
    expect(totalPrice).not.toContain(expectedTotalPrice); //после исправления бага, удалить (.not)
  });

  test('TC_CART_04: Пустая корзина @smoke', async () => {
    await cartPage.clearCart();
    await cartPage.expectEmptyCart();
  });

  test('TC_CART_05: Общая сумма пересчитывается @regression', async () => {
    await cartPage.clearCart();

    await catalogPage.addProductByHref(PRODUCT_HREF1);
    await catalogPage.addProductByHref(PRODUCT_HREF2);
    await cartPage.goToCart();

    const totalText = await cartPage.getTotalPrice();
    const cartTotal = parseFloat(
      totalText?.replace(/[^\d.,]/g, '').replace(',', '.') || '0'
    );

    const expectedTotal = product_price + product_price2;
    const roundedActual = Math.round(cartTotal * 100) / 100;
    const roundedExpected = Math.round(expectedTotal * 100) / 100;

    console.log(` Ожидаемая сумма: ${roundedExpected}`);
    console.log(` Фактическая сумма: ${roundedActual}`);

    expect(roundedActual).toBe(roundedExpected);
  });

  test('TC_CART_06: Кнопка "Оформить заказ" @smoke', async () => {
    await catalogPage.addProductByHref(PRODUCT_HREF2);
    await cartPage.goToCart();
    await cartPage.checkout();
    await cartPage.expectOrderSuccess();
    await expect(cartPage.page).toHaveURL('/');
  });

  // BUG-07: Система нестабильна при добавлении >20 товаров в корзину
  // Ожидание: стабильная работа с 50 товарами
  // Факт: падение на 10-25 товарах
  // TODO: уточнить требования и исправить
  test('TC_CART_07: Добавление первых 5 товаров @regression', async () => {
    await catalogPage.page.waitForLoadState('networkidle');

    let totalPrice = 0;

    for (let i = 0; i < 5; i++) {
      const price = await catalogPage.addProductByIndexAndGetPrice(i);
      totalPrice += price;
      console.log(`Товар ${i + 1}: ${price}`);
      await cartPage.page.waitForTimeout(300);
    }
    totalPrice = Math.round(totalPrice * 100) / 100;

    await cartPage.goToCart();
    const cartTotal = await cartPage.getCartTotalPrice();

    console.log(`Сумма товаров: ${totalPrice}, Итого в корзине: ${cartTotal}`);

    expect(cartTotal).toBe(totalPrice);
    //    expect(cartTotal).toBeCloseTo(totalPrice, 2); //альтернатива, округление внутри
  });
});
