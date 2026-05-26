import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartIcon: Locator;
  readonly removeButton: Locator;
  readonly totalPrice: Locator;
  readonly checkoutButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly successMessage: Locator;
  readonly cartItemPrice: Locator;
  readonly orderSuccessMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartIcon = page.locator('a[href="/cart"]');
    this.removeButton = page.locator('button:has-text("Удалить")');
    this.totalPrice = page.locator('span:has-text("Итого:") + span');
    this.checkoutButton = page.locator('button:has-text("Оформить заказ")');
    this.emptyCartMessage = page.locator('text=Ваша корзина пуста.');
    this.successMessage = page.getByText('Товар добавлен в корзину');
    this.cartItemPrice = page.locator('.cart-item, [data-testid="cart-item"]');
    this.orderSuccessMessage = page.getByText('Заказ успешно создан');
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
    console.log('Корзина очищена');
  }

  async checkout() {
    await expect(this.checkoutButton).toBeVisible({ timeout: 5000 });
    await this.checkoutButton.click();
  }

  async expectOrderSuccess() {
    await expect(this.orderSuccessMessage).toBeVisible();
  }

  async getCartTotalPrice() {
    await expect(this.totalPrice).toBeVisible({ timeout: 5000 });
    const totalText = await this.totalPrice.textContent();
    return parseFloat(totalText?.split(' ')[0]?.replace(',', '.') || '0');
  }
}
