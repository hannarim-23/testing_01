import { Page, Locator, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';

export class RegisterPage {
  readonly page: Page;
  readonly firstnameInput: Locator;
  readonly lastnameInput: Locator;
  readonly emailInput: Locator;
  readonly usernameInput: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  // Ошибки
  readonly firstnameError: Locator;
  readonly lastnameError: Locator;
  readonly emailError: Locator;
  readonly usernameError: Locator;
  readonly phoneError: Locator;
  readonly passwordError: Locator;
  readonly emailFormatError: Locator;
  readonly phoneFormatError: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstnameInput = page.locator(selectors.firstnameInput);
    this.lastnameInput = page.locator(selectors.lastnameInput);
    this.emailInput = page.locator(selectors.emailInput);
    this.usernameInput = page.locator(selectors.usernameInput);
    this.phoneInput = page.locator(selectors.phoneInput);
    this.passwordInput = page.locator(selectors.passwordInput);
    this.submitButton = page.locator(selectors.submitButton);

    // Ошибки обязательных полей
    this.firstnameError = page.getByText('Имя обязательно');
    this.lastnameError = page.getByText('Фамилия обязательна');
    this.emailError = page.getByText('Email обязателен');
    this.usernameError = page.getByText('Username обязателен');
    this.phoneError = page.getByText('Телефон обязателен');
    this.passwordError = page.getByText('Пароль обязателен');

    this.emailFormatError = page.getByText('email must be an email');
    this.phoneFormatError = page.getByText(
      'phoneNumber must be in international format'
    );
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(user: {
    firstname: string;
    lastname: string;
    email: string;
    username: string;
    phone: string;
    password: string;
  }) {
    await this.firstnameInput.fill(user.firstname);
    await this.lastnameInput.fill(user.lastname);
    await this.emailInput.fill(user.email);
    await this.usernameInput.fill(user.username);
    await this.phoneInput.fill(user.phone);
    await this.passwordInput.fill(user.password);
    await this.submitButton.click();
  }
  async expectSuccess() {
    await expect(this.page).toHaveURL('/login');
  }

  async expectErrorOnPage() {
    await expect(this.page).toHaveURL('/register');
  }

  async expectFieldErrors() {
    await expect(this.firstnameError).toBeVisible();
    await expect(this.lastnameError).toBeVisible();
    await expect(this.emailError).toBeVisible();
    await expect(this.usernameError).toBeVisible();
    await expect(this.phoneError).toBeVisible();
    await expect(this.passwordError).toBeVisible();
  }

  async expectEmailFormatError() {
    await expect(this.emailFormatError).toBeVisible();
  }

  async expectPhoneFormatError() {
    await expect(this.phoneFormatError).toBeVisible();
  }
  
//08
  async getEmailValue() {
    return await this.emailInput.inputValue();
}

async fillEmail(email: string) {
    await this.emailInput.fill(email);
}

async expectRedirectToLogin() {
    await expect(this.page).toHaveURL('/login');
}
}
