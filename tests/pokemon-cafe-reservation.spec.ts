import { test } from '@playwright/test';
import { TermsPage } from '../pages/termsPage.page';
import {EmailPermissionPage} from "../pages/emailPermission.page";
import {ReservationPage} from "../pages/reservation.page";

test('make reservation', async ({ page }) => {
    await page.goto('https://reserve.pokemon-cafe.jp/');

    // complete terms page
    const termsPage = new TermsPage(page);
    await termsPage.agreeToTerms();

    // complete email auth page
    const emailPermissionPage = new EmailPermissionPage(page);
    await emailPermissionPage.clickMakeReservation();

    // complete reservation page
    const reservationPage = new ReservationPage(page);
    await reservationPage.selectGuestNumber(2);
    await reservationPage.selectDate(2024, 9, 2);

    // if there are available times the screen will pause, otherwise retry
    await reservationPage.checkAvailableTime();
});
