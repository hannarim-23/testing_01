import { Page, Locator, expect } from '@playwright/test';

export class CatalogPage {
  readonly page: Page;
  readonly productCard: Locator;
  readonly addToCartButton: Locator;
  readonly cartIcon: Locator;
  readonly productPrice: Locator;
  readonly productImage: Locator;
  readonly errorMessageProduct: Locator;
  readonly successMessage: Locator;
  readonly errorMessageCatalog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCard = page.locator('a[href*="/product/"]');
    this.addToCartButton = page.locator('button:has-text("В корзину")');
    this.cartIcon = page.locator('a[href="/cart"]');
    //this.productPrice = page.locator('a[href*="/product/"] span'); //'span'
    this.productPrice = page.locator('span'); //'span'
    this.productImage = page.locator('img');
    this.errorMessageProduct = page.getByText('Не удалось загрузить продукт');
    this.successMessage = page.getByText('Товар добавлен в корзину');
    this.errorMessageCatalog = page.getByText('Загрузка продукта...');
  }

  async goto() {
    await this.page.goto('/');
  }

  async expectSuccess() {
    await expect(this.page).toHaveURL('/');
  }

  async getProductCardByName(productName: string) {
    return this.page
      .locator(`a[href*="/product/"]:has-text("${productName}")`)
      .first();
  }

  async addProductToCart(productName: string) {
    const productCard = this.page
      .locator(`a[href*="/product/"]:has-text("${productName}")`)
      .first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    const addButton = productCard.locator(this.addToCartButton);
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
  }

  async addProductByHref(productHref: string) {
    await this.goto();

    const product = this.page.locator(`a[href="${productHref}"]`);
    await expect(product).toBeVisible({ timeout: 10000 });

    const addButton = product.locator(this.addToCartButton);
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();

    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
  }

  async getProductPriceByName(productName: string) {
    const productCard = await this.getProductCardByName(productName);
    const priceText = await productCard
      .locator(this.productPrice)
      .first()
      .textContent();
    const price = parseFloat(
      priceText?.replace(/\s/g, '').replace(',', '.') || '0'
    );
    return price;
  }

  async expectProductCount(expectedCount: number) {
    await expect(this.productCard).toHaveCount(expectedCount);
  }

  async expectProductVisible(productName: string) {
    const productCard = await this.getProductCardByName(productName);
    await expect(productCard).toBeVisible();
  }

  async goToCart() {
    await this.cartIcon.click();
  }

  async expectErrorMessage(errorProduct: string) {
    await this.page.goto(errorProduct);
    await expect(this.errorMessageCatalog).toBeVisible();
    await expect(this.errorMessageProduct).toBeVisible({ timeout: 15000 });
  }

  // BUG-06: Некоторые изображения товаров не загружаются
  async loadImage() {
    await this.page.waitForLoadState('networkidle');

    const products = await this.productCard.all();
    expect(products.length).toBeGreaterThan(0);

    let brokenImagesCount = 0;

    for (let i = 0; i < products.length; i++) {
      await expect(products[i]).toBeVisible();

      //можно сделать проверку всех элементов карточки
      //await expect(products[i].locator(this.productTitle).first()).toBeVisible(); //если бы можно было отследить
      //await expect(product[i].locator(this.productPrice).first()).toBeVisible();//если бы можно было отследить
      //await expect( products[i].locator(this.addToCartButton)).toBeVisible();

      // проверка загрузилась ли картинка
      const image = products[i].locator(this.productImage).first();
      const isLoaded = await image.evaluate((img) => {
        return (img as HTMLImageElement).naturalWidth > 0;
      });

      //логирование ошибки
      if (!isLoaded) {
        console.log(`⚠️ BUG-06: Товар ${i + 1}: картинка не загрузилась`);
        brokenImagesCount++;
      }
    }
    expect(brokenImagesCount).not.toBe(0); //после исправления бага 06 удалить (.not)
  }

  async addProductByIndexAndGetPrice(index: number) {
    await this.page.waitForLoadState('networkidle');
    const products = await this.productCard.all();

    // Получаем цену ДО добавления (чтобы не ждать после клика)
    const priceText = await products[index]
      .locator(this.productPrice)
      .first()
      .textContent();
    const price = parseFloat(
      priceText?.replace(/\s/g, '').replace(',', '.') || '0'
    );

    const addButton = products[index].locator(this.addToCartButton);
    await expect(addButton).toBeEnabled({ timeout: 5000 });
    await addButton.click();
    await expect(this.successMessage.first()).toBeVisible({ timeout: 5000 });

    return price;
  }
}
