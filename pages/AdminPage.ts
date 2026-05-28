import { Page, Locator, expect } from '@playwright/test';

export class AdminPage {
  readonly page: Page;

  // Навигация
  readonly dashboardLink: Locator;
  readonly productsLink: Locator;
  readonly warehousesLink: Locator;
  readonly ordersLink: Locator;
  readonly logoutButton: Locator;
  readonly buttonProfile: Locator;
  readonly buttonAdmin: Locator;

  // Товары
  readonly productTable: Locator;
  readonly productsTable: Locator;
  readonly createProductButton: Locator;
  readonly errorAddProduct: Locator;
  readonly succesAddProduct: Locator;

  // Форма товара
  readonly productNameInput: Locator;
  readonly productDescriptionInput: Locator;
  readonly productPriceInput: Locator;
  readonly productImageInput: Locator;
  readonly productCategorySelect: Locator;
  readonly productCategory: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // Склады
  readonly warehouseTable: Locator;
  readonly createWarehouseButton: Locator;
  readonly warehouseNameInput: Locator;
  readonly warehouseAddressInput: Locator;
  readonly warehouseBtnSave: Locator;
  readonly warehouseBtnReject: Locator;

  // Заказы
  readonly orderTable: Locator;
  readonly orderStatusSelect: (orderId: string) => Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonProfile = page.locator('button:has-text("ADMIN")');
    this.logoutButton = page.getByText('Выйти');
    this.buttonAdmin = page.locator('a[href*="/admin"]');

    // Навигация
    this.dashboardLink = page.getByRole('link', { name: 'Обзор' });
    this.productsLink = page.getByRole('link', { name: 'Товары' });
    this.warehousesLink = page.getByRole('link', { name: 'Склады' });
    this.ordersLink = page.getByRole('link', { name: 'Заказы' });

    // Товары
    this.productTable = page.locator('table');
    this.productsTable = page.locator('tr');
    this.createProductButton = page.getByRole('button', {
      name: 'Создать товар',
    });
    this.errorAddProduct = page.getByText('Не удалось создать товар');
    this.succesAddProduct = page.getByText('Товар успещшно добавлен');

    // Форма товара
    this.productNameInput = page.locator(
      'input[name="name"], input[placeholder*="Название"]'
    );
    this.productDescriptionInput = page.locator(
      'input[name="description"], input[placeholder*="Описание"]'
    );
    this.productPriceInput = page.locator('input[name="price"]');
    this.productImageInput = page.locator('input[name="urlImage"]');
    this.productCategory = page
      .locator('[role="combobox"], .category-select, [data-state="closed"]')
      .first();
    this.productCategorySelect = page.locator('select[name="category"]');
    this.saveButton = page.getByRole('button', { name: 'Сохранить' });
    this.cancelButton = page.getByRole('button', { name: 'Отмена' });

    // Склады
    this.warehouseTable = page.locator('table');
    this.createWarehouseButton = page.getByRole('button', {
      name: 'Создать склад',
    });
    this.warehouseNameInput = page.locator('input[name="title"]');
    this.warehouseAddressInput = page.locator('input[name="address"]');
    this.warehouseBtnSave = page.getByText('Сохранить');
    this.warehouseBtnReject = page.getByText('Отмена');

    // Заказы
    this.orderTable = page.locator('table');
    this.orderStatusSelect = (orderId: string) =>
      page.locator(`tr:has-text("${orderId}") select`);
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }
  // ========== Авторизация админа ==========

  async expectLoggedIn() {
    await expect(this.page).toHaveURL('/');
  }

  async logout() {
    const logoutButton = this.page.locator('button:has-text("Выйти")');
      if (await logoutButton.isVisible().catch(() => false)) {
        await logoutButton.click();
    } else {
        // Если не в админ-панели, используем старый способ
        await this.buttonProfile.click();
        await this.logoutButton.click();
    }
    
    await this.page.waitForLoadState('networkidle');
    /*
    await this.buttonProfile.click();
    await this.logoutButton.click();*/
  }

  async expectNotLoggedIn() {
    await expect(this.page).toHaveURL('/login');
  }

  // ========== Навигация ==========

  async goToDashboard() {
    await this.buttonAdmin.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectAdminPageLoaded() {
    await expect(this.page).toHaveURL('/admin');
    await expect(this.page.getByText('Добро пожаловать!')).toBeVisible();
    await expect(this.dashboardLink).toBeVisible();
    await expect(this.productsLink).toBeVisible();
    await expect(this.warehousesLink).toBeVisible();
    await expect(this.ordersLink).toBeVisible();
  }

  // ========== Проверки навигации ==========

  async goToProducts() {
    await this.productsLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToWarehouses() {
    await this.warehousesLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToOrders() {
    await this.ordersLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ========== Товары ==========
  async expectProductTableVisible() {
    await expect(this.productTable).toBeVisible();
    await expect(this.createProductButton).toBeVisible();
  }

  async countProductsVisible() {
    const count = await this.productsTable.count();
    expect(count).toBeGreaterThan(0);
  }

  async createProduct(product: {
    name: string;
    description?: string;
    price: string;
    urlImage?: string;
    category?: string;
  }) {
    await this.createProductButton.click();
    await this.page.waitForLoadState('networkidle');

    await this.productNameInput.fill(product.name);
    await this.productPriceInput.fill(product.price);
    await this.productDescriptionInput.fill(product.description ?? '');
    await this.productImageInput.fill(product.urlImage ?? '');

    if (product.category) {
      await this.productCategory.click();
      const option = this.page
        .locator(`[role="option"]:has-text("${product.category}")`)
        .first();
      await option.click();
    }

    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
    //await expect(this.succesAddProduct).toBeVisible(); //расскоментировать, когда устранится БАГ-08
    await expect(this.errorAddProduct).toBeVisible(); // закоментировать, когда устранится БАГ-08
  }

  async getProductRow(productName: string) {
    return this.page.locator(`tr:has-text("${productName}")`);
  }

  async expectProductInTable(productName: string) {
    //await expect(this.getProductRow(productName)).toBeVisible();//расскоментировать, когда устранится БАГ-08
  }

  /*
        async expectProductNotInTable(productName: string) {
        await expect(this.getProductRow(productName)).not.toBeVisible();
    }
*/

  async editProduct(
    productName: string,
    updates: {
      name?: string;
      price?: string;
      description?: string;
      urlImage?: string;
      category?: string;
    }
  ) {
    await this.editProductButton(productName).click();
    await this.page.waitForLoadState('networkidle');

    if (updates.name) {
      await this.productNameInput.clear();
      await this.productNameInput.fill(updates.name);
    }
    if (updates.description) {
      await this.productDescriptionInput.clear();
      await this.productDescriptionInput.fill(updates.description);
    }
    if (updates.price) {
      await this.productPriceInput.clear();
      await this.productPriceInput.fill(updates.price);
    }
    if (updates.urlImage) {
      await this.productImageInput.clear();
      await this.productImageInput.fill(updates.urlImage);
    }
    if (updates.category) {
      await this.productCategory.click();
      const option = this.page
        .locator(`[role="option"]:has-text("${updates.category}")`)
        .first();
      await option.click();
    }
  }
  async saveAfterEdit() {
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async cancelEditProduct() {
    await this.cancelButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  editProductButton(productName: string) {
    return this.page
      .locator(`tr:has-text("${productName}") button:has-text("Редакт.")`)
      .first();
  }

  deleteProductButton(productName: string) {
    return this.page
      .locator(`tr:has-text("${productName}") button:has-text("Удалить")`)
      .first();
  }

  /*
    async deleteProduct(productName: string) {
        await this.deleteProductButton(productName).click();
        await this.page.waitForLoadState('networkidle');
        // Подтверждение удаления (если есть)
        const confirmButton = this.page.getByRole('button', { name: 'Подтвердить', 'Удалить' });
        if (await confirmButton.isVisible().catch(() => false)) {
            await confirmButton.click();
        }
    }
*/
  async getProductPrice(productName: string) {
    const row = await this.getProductRow(productName);
    const priceCell = row.locator('td').nth(2);
    return (await priceCell.textContent()) || '';
  }

  // ========== Склады ==========
  async expectWarehouseTableVisible() {
    await expect(this.warehouseTable).toBeVisible();
  }

  async createWarehouse(name: string, address: string) {
    await this.createWarehouseButton.click();
    await this.page.waitForLoadState('networkidle');

    await this.warehouseNameInput.fill(name);
    await this.warehouseAddressInput.fill(address);
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectWarehouseInTable(warehouseName: string) {
    await expect(
      this.page.locator(`tr:has-text("${warehouseName}")`)
    ).toBeVisible();
  }

  async editWarehouse(warehouseName: string, newAddress: string) {
    const row = this.page.locator(`tr:has-text("${warehouseName}")`);
    const editButton = row.locator('button:has-text("Редакт.")').first();

    await editButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.warehouseAddressInput.clear();
    await this.warehouseAddressInput.fill(newAddress);
    await this.saveAfterEdit();

    await expect(this.warehouseAddressInput).not.toBeVisible();
  }

  async getWarehouseAddress(warehouseName: string) {
    const row = this.page.locator(`tr:has-text("${warehouseName}")`);
    const addressCell = row.locator('td').nth(2); // адрес в 3-й колонке
    const addressText = await addressCell.textContent();
    console.log(`addressText вернул: ${addressText}`);
    return addressText?.trim() || '';
  }

  // ========== Заказы ==========
  async expectOrderTableVisible() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.orderTable).toBeVisible();
  }
  /*
    async changeOrderStatus(orderId: string, newStatus: string) {
        await this.orderStatusSelect(orderId).selectOption(newStatus);
        await this.page.waitForLoadState('networkidle');
    }

    async getOrderStatus(orderId: string): Promise<string> {
        return await this.orderStatusSelect(orderId).inputValue();
    }

    */
}
