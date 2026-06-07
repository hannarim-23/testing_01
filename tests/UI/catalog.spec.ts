import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../pages/UI/CatalogPage';
import { LoginPage } from '../../pages/UI/LoginPage';

const EMAIL = process.env.TEST_USER_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;
const PRODUCT_NUMBER = 50;
const PRODUCT_NAME_TEST = 'iPad Pro 11';
const INVALD_PAGE = '/product/999999';

if (!EMAIL || !PASSWORD) {
  throw new Error('❌ Missing environment variables. Check .env file');
}

test.describe('Catalog Tests', () => {
  let catalogPage: CatalogPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
    await loginPage.expectSuccess();

    catalogPage = new CatalogPage(page);
    await catalogPage.goto();
  });

  test('TC_Ctlg_01: Открытие главной страницы @smoke', async () => {
    await catalogPage.expectSuccess();
  });

  test('TC_Ctlg_02: Количество товаров > 50 @smoke', async () => {
    await catalogPage.expectSuccess();
    await catalogPage.expectProductCount(PRODUCT_NUMBER);
  });

  // BUG-06: Некоторые изображения товаров не загружаются
  // Ожидается: все картинки загружены (naturalWidth > 0)
  // Фактически: у некоторых товаров naturalWidth = 0
  // TODO: после исправления бага исправить в CatalogPages.ts метод
  test('TC_Ctlg_03: Карточка товара содержит элементы @regression', async () => {
    await catalogPage.loadImage();
  });

  test('TC_Ctlg_04: Открытие карточки товара @smoke', async () => {
    const productCard = await catalogPage.getProductCardByName(
      PRODUCT_NAME_TEST
    );
    const href = await productCard.getAttribute('href');

    await productCard.click();
    await expect(catalogPage.page).toHaveURL(`${href}`);
    await expect(catalogPage.page.getByText(PRODUCT_NAME_TEST)).toBeVisible();
  });

  test('TC_Ctlg_05: Кнопка "Добавить" работает @smoke', async () => {
    await catalogPage.addProductToCart(PRODUCT_NAME_TEST);

    await expect(
      catalogPage.page.getByText('Товар добавлен в корзину')
    ).toBeVisible();

    await catalogPage.goToCart();
    await expect(catalogPage.page).toHaveURL('/cart');
    await expect(catalogPage.page.getByText(PRODUCT_NAME_TEST)).toBeVisible();
  });

  test('TC_Ctlg_06: Открытие несуществующего товара @regression', async () => {
    await catalogPage.expectErrorMessage(INVALD_PAGE);
  });
});
