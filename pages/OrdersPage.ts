import { Page, Locator, expect } from '@playwright/test';

export class OrdersPage {
  private readonly page: Page;
  private readonly orderButton: Locator;
  private readonly emptyOrdersMessage: Locator;
  private readonly orderDetails: Locator;
  private readonly orderNumber: Locator;
  private readonly orderTotalPrice: Locator;
  private readonly buttonCreateOrder: Locator;

  constructor(page: Page) {
    this.page = page;
    this.orderButton = page.locator('button:has-text("Заказ #")');
    this.orderDetails = page.getByText('Состав заказа:');
    this.emptyOrdersMessage = page.getByText('У вас еще нет заказов.');
    this.orderNumber = page.locator('text=/Заказ #\\d+/');
    this.orderTotalPrice = page.getByText('руб.');
    this.buttonCreateOrder = page.locator('button:has-text("Оформить заказ")');
  }

  async goto() {
    await this.page.goto('/orders');
    await this.page.waitForLoadState('networkidle');
  }

  async getOrdersCount() {
    return this.orderButton.count();
  }

  async clickOnFirstOrder() {
    await this.orderButton.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async getAllStatuses() {
    const statuses: string[] = [];
    const count = await this.orderButton.count();

    for (let i = 0; i < count; i++) {
      const text = await this.orderButton.nth(i).textContent();
      if (text) {
        const statusMatch = text.match(/(PENDING|COMPLETED|CANCELLED)/);
        if (statusMatch) {
          statuses.push(statusMatch[1]);
        }
      }
    }
    return statuses;
  }

  async expectAllOrdersHaveValidStatus() {
    const statuses = await this.getAllStatuses();
    const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];

    for (const status of statuses) {
      expect(validStatuses).toContain(status);
    }
  }
  async expectEmptyOrdersMessage() {
    await expect(this.emptyOrdersMessage).toBeVisible();
  }

  async expectOrderDetailsVisible() {
    await expect(this.orderDetails).toBeVisible();
  }

  async expectOrderNumberVisible() {
    await expect(this.orderNumber.first()).toBeVisible();
  }

  async expectOrderTotalPriceVisible() {
    await expect(this.orderTotalPrice.first()).toBeVisible();
  }

  async expectCheckoutButtonDisabled() {
    await expect(this.buttonCreateOrder).toBeDisabled();
  }
}
