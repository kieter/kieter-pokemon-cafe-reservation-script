import {expect, Page, test} from '@playwright/test';
import { TermsPage } from '../pages/termsPage.page';
import {EmailPermissionPage} from "../pages/emailPermission.page";
import {ReservationPage} from "../pages/reservation.page";

const checkCongested = async (page: Page) => {
    const isCongestedPage = page.getByText("congested due to heavy");
    await expect(isCongestedPage).not.toBeVisible();
}

test('make reservation', async ({ page }) => {
    await page.goto('https://reserve.pokemon-cafe.jp/');

    // complete terms page
    const termsPage = new TermsPage(page);
    await termsPage.agreeToTerms();
    await checkCongested(page);

    // complete email auth page
    const emailPermissionPage = new EmailPermissionPage(page);
    await emailPermissionPage.clickMakeReservation();
    await checkCongested(page);

    // complete reservation page
    const reservationPage = new ReservationPage(page);
    await reservationPage.selectGuestNumber(2);
    await reservationPage.selectDate(2024, 9, 2);
    await checkCongested(page);

    // if there are available times the screen will pause, otherwise retry
    await reservationPage.checkAvailableTime();
});
