import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class OrdersPage extends BasePage {
  readonly orderButton: Locator;
  readonly emptyOrdersMessage: Locator;
  readonly orderDetails: Locator;
  readonly orderNumber: Locator;
  readonly orderTotalPrice: Locator;
  readonly buttonCreateOrder: Locator;

  constructor(page: Page) {
    super(page);
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

  async clickOnOrderByIndex(index: number = 0) {
    await this.orderButton.nth(index).click();
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
