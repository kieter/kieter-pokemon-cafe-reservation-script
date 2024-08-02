import {expect, Locator, Page} from '@playwright/test';

export class TermsPage {
    readonly page: Page;
    readonly agreeToTermsCheckbox: Locator;
    readonly goToReservationPageButton: Locator;

    constructor(page: Page) {
        this.page = page;
        // this.agreeToTermsCheckbox = page.getByRole('checkbox', { name: 'agreeChecked' });
        this.agreeToTermsCheckbox = page.getByText('同意する / Agree to terms');
        // this.agreeToTermsCheckbox = page.locator('#agreeChecked');
        this.goToReservationPageButton = page.getByText("Go to the reservation page");
    }

    async agreeToTerms() {
        await expect(this.agreeToTermsCheckbox).toBeVisible();
        await this.agreeToTermsCheckbox.check();
        await this.goToReservationPageButton.click();
        await this.page.waitForURL('https://reserve.pokemon-cafe.jp/reserve/auth_confirm', { timeout: 5000 });
    }
}