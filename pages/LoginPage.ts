import { Page, Locator, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';

export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly emailError: Locator;
    readonly passwordError: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator(selectors.loginEmailInput);
        this.passwordInput = page.locator(selectors.loginPasswordInput);
        this.loginButton = page.locator(selectors.loginButton);
        this.errorMessage = page.getByText(selectors.loginErrorMessage);
        this.emailError = page.getByText(selectors.errorEmail);
        this.passwordError = page.getByText(selectors.errorPassword);
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