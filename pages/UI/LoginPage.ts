import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.getByText('Неверный email или пароль');
    this.emailError = page.getByText('Email обязателен');
    this.passwordError = page.getByText('Пароль обязателен');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectSuccess() {
    await expect(this.page).toHaveURL('/');
  }

  async expectErrorOnPage() {
    await expect(this.page).toHaveURL('/login');
    await expect(this.errorMessage).toBeVisible();
  }

  async expectEmailError() {
    await expect(this.emailError).toBeVisible();
  }

  async expectPasswordError() {
    await expect(this.passwordError).toBeVisible();
  }
}
