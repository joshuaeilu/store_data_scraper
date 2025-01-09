// This file creates a new browser instance and a new page in that browser.
import puppeteer from "puppeteer";

export async function createNewBrowserInstance() {
    const browser =  await puppeteer.launch({ headless: false,
    });
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    return {page, browser};
}