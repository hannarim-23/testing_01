import { test, expect } from '@playwright/test';
import { AdminPage } from '../pages/AdminPage';
import { LoginPage } from '../pages/LoginPage';

import { RegisterPage } from '../pages/RegisterPage';
import { CatalogPage } from '../pages/CatalogPage';
import { CartPage } from '../pages/CartPage';
import { ProfilePage } from '../pages/ProfilePage';

const ADMIN_EMAIL = process.env.ADMIN_USER || 'admin@test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const EXISTING_PRODUCT = 'Denim Jacket';
const EXISTING_WAREHOUSE = 'склад 123';

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
    const testProduct = {
      name: `Тестовый товар ${Date.now()}`,
      price: `999`,
      category: 'Книги',
      urlImage: '',
      description: 'some info',
    };

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

    // BUG-08: Невозможно создать новый товар
    // Ожидается: "Товар успешно создан и отображается в списке товаров"
    // Фактически: Товар не создаётся.  сохранение не работает
    // TODO: исправить в соответствии с комментариями в файле AdminPage.ts
    test('ADM-07: Создание нового товара @regression', async () => {
      await adminPage.createProduct(testProduct);
      await adminPage.expectProductInTable(testProduct.name);
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
      const newAddress = `New Address ${Date.now()}`;
      console.log('1111newAddress:', newAddress);
      await adminPage.editWarehouse(EXISTING_WAREHOUSE, newAddress);
      const addressAfterEdit = await adminPage.getWarehouseAddress(
        EXISTING_WAREHOUSE
      );

      expect(addressAfterEdit).toContain(newAddress);
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

  test('ADM-15: Изменение статуса заказа @regression', async ({ page }) => {
    const userEmail = `test_${Date.now()}@mail.ru`;
    const userPassword = '12345678';

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
    await catalogPage.addProductToCart('iPad Pro 11');

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
    const orderId = orderNumberText?.slice(7, 9); //orderNumberText?.match(/\d+/)?.[0];
    console.log(` Создан заказ #${orderId} для пользователя ${userEmail}`);

    console.log('2. Вход в админ-панель и изменение статуса');
    const profilePage = new ProfilePage(page);
    await profilePage.logout();
    await profilePage.expectNotLoggedIn();

    // Вход как администратор
    const adminLoginPage = new LoginPage(page);
    await adminLoginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    await adminLoginPage.expectSuccess();

    // Переход в админ-панель
    const adminPage = new AdminPage(page);
    await adminPage.goToDashboard();
    await adminPage.goToOrders();

    // Находим созданный заказ и меняем статус
    const orderRow = page.locator(`tr:has-text("#${orderId}")`);
    await expect(orderRow).toBeVisible({ timeout: 10000 });

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

    // Вход пользователя
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
