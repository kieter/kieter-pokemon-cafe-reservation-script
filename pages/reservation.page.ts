import {expect, Locator, Page} from '@playwright/test';

type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type GuestsNumber = 1 | 2 | 3 | 4 | 5 | 6

export class ReservationPage {
    readonly page: Page;
    readonly guestNumberDropdown: Locator;
    readonly step2Calendar: Locator;
    readonly nextMonth: Locator;
    readonly dateInput: Locator;
    readonly nextStepButton: Locator;



    constructor(page: Page) {
        this.page = page;
        this.guestNumberDropdown = page.locator('select[name="guest"]');
        // invisible input that contains the date
        this.dateInput = page.locator(".field #date")

        this.nextStepButton = page.getByText("Next Step");
        this.step2Calendar = page.locator("#step2-form")
        this.nextMonth = page.getByText("Next Month")
    }

    async selectGuestNumber(numberOfGuests: GuestsNumber) {
        await expect(this.guestNumberDropdown).toBeVisible();
        await this.guestNumberDropdown.click();
        await this.guestNumberDropdown.selectOption({ value: numberOfGuests.toString() });
        await expect(this.step2Calendar).toBeVisible();
        // await this.page.waitForSelector('#step2-form');
    }

    async selectDate(year: number, month: MonthNumber, day: number) {
        await expect(this.step2Calendar).toBeVisible({ timeout: 5000 });
        const date = new Date(year, month - 1, day).toString();
        await this.page.evaluate((date) => {
            const dateInput = document.querySelector('.field #date') as HTMLInputElement;
            if (dateInput) {
                dateInput.value = date;
                dateInput.dispatchEvent(new Event('input', { bubbles: true }));
                dateInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, date);
        await this.nextStepButton.click();
        await this.page.waitForURL('https://reserve.pokemon-cafe.jp/reserve/step2', { timeout: 5000 });
    }

    async checkAvailableTime() {
        // 空席 (kuseki) means empty seat in japanese
        await expect(this.page.getByText("空席").first()).toBeVisible( { timeout: 500 });
        await this.page.pause();
    }


    // async selectMonth(month: MonthNumber) {
    //     const currentYear = new Date().getFullYear();
    //     // const currentMonth = new Date().getMonth() + 1;
    //     // await expect(this.page.getByText(`${currentYear}年${currentMonth}月`)).toBeVisible();
    //     await expect(this.page.getByText("Next Month")).toBeVisible();
    //     await expect(this.page.getByText("Prev Month")).toBeVisible();
    //     while (await this.page.getByText(`${currentYear}年${month}月`).isHidden()) {
    //         await this.nextMonth.click()
    //     }
    // }

    // async quickSelectGuestNumber(numberOfGuests: GuestsNumber) {
    //     await this.page.evaluate((numberOfGuests) => {
    //         const desiredGuestOption = document.querySelector(`.select option[value="${numberOfGuests.toString()}"]`)
    //         if (desiredGuestOption) {
    //             desiredGuestOption.setAttribute('selected', 'selected');
    //         }
    //     }, numberOfGuests);
    // }
}