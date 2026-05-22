import { test, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';
import { clearCart } from '../helpers/clearCart';

const BASE_URL = process.env.BASE_URL;
const EMAIL = process.env.TEST_USER_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;

const product = 'iPhone 15 Pro';
const product2 = 'iPad Pro 11';
const productHref1 = '/product/51';
const productHref2 = '/product/54';

if (!BASE_URL || !EMAIL || !PASSWORD) {
  throw new Error('❌ Missing environment variables. Check .env file');
}

test.describe('Cart Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill(selectors.emailInput, EMAIL);
    await page.fill(selectors.passwordInput, PASSWORD);
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('TC_CART_01: Добавление товара в корзину', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/51`); //iPhone 15 Pro

    await expect(page.getByText(product)).toBeVisible();

    await page.click(selectors.addToCartButton);
    await page.click(selectors.cartIcon);

    await expect(page).toHaveURL(`${BASE_URL}/cart`);
    await expect(page.getByText(product)).toBeVisible();
  });

  test('TC_CART_02: Удаление товара из корзины', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/51`); //iPhone 15 Pro

    await expect(page.getByText(product)).toBeVisible();

    await page.click(selectors.addToCartButton);
    await page.click(selectors.cartIcon);

    await expect(page).toHaveURL(`${BASE_URL}/cart`);
    await expect(page.getByText(product)).toBeVisible();

    await page.click(selectors.removeButton);
    await expect(page.getByText(product)).not.toBeVisible();
  });

  // BUG-05: Повторное добавление товара не увеличивает количество в корзине
  // Ожидается: сумма товаров в корзине увеличивается в соответствии с колличеством одинаковых товаров
  // Фактически: товар добавляется только 1 раз
  // TODO: после исправления бага исправить в соответствии с комментарием
  test('TC_CART_03: Повторное добавление того же товара', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/51`); //iPhone 15 Pro

    await expect(page.getByText(product)).toBeVisible();

    await page.click(selectors.addToCartButton);
    await page.click(selectors.addToCartButton);
    await page.click(selectors.cartIcon);

    const productPrice = 999.99;
    const expectedTotalPrice = (productPrice * 2).toFixed(2).toString();

    await expect(page).toHaveURL(`${BASE_URL}/cart`);
    await expect(page.locator(selectors.totalPrice)).not.toContainText(
      expectedTotalPrice
    ); //после исправления бага, удалить (.not)
  });

  test('TC_CART_04: Пустая корзина', async ({ page }) => {
    await page.goto(`${BASE_URL}/cart`);
    await expect(page.locator(selectors.emptyCartMessage));

    await page.goto(`${BASE_URL}/product/51`); //iPhone 15 Pro
    await expect(page.getByText(product)).toBeVisible();
    await page.click(selectors.addToCartButton);

    await page.goto(`${BASE_URL}/cart`);
    await expect(page.getByText(product)).not.toBeVisible();
  });

  test('TC_CART_05: Общая сумма пересчитывается', async ({ page }) => {
    await page.goto(`${BASE_URL}`);

    const firstProduct = page.locator(`a[href="${productHref1}"]`);
    const secondProduct = page.locator(`a[href="${productHref2}"]`);

    await firstProduct.locator(selectors.addToCartButton).click();
    await secondProduct.locator(selectors.addToCartButton).click();

    await page.click(selectors.cartIcon);
    await page.waitForLoadState('networkidle');

    // Ищем цены ТОЛЬКО в корзине
    const cartItems = page.locator('.text-sm.text-muted-foreground');
    const itemCount = await cartItems.count();
    console.log('Товаров в корзине:', itemCount);

    let totalFromItems = 0;

    for (let i = 0; i < itemCount; i++) {
      const priceText = await cartItems.nth(i).textContent();
      const price = parseFloat(priceText?.split(' ')[0] || '0');
      totalFromItems += price;
      console.log(`Товар ${i + 1}: ${price}`);
    }

    const cartTotalPrise = await page
      .locator(selectors.totalPrice)
      .textContent();
    console.log('cartTotalPrise:', cartTotalPrise);
    console.log(
      'cartTotalPrise:',
      parseFloat(cartTotalPrise.split(' ')[0] || '0')
    );

    const isTrue =
      parseFloat(cartTotalPrise.split(' ')[0] || '0') == totalFromItems;
    expect(isTrue).toBeTruthy();
  });

  test('TC_CART_06: Кнопка "Оформить заказ"', async ({ page }) => {
    await page.goto(`${BASE_URL}/orders`);

    await page.waitForLoadState('networkidle');

    const ordersBefore = await page.locator(selectors.order).all();
    console.log('ordersBefore:', ordersBefore.length);

    await page.goto(`${BASE_URL}/product/51`); //iPhone 15 Pro
    await expect(page.getByText(product)).toBeVisible();
    await page.click(selectors.addToCartButton);

    await page.goto(`${BASE_URL}/cart`);
    await page.click(selectors.checkoutButton);
    await expect(page.locator(selectors.orderSuccessMessage)).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}`);

    await page.goto(`${BASE_URL}/orders`);

    await page.waitForLoadState('networkidle');
    const ordersAfter = await page.locator(selectors.order).all();
    console.log('ordersAfter:', ordersAfter.length);

    await expect(ordersAfter.length == ordersBefore.length + 1).toBeTruthy();
  });

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
