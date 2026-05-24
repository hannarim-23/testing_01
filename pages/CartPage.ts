import { Page, Locator, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';

export class CartPage {
  readonly page: Page;
  readonly cartIcon: Locator;
  readonly removeButton: Locator;
  readonly totalPrice: Locator;
  readonly checkoutButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly successMessage: Locator;
  readonly cartItemPrice: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartIcon = page.locator(selectors.cartIcon);
    this.removeButton = page.locator(selectors.removeButton);
    this.totalPrice = page.locator(selectors.totalPrice);
    this.checkoutButton = page.locator(selectors.checkoutButton);
    this.emptyCartMessage = page.locator(selectors.emptyCartMessage);
    this.successMessage = page.getByText('Товар добавлен в корзину');
    this.cartItemPrice = page.locator(selectors.cartItemPrice);
  }

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

  async clearCart() {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');

    while ((await this.removeButton.count()) > 0) {
      await this.removeButton.first().click();
      await this.page.waitForTimeout(500); // Даём время на удаление
    }
    await this.expectEmptyCart();
    console.log('✅ Корзина очищена');
  }

  async checkout() {
    //await expect(this.checkoutButton).toBeVisible({ timeout: 5000 });
    await this.checkoutButton.click();
  }

  async expectOrderSuccess() {
    await expect(
      this.page.getByText(selectors.orderSuccessMessage)
    ).toBeVisible();
  }

  async getCartTotalPrice(): Promise<number> {
    await expect(this.totalPrice).toBeVisible({ timeout: 5000 });
    const totalText = await this.totalPrice.textContent();
    return parseFloat(totalText?.split(' ')[0]?.replace(',', '.') || '0');
  }
}
