import { Page, expect } from '@playwright/test';
import { selectors } from './selectors';

const BASE_URL = process.env.BASE_URL;

export const clearCart = async (page: Page) => {
    await page.goto(`${BASE_URL}/cart`);
    await page.waitForLoadState('networkidle');
    
    const removeButtons = page.locator(selectors.removeButton);
    let count = await removeButtons.count();
    
    for (let i = 0; i < count; i++) {
        await removeButtons.first().click();
        await page.waitForTimeout(300);
    }
    
    await expect(page.locator(selectors.emptyCartMessage)).toBeVisible();
    console.log('✅ Корзина очищена');
};