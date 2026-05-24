import { Page, Locator, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';

export class CatalogPage {
  readonly page: Page;
  readonly productCard: Locator;
  readonly addToCartButton: Locator;
  readonly cartIcon: Locator;
  readonly productPrice: Locator;
  readonly productImage: Locator;
  readonly errorMessageProduct: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCard = page.locator(selectors.productCard);
    this.addToCartButton = page.locator(selectors.addToCartButton);
    this.cartIcon = page.locator(selectors.cartIcon);
    this.productPrice = page.locator(selectors.productPrice);
    this.productImage = page.locator(selectors.productImage);
    this.errorMessageProduct = page.getByText(selectors.errorMessageProduct);
    this.successMessage = page.getByText('Товар добавлен в корзину');
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
    const addButton = productCard.locator(selectors.addToCartButton);
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
  }

  async addProductByHref(productHref: string) {
    await this.goto();

    const product = this.page.locator(`a[href="${productHref}"]`);
    await expect(product).toBeVisible({ timeout: 10000 });

    const addButton = product.locator(selectors.addToCartButton);
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();

    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
  }

  async getProductPriceByName(productName: string) {
    const productCard = await this.getProductCardByName(productName);
    const priceText = await productCard
      .locator(selectors.productPrice)
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
    await expect(this.page.locator('text=Загрузка продукта...')).toBeVisible();
    await expect(this.errorMessageProduct).toBeVisible({ timeout: 15000 });
  }

  // BUG-06: Некоторые изображения товаров не загружаются
  async loadImage() {
    await this.page.waitForLoadState('networkidle');

    const products = await this.page.locator(selectors.productCard).all();
    expect(products.length).toBeGreaterThan(0);

    let brokenImagesCount = 0;

    for (let i = 0; i < products.length; i++) {
      await expect(products[i]).toBeVisible();

      //можно сделать проверку всех элементов карточки
      //await expect(products[i].locator(selectors.productTitle).first()).toBeVisible(); //если бы можно было отследить
      //await expect(product[i].locator(selectors.productPrice).first()).toBeVisible();//если бы можно было отследить
      //await expect( products[i].locator(selectors.addToCartButton)).toBeVisible();

      // проверка загрузилась ли картинка
      const image = products[i].locator(selectors.productImage).first();
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

  async addProductByIndex(index: number) {
    const products = await this.productCard.all();
    if (index >= products.length) {
      throw new Error(`Товар с индексом ${index} не найден`);
    }
    const addButton = products[index].locator(selectors.addToCartButton);
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
  }

  async getProductPriceByIndex(index: number): Promise<number> {
    const products = await this.productCard.all();
    if (index >= products.length) {
      throw new Error(`Товар с индексом ${index} не найден`);
    }
    const priceText = await products[index]
      .locator(selectors.productPrice)
      .first()
      .textContent();
    return parseFloat(priceText?.replace(/\s/g, '').replace(',', '.') || '0');
  }
}
