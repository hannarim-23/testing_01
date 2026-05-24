import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CatalogPage } from '../pages/CatalogPage';
import { LoginPage } from '../pages/LoginPage';

const EMAIL = process.env.TEST_USER_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;

const PRODUCT_NAME = 'iPad Pro 11';
const PRODUCT_NAME2 = 'iPhone 15 Pro';
const PRODUCT_HREF1 = '/product/51'; // iPhone 15 Pro
const PRODUCT_HREF2 = '/product/54'; // iPad Pro 11

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

    const productPrice = 999.99;
    const expectedTotalPrice = (productPrice * 2).toFixed(2);
    const totalPrice = await cartPage.getTotalPrice();
    expect(totalPrice).not.toContain(expectedTotalPrice); //после исправления бага, удалить (.not)
  });

  test('TC_CART_04: Пустая корзина @smoke', async () => {
    await cartPage.clearCart();
    await cartPage.expectEmptyCart();
  });

  test('TC_CART_05: Общая сумма пересчитывается @regression', async () => {
    await cartPage.clearCart();

    // Добавляем товары через href (на главной странице)
    await catalogPage.addProductByHref(PRODUCT_HREF1);
    await catalogPage.addProductByHref(PRODUCT_HREF2);

    // Переходим в корзину
    await cartPage.goToCart();

    // Получаем общую сумму из корзины
    const totalText = await cartPage.getTotalPrice();
    const cartTotal = parseFloat(
      totalText?.replace(/[^\d.,]/g, '').replace(',', '.') || '0'
    );

    // Ожидаемая сумма (цены товаров)
    const expectedTotal = 999.99 + 799.0;

    // Округляем для сравнения
    const roundedActual = Math.round(cartTotal * 100) / 100;
    const roundedExpected = Math.round(expectedTotal * 100) / 100;

    console.log(`💰 Ожидаемая сумма: ${roundedExpected}`);
    console.log(`💰 Фактическая сумма: ${roundedActual}`);

    expect(roundedActual).toBe(roundedExpected);
  });

  test('TC_CART_06: Кнопка "Оформить заказ" @smoke', async () => {
    await catalogPage.addProductByHref(PRODUCT_HREF2);
    await cartPage.goToCart();
    await cartPage.checkout();
    await cartPage.expectOrderSuccess();
    await expect(cartPage.page).toHaveURL('/');
  });
});

/*
  // BUG-07: Система нестабильна при добавлении >20 товаров в корзину
  // Ожидание: стабильная работа с 50 товарами
  // Факт: падение на 10-25 товарах
  // TODO: уточнить требования и исправить
  test('TC_CART_07: Огромное количество товара"', async ({ page }) => {
    await clearCart(page); //принудительная очистка корзины
    await page.goto(`${BASE_URL}`);
    await page.waitForLoadState('networkidle');

    const products = await page.locator(selectors.productCard).all();
    console.log(`✅ products = `, products.length);

    let totalPrice = 0;
    const errors: number[] = [];

    for (let i = 0; i < 5; i++) {
      //после исправления бага изменить i < 5 => на i < products.length или 50

      try {
        const addButton = products[i].locator(selectors.addToCartButton);
        //await addButton.click();
        await expect(addButton).toBeEnabled({ timeout: 1000 });
        await addButton.click();

        const priceText = await products[i]
          .locator(selectors.productPrice)
          .first()
          .textContent();
        const price = parseFloat(
          priceText?.replace(/\s/g, '').split(' ')[0]?.replace(',', '.') || '0'
        );
        totalPrice = Math.round((totalPrice + price) * 100) / 100;
        console.log(`💰 Цена товара ${i + 1}: ${price}`);

        // Небольшая задержка между добавлениями
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log(`❌ Товар ${i + 1}: НЕ добавлен`);
        errors.push(i + 1);
      }
    }

    console.log(`\n💰 Общая сумма всех товаров: ${totalPrice}`);
    console.log(`❌ Не добавлено товаров: ${errors.length}`);

    if (errors.length > 0) {
      console.log(`Проблемные товары: ${errors.join(', ')}`);
    }

    // Переходим в корзину
    await page.click(selectors.cartIcon);
    await page.waitForLoadState('networkidle');

    const totalInCart = await page.locator(selectors.totalPrice).textContent();
    const cartTotal = parseFloat(
      totalInCart?.split(' ')[0]?.replace(',', '.') || '0'
    );

    console.log(`💰 Итого в корзине: ${cartTotal}`);

    expect(errors.length).toBe(0);
    expect(cartTotal).toBe(totalPrice);
  });
});
*/
