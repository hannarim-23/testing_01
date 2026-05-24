import { Page, Locator, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';

export class CartPage {
  readonly page: Page;
  readonly cartIcon: Locator;
  //readonly cartItem: Locator;
  readonly removeButton: Locator;
  readonly totalPrice: Locator;
  readonly checkoutButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly successMessage: Locator;
  readonly cartItemPrice: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartIcon = page.locator(selectors.cartIcon);
    //this.cartItem = page.locator(selectors.cartItem);
    this.removeButton = page.locator(selectors.removeButton);
    this.totalPrice = page.locator(selectors.totalPrice);
    this.checkoutButton = page.locator(selectors.checkoutButton);
    this.emptyCartMessage = page.locator(selectors.emptyCartMessage);
    this.successMessage = page.getByText('Товар добавлен в корзину');
    this.cartItemPrice = page.locator(selectors.cartItemPrice);
  }
/*
  async goto() {
    await this.page.goto('/cart');
  }
*/
  async goToCart() {
    await this.cartIcon.click();
  }
  
  async successAdd() {
    await expect(this.successMessage).toBeVisible();
  }

  async expectProductInCart(productName: string) {
    await expect(this.page.getByText(productName)).toBeVisible();
  }

  async removeProduct() {
    await this.removeButton.first().click();
  }

  async getTotalPrice() {
  await expect(this.totalPrice).toBeVisible();
    return await this.totalPrice.textContent();
  }

  async expectEmptyCart() {
    await expect(this.emptyCartMessage).toBeVisible();
  }
/*
  async expectProductNotInCart(productName: string) {
    await expect(this.page.getByText(productName)).not.toBeVisible();
  }

  async expectTotalPrice(expectedPrice: number) {
    const totalText = await this.totalPrice.textContent();
    const actualPrice = parseFloat(
      totalText?.replace(/\s/g, '').replace(',', '.') || '0'
    );
    await expect(actualPrice).toBe(expectedPrice);
  }
  /*
  async expectTotalPrice(expectedPrice: number) {
    const actualPrice = await this.getTotalPriceFromCart();
    const roundedExpected = Math.round(expectedPrice * 100) / 100;
    const roundedActual = Math.round(actualPrice * 100) / 100;
    await expect(roundedActual).toBe(roundedExpected);
} */

  async clearCart() {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');

    while (await this.removeButton.count() > 0) {
        await this.removeButton.first().click();
        await this.page.waitForTimeout(500); // Даём время на удаление
    }

    //await expect(this.emptyCartMessage).toBeVisible({ timeout: 5000 });

    await this.expectEmptyCart();
    console.log('✅ Корзина очищена');
  }
    
/*
  async addProductByHref(productHref: string) {
    await this.page.goto(`/${productHref}`);
    //const product = this.page.(`a[href="${productHref}"]`);
    //await expect(product).toBeVisible({ timeout: 10000 });
    //await this.page.waitForTimeout(500); 
        // Находим кнопку внутри товара
        const addButton = product.locator(selectors.addToCartButton);
        // Ждём, пока кнопка станет видимой и активной
        await expect(addButton).toBeVisible({ timeout: 5000 });
        await expect(addButton).toBeEnabled({ timeout: 5000 });
         // Кликаем
    await addButton.click();
    
    // Ждём уведомление о добавлении
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });

    //await product.locator(selectors.addToCartButton).click();
  }
*/
/*
  async removeAllProducts() {
    let removeCount = await this.removeButton.count();
    while (removeCount > 0) {
      await this.removeButton.first().click();
      await this.page.waitForTimeout(300);
      removeCount = await this.removeButton.count();
    }
  }
*/
  async checkout() {
    await this.checkoutButton.click();
  }

  async expectOrderSuccess() {
    await expect(
      this.page.getByText(selectors.orderSuccessMessage)
    ).toBeVisible();
  }
/*
  async getCartItemsCount(): Promise<number> {
    return await this.cartItem.count();
  }

  async getProductPrices() {
    const prices: number[] = [];
    const items = this.cartItem;
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const priceText = await items
        .nth(i)
        .locator(selectors.cartItemPrice)
        .first()
        .textContent();
      const price = parseFloat(
        priceText?.replace(/[^0-9.,]/g, '').replace(',', '.') || '0'
      );
      prices.push(price);
    }
    return prices;
  }

  async getTotalPriceFromCart() {
    await expect(this.totalPrice).toBeVisible({ timeout: 5000 });
    const totalText = await this.totalPrice.textContent();
    console.log('total=', totalText);
    return parseFloat(
      totalText?.replace(/[^\d.,]/g, '').replace(',', '.') || '0'
    );
  }

  async getItemsTotalPrice() {
    const priceTexts = await this.cartItemPrice.allTextContents();
    let total = 0;

    for (const priceText of priceTexts) {
      const price = parseFloat(
        priceText.replace(/[^\d.,]/g, '').replace(',', '.') || '0'
      );
      total += price;
    }console.log('totals=', total);
    return total;
  }

  async expectItemsTotalEqualsCartTotal() {
    //await expect(this.cartItem.first()).toBeVisible({ timeout: 10000 });
    const cartItems = this.page.locator('.text-sm.text-muted-foreground');
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
    */
/*
    const itemsTotal = await this.getItemsTotalPrice();
    const cartTotal = await this.getTotalPriceFromCart();
    await expect(cartTotal).toBe(itemsTotal);
  }*/
/*
  async removeFirstProduct() {
    await this.removeButton.first().click();
    await this.page.waitForTimeout(500);
  }

  async removeProductByName(productName: string) {
    const product = this.page
      .locator(`.cart-item:has-text("${productName}")`)
      .first();
    await expect(product).toBeVisible();
    await product.locator(selectors.removeButton).click();
    await expect(product).not.toBeVisible();
  }*/

}
