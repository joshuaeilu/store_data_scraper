// This function navigates to a URL in the browser.
export async function navigateToUrl(page, url) {
    await page.goto(url, {
        waitUntil: "networkidle2",
    });
}
