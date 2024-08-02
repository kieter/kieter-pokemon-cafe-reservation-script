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
    readonly backToPreviousPageButton: Locator;
    readonly dateTable: Locator;
    readonly availableSeat: Locator;



    constructor(page: Page) {
        this.page = page;
        this.guestNumberDropdown = page.locator('select[name="guest"]');
        // invisible input that contains the date
        this.dateInput = page.locator(".field #date")
        this.dateTable = page.locator("#time_table")

        this.availableSeat = page.getByText("空席").first()

        this.nextStepButton = page.getByText("Next Step");
        this.backToPreviousPageButton = page.getByText("Back to Previous Page");
        this.step2Calendar = page.locator("#step2-form")
        this.nextMonth = page.getByText("Next Month")
    }

    async selectGuestNumber(numberOfGuests: GuestsNumber) {
        await expect(this.guestNumberDropdown).toBeVisible();
        await this.guestNumberDropdown.click();
        await this.guestNumberDropdown.selectOption({ value: numberOfGuests.toString() });
        await expect(this.step2Calendar).toBeVisible();
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
        await expect(this.page.getByText("Sorry. There are no available seats can be found on your requested time and date.")).not.toBeVisible();
        await this.page.waitForURL('https://reserve.pokemon-cafe.jp/reserve/step2', { timeout: 5000 });
        await this.page.waitForSelector('#time_table');
    }

    // will go back and forth between the time table page and the calendar until a free seat is available
    // will pause on the free seat page for manual completion
    // i've noticed waiting a bit prevents the 403 they sometimes give you for usage
    // but i've also seen regular people get the 403 without even scripting so 🤷🏼‍
    async checkAvailableTime() {
        let isSeatAvailable = false;
        while (!isSeatAvailable) {
            await this.selectGuestNumber(2);
            await this.page.waitForTimeout(1000);
            await this.selectDate(2024, 9, 2);
            await this.page.waitForTimeout(1000);
            // 空席 (kuseki) means empty seat in japanese
            isSeatAvailable = await this.availableSeat.isVisible({timeout: 1000});
            // if you uncomment this line you can click on the first available time if you're not picky
            // await this.availableSeat.click();
            if (!isSeatAvailable) {
                await this.backToPreviousPageButton.click();
                await this.page.waitForURL('https://reserve.pokemon-cafe.jp/reserve/step1', { timeout: 5000 });
            }
        }
        await this.page.pause();
    }

    // slower manual version
    async selectMonth(month: MonthNumber) {
        const currentYear = new Date().getFullYear();
        // const currentMonth = new Date().getMonth() + 1;
        // await expect(this.page.getByText(`${currentYear}年${currentMonth}月`)).toBeVisible();
        await expect(this.page.getByText("Next Month")).toBeVisible();
        await expect(this.page.getByText("Prev Month")).toBeVisible();
        // 年 (toshi/nen) means year in japanese
        // 月 (getsu) means month in japanese
        while (await this.page.getByText(`${currentYear}年${month}月`).isHidden()) {
            await this.nextMonth.click()
        }
    }

    // doesn't seem to work but would be faster
    async quickSelectGuestNumber(numberOfGuests: GuestsNumber) {
        await this.page.evaluate((numberOfGuests) => {
            const desiredGuestOption = document.querySelector(`.select option[value="${numberOfGuests.toString()}"]`)
            if (desiredGuestOption) {
                desiredGuestOption.setAttribute('selected', 'selected');
            }
        }, numberOfGuests);
    }
}