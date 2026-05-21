import { test, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';

const BASE_URL = process.env.BASE_URL;
const EMAIL = process.env.TEST_USER_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;

if (!BASE_URL || !EMAIL || !PASSWORD) {
  throw new Error('❌ Missing environment variables. Check .env file');
}

test.describe('Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill(selectors.emailInput, EMAIL);
    await page.fill(selectors.passwordInput, PASSWORD);
    await page.click(selectors.submitButton);

    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('TC_Ctlg_01: Открытие главной страницы', async ({ page }) => {
    await expect(page).toHaveURL(`${BASE_URL}/`);

    const products = page.locator(selectors.productCard);
    await expect(products.first()).toBeVisible();

    const products2 = await page.locator(selectors.productCard).all(); //массив
    // Проверяем, что массив не пустой
    expect(products2.length).toBeGreaterThan(0);
    // Или
    expect(products2.length > 0).toBe(true);
  });

  test('TC_Ctlg_02: Количество товаров = 50', async ({ page }) => {
    const products = page.locator(selectors.productCard);
    await expect(products).toHaveCount(50);

    const products2 = await page.locator(selectors.productCard).all();
    expect(products2.length == 50).toBe(true);
  });

  // BUG-06: Некоторые изображения товаров не загружаются
  // Ожидается: все картинки загружены (naturalWidth > 0)
  // Фактически: у некоторых товаров naturalWidth = 0
  // TODO: после исправления бага убрать сбор списка битых картинок
  test.skip('TC_Ctlg_03: Карточка товара содержит все элементы', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    const products = await page.locator(selectors.productCard).all();
    expect(products.length).toBeGreaterThan(0);
    console.log(`Найдено товаров: ${products.length}`);

    //  const brokenImages: number[] = [];

    for (let i = 0; i < products.length; i++) {
      await expect(products[i]).toBeVisible();

      //await expect(products[i].locator(selectors.productTitle).first()).toBeVisible(); //если бы можно было отследить
      //await expect(product[i].locator(selectors.productPrice).first()).toBeVisible();//если бы можно было отследить

      await expect(
        products[i].locator(selectors.addToCartButton)
      ).toBeVisible();

      // проверка загрузилась ли картинка
      const image = products[i].locator(selectors.productImage).first();
      const isLoaded = await image.evaluate((img) => {
        return (img as HTMLImageElement).naturalWidth > 0;
      });
      expect(isLoaded, `❌ Товар ${i + 1}: картинка не загрузилась`).toBe(true);

      /*
        // проверка загрузилась ли картинка
        const image = products[i].locator('img').first();
        const hasError = await image.evaluate((img) => {
            const imageElement = img as HTMLImageElement;
            return imageElement.complete && imageElement.naturalWidth === 0;
        });
        
        if (hasError) {
            const altText = await image.getAttribute('alt');
            console.log(`❌ Товар ${i + 1}: картинка НЕ загружена (alt: ${altText})`);
            brokenImages.push(i + 1);
        } else {
            console.log(`✅ Товар ${i + 1}: картинка загружена`);
        }
            */
    }
    /*
    if (brokenImages.length > 0) {
        console.log(`\n❌ БАГ: Не загрузились картинки у товаров: ${brokenImages.join(', ')}`);
    }
    
    expect(brokenImages.length).toBe(0);
    */
  });

  test('TC_Ctlg_04: Открытие карточки товара', async ({ page }) => {
    const productName = 'iPad Pro 11';
    const productLink = page
      .locator(`a[href*="/product/"]:has-text("${productName}")`)
      .first();
    await expect(productLink).toBeVisible();

    const href = await productLink.getAttribute('href');
    await productLink.click();

    await expect(page).toHaveURL(`${BASE_URL}${href}`);
    await expect(page.getByText(productName)).toBeVisible();
  });

  test('TC_Ctlg_05: Кнопка "Добавить" работает', async ({ page }) => {
    const productName = 'iPad Pro 11';
    const productLink = page
      .locator(`a[href*="/product/"]:has-text("${productName}")`)
      .first();
    await expect(productLink).toBeVisible();

    const addBtn = productLink.locator(selectors.addToCartButton);
    await addBtn.click();

    await expect(page.getByText('Товар добавлен в корзину')).toBeVisible();

    const cart = page.locator(selectors.cart);
    await cart.click();

    await expect(page).toHaveURL(`${BASE_URL}/cart`);
    await expect(page.getByText(productName)).toBeVisible();
  });

  test('TC_Ctlg_06: Открытие несуществующей карточки товара', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/product/999999`);

    await expect(page.locator('text=Загрузка продукта...')).toBeVisible();
    const errorMessage = page.locator('text=Не удалось загрузить продукт');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });
});
