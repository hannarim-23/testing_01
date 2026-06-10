import { test, expect } from '@playwright/test';
import { AdminPage } from '../../pages/UI/AdminPage';
import { LoginPage } from '../../pages/UI/LoginPage';

import { RegisterPage } from '../../pages/UI/RegisterPage';
import { CatalogPage } from '../../pages/UI/CatalogPage';
import { CartPage } from '../../pages/UI/CartPage';
import { ProfilePage } from '../../pages/UI/ProfilePage';

const ADMIN_EMAIL = process.env.ADMIN_USER || 'admin@test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const EXISTING_PRODUCT = 'Denim Jacket';
const test_product = 'iPad Pro 11';

const testProduct = {
  name: `Тестовый товар ${Date.now()}`,
  price: `999`,
  category: 'Книги',
  urlImage:
    'https://images.unsplash.com/photo-1625773143851-4f16a04e8d35?q=80&w=500',
  description: 'some info',
};

test.describe('Admin Panel Tests', () => {
  let adminPage: AdminPage;
  let loginPage: LoginPage;

  test.describe('Navigation & Access', () => {
    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      await loginPage.expectSuccess();

      adminPage = new AdminPage(page);
      await adminPage.goto();
    });

    test('ADM-01: Доступ к админ-панели @smoke', async () => {
      await adminPage.expectLoggedIn();
    });

    test('ADM-02: Выход из админ-панели @smoke', async () => {
      await adminPage.logout();
      await adminPage.expectNotLoggedIn();
    });

    test('ADM-16: Открытие страницы "Обзор" @smoke', async () => {
      await adminPage.goToDashboard();
      await adminPage.expectAdminPageLoaded();
    });
  });

  test.describe('Unauthorized Access', () => {
    test('ADM-03: Неавторизованный доступ @smoke', async ({ page }) => {
      adminPage = new AdminPage(page);
      await adminPage.goto();
      await adminPage.expectNotLoggedIn();
    });
  });

  test.describe('Products Management', () => {
    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      await loginPage.expectSuccess();

      adminPage = new AdminPage(page);
      await adminPage.goToDashboard();
      await adminPage.expectAdminPageLoaded();
      await adminPage.goToProducts();
    });

    test('ADM-04: Просмотр списка товаров @smoke', async () => {
      await adminPage.expectProductTableVisible();
      await adminPage.countProductsVisible();
    });

    test('ADM-07: Создание нового товара @regression', async () => {
      const test = testProduct;
      await adminPage.createProduct(test);
      await adminPage.expectProductInTable(test.name);
    });

    test('ADM-05: Редактирование товара @regression', async () => {
      const updates = {
        price: `${Date.now()}`.slice(0, 5),
        category: 'Книги',
        urlImage: `https://images.unsplash.com/photo-${Date.now()}`,
        description: 'test info',
      };
      console.log(`Новая цена: ${updates.price}`); // диагностика

      await adminPage.editProduct(EXISTING_PRODUCT, updates);
      await adminPage.saveAfterEdit();

      const priceAfterEdit = await adminPage.getProductPrice(EXISTING_PRODUCT);
      expect(priceAfterEdit).toContain(updates.price);
    });

    test('ADM-08: Отмена редактирования товара @regression', async () => {
      const originalPrice = await adminPage.getProductPrice(EXISTING_PRODUCT);
      console.log(`Оригинальная цена: ${originalPrice}`);

      const updates = {
        price: `${Date.now()}`.slice(0, 5),
        category: 'Книги',
        urlImage: `https://images.unsplash.com/photo-${Date.now()}`,
        description: 'test info',
      };
      console.log(`Новая цена: ${updates.price}`); // диагностика

      await adminPage.editProduct(EXISTING_PRODUCT, updates);
      await adminPage.cancelEditProduct();

      const priceAfterEdit = await adminPage.getProductPrice(EXISTING_PRODUCT);
      expect(priceAfterEdit).toContain(originalPrice);
    });
    /*
    test('ADM-09: Удаление товара @regression', async () => {
      await adminPage.createProduct(testProduct);
      await adminPage.expectProductInTable(testProduct.name);

      await adminPage.deleteProduct(testProduct.name);
      await adminPage.expectProductNotInTable(testProduct.name);
    });*/
  });

  test.describe('Warehouses Management', () => {
    const testWarehouse = {
      name: `Тестовый склад ${Date.now()}`,
      address: 'Тестовый адрес 123',
    };

    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      await loginPage.expectSuccess();

      adminPage = new AdminPage(page);
      await adminPage.goToDashboard();
      await adminPage.expectAdminPageLoaded();
      await adminPage.goToWarehouses();
    });

    test('ADM-10: Просмотр списка складов @smoke', async () => {
      await adminPage.expectWarehouseTableVisible();
    });

    test('ADM-11: Создание нового склада @regression', async () => {
      await adminPage.createWarehouse(
        testWarehouse.name,
        testWarehouse.address
      );
      await adminPage.expectWarehouseInTable(testWarehouse.name);
    });

    test('ADM-12: Редактирование склада @regression', async () => {
      // 1. Создаём уникальный склад
      const timestamp = Date.now();
      const warehouseName = `Тестовый склад ${timestamp}`;
      const oldAddress = `Старый адрес ${timestamp}`;

      await adminPage.createWarehouse(warehouseName, oldAddress);
      await adminPage.expectWarehouseInTable(warehouseName);

      // 2. Редактируем адрес
      const newAddress = `New Address ${timestamp}`;
      console.log('newAddress:', newAddress);

      await adminPage.editWarehouse(warehouseName, newAddress);

      // 3. Проверяем, что адрес обновился
      const addressAfterEdit = await adminPage.getWarehouseAddress(
        warehouseName
      );
      expect(addressAfterEdit).toContain(newAddress);

      // 4. Очистка (опционально, если есть DELETE эндпоинт)
      //await adminPage.deleteWarehouse(warehouseName);
    });
  });

  test.describe('Orders Management', () => {
    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      await loginPage.expectSuccess();

      adminPage = new AdminPage(page);
      await adminPage.goToDashboard();
      await adminPage.expectAdminPageLoaded();
      await adminPage.goToOrders();
    });

    test('ADM-14: Просмотр списка заказов @smoke', async () => {
      await adminPage.expectOrderTableVisible();
    });
  });

  test.describe.serial('ADM-15: Изменение статуса заказа', () => {
    let orderId;
    const userEmail = `test_${Date.now()}@mail.ru`;
    const userPassword = '12345678';

    test('1. Создание заказа', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();
      await registerPage.register({
        firstname: 'Тест',
        lastname: 'Тестов',
        email: userEmail,
        username: `user_${Date.now()}`,
        phone: `+37529${Date.now()}`.slice(0, 13),
        password: userPassword,
      });
      await registerPage.expectSuccess();

      // Вход пользователя
      const loginPage = new LoginPage(page);
      await loginPage.login(userEmail, userPassword);
      await loginPage.expectSuccess();

      // Добавление товара в корзину
      const catalogPage = new CatalogPage(page);
      await catalogPage.goto();
      await catalogPage.addProductToCart(test_product);

      // Оформление заказа
      const cartPage = new CartPage(page);
      await cartPage.goToCart();
      await cartPage.checkout();
      await cartPage.expectOrderSuccess();

      // Получаем номер заказа (сохраняем для проверки)
      await page.goto('/orders');
      const orderNumberElement = page
        .locator('button:has-text("Заказ #")')
        .first();
      const orderNumberText = await orderNumberElement.textContent();
      orderId = orderNumberText?.slice(7, 10); //orderNumberText?.match(/\d+/)?.[0];
      //  const orderId = orderNumberText?.slice(7, 10); //orderNumberText?.match(/\d+/)?.[0];
      console.log(` Создан заказ #${orderId} для пользователя ${userEmail}`);
      const profilePage = new ProfilePage(page);
      await profilePage.buttonProfile.click();
      await profilePage.logout();
      await profilePage.expectNotLoggedIn();
    });

    test('2. Админ меняет статус', async ({ page }) => {
      // Вход как администратор
      const adminLoginPage = new LoginPage(page);
      await adminLoginPage.goto();
      await adminLoginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      await adminLoginPage.expectSuccess();

      // Переход в админ-панель
      const adminPage = new AdminPage(page);
      await adminPage.goToDashboard();
      await adminPage.goToOrders();

      // Находим созданный заказ и меняем статус
      await page.waitForLoadState('networkidle'); //
      const pageText = await page.textContent('body');
      console.log('Текст страницы:', pageText?.substring(0, 500) || '');

      const orderRow = page.locator(`tr:has-text("#${orderId}")`);
      console.log(`Ищем заказ с ID: ${orderId}`);

      await expect(orderRow).toBeVisible({ timeout: 30000 });

      // Проверяем текущий статус (должен быть PENDING)
      const statusCell = orderRow.locator('td').nth(3);
      await expect(statusCell).toHaveText('PENDING');
      console.log(` Заказ #${orderId} имеет статус PENDING`);

      const statusTrigger = orderRow
        .locator('[role="combobox"], .status-select, [data-state="closed"]')
        .first();
      await statusTrigger.click();

      // Выбираем нужный статус из выпадающего списка
      const option = page
        .locator(`[role="option"]:has-text("DELIVERED")`)
        .first();
      await option.click();

      await expect(statusCell).toHaveText('DELIVERED');
      console.log(`✅ Заказ #${orderId} изменён на DELIVERED`);
      console.log('👤 3. Проверяем статус заказа от имени клиента');
      // Выход из админа
      await adminPage.logout();
    });

    test('3. Пользователь проверяет статус', async ({ page }) => {
      // Вход пользователя
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(userEmail, userPassword);
      await loginPage.expectSuccess();

      // Переход в заказы
      await page.goto('/orders');

      // Проверяем статус заказа
      const userOrderRow = page.locator(`button:has-text("Заказ #${orderId}")`);
      await expect(userOrderRow).toBeVisible();
      await expect(userOrderRow).toContainText('DELIVERED', { timeout: 5000 });
    });
  });
});
