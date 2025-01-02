import puppeteer from "puppeteer";


(async () => {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the target URL
    await page.goto('https://flipp.com/en-us/grand-rapids-mi/weekly_ads/groceries?postal_code=49504', {
        waitUntil: 'load',
    });

    const element = await page.$('.flyer-name');
    // Extract names from each flipp-flyer-listing-item
    const flyerNames = await page.$$eval('.flyer-name', items => {
        return items.map(item => {
            return item.outerHTML;
        })
    });

    console.log(flyerNames);

    await element.dispose();
    await browser.close();
    

    
})();
