import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly buttonProfile: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonProfile = page.locator(
      'button:has-text("ADMIN"), button:has-text("user1"), [aria-haspopup="menu"]'
    );
    this.logoutButton = page.getByText('Выйти');
  } //this.buttonProfile = page.locator('[aria-haspopup="menu"]');

  async goto(url: string = '/') {
    await this.page.goto(url);
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async clearAndFill(locator: Locator, value?: string | number) {
    if (value !== undefined && value !== null && value !== '') {
      await locator.clear();
      await locator.fill(String(value));
    }
  }

  async updateField(locator: Locator, value?: string | number) {
    if (value) {
      await locator.clear();
      await locator.fill(String(value));
    }
  }

  async logout() {
    await expect(this.logoutButton).toBeVisible();
    await this.logoutButton.click();
  }

  async expectNotLoggedIn() {
    await expect(this.page).toHaveURL('/login');
    await this.page.goto('/profile');
    await expect(this.page).toHaveURL('/login');
  }
}
