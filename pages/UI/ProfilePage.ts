import { Page, Locator, expect } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly usernameInput: Locator;
  readonly phoneInput: Locator;
  readonly saveButton: Locator;
  readonly ordersLink: Locator;
  readonly logoutButton: Locator;
  readonly errorMessage: Locator;
  readonly buttonSVG: Locator;
  readonly successMessage: Locator;
  readonly errorEmail: Locator;
  readonly buttonProfile: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('input[name="firstname"]');
    this.lastNameInput = page.locator('input[name="lastname"]');
    this.emailInput = page.locator('input[name="email"]');
    this.usernameInput = page.locator('input[name="username"]');
    this.phoneInput = page.locator('input[name="phoneNumber"]');
    this.saveButton = page.getByText('Сохранить изменения');
    this.ordersLink = page.getByText('История заказов');
    this.logoutButton = page.getByText('Выйти');
    this.successMessage = page.getByText('Профиль успешно обновлен!');
    this.errorMessage = page.getByText(
      'phoneNumber must be a valid phone number,phoneNumber must be in international format (starting with +)'
    );
    this.errorEmail = page.getByText('Email "user1@test.com" already exists.');

    this.buttonProfile = page.locator('[aria-haspopup="menu"]');
  }

  async goto() {
    await this.page.goto('/profile');
    await this.page.waitForLoadState('networkidle');
  }

  async getFirstName() {
    return await this.firstNameInput.inputValue();
  }
  async getLastName() {
    return await this.lastNameInput.inputValue();
  }
  async getPhone() {
    return await this.phoneInput.inputValue();
  }
  async getEmail() {
    return await this.lastNameInput.inputValue();
  }
  async getUsername() {
    return await this.phoneInput.inputValue();
  }
  async expecButtonSave() {
    await expect(this.saveButton).toBeEnabled();
  }

  async changeFirstName(newName: string) {
    await this.firstNameInput.clear();
    await this.firstNameInput.fill(newName);
  }
  async changeLastName(newName: string) {
    await this.lastNameInput.clear();
    await this.lastNameInput.fill(newName);
  }
  async expectSuccessMessage() {
    await expect(this.successMessage).toBeVisible();
  }

  async clickSave() {
    await this.saveButton.click();
  }

  async expectFirstName(expectedName: string) {
    await expect(this.firstNameInput).toHaveValue(expectedName);
  }
  async expectLastName(expectedName: string) {
    await expect(this.lastNameInput).toHaveValue(expectedName);
  }

  async changePhone(newPhone: string) {
    await this.phoneInput.clear();
    await this.phoneInput.fill(newPhone);
  }

  async expectErrorMessage() {
    await expect(this.errorMessage).toBeVisible();
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

  async clickProfile() {
    await this.buttonProfile.click();
  }
  async goToOrders() {
    await this.ordersLink.click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL('/orders');
  }

  async changeEmail(newEmail: string) {
    await this.emailInput.clear();
    await this.emailInput.fill(newEmail);
  }

  async expectPhone(expectedPhone: string) {
    await expect(this.phoneInput).toHaveValue(expectedPhone);
  }
}
