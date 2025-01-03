import puppeteer from "puppeteer";
import fs from "fs/promises";



const browser = await puppeteer.launch({ headless: false,
    userDataDir: './user_data',
 });

const context = await browser.createBrowserContext();


const page = await context.newPage();


// Create a new page
async function createPage(browser) {
    const page = await browser.newPage();
    return page;
}


// navigate to the target URL
async function navigateToUrl(page, url) {
    await page.goto(url, {
        waitUntil: 'networkidle2',
    });
}
// get store ids
async function getStoreIds(page) {
    return await page.$$eval('flipp-flyer-listing-item', (stores) => {
        return stores.map((storeId) => {
            return storeId.getAttribute('flyer-id');
        })
    });
}
await navigateToUrl(page, 'https://flipp.com/en-us/grand-rapids-mi/weekly_ads/groceries?postal_code=49504');
await page.locator('.cky-btn-accept').click();
await page.locator('.download-app-banner-button').click();
const storeIds = await getStoreIds(page);

// Extract Product Data
async function extractProductData(page, productId) {
    try {
        await navigateToUrl(page, `https://flipp.com/en-us/grand-rapids-mi/item/${productId}`);

        try {
            await page.waitForSelector('flipp-item-dialog', { timeout: 30000 }); // Adjust timeout as needed
        } catch (error) {
            console.error(`Error waiting for flipp-item-dialog for product ID ${productId}:`, error.message);
            return null; // Return null to skip this product

        }
        return await page.evaluate(() => {
            const dialog = document.querySelector('flipp-item-dialog');
            if (!dialog) {
                return null;
              }
          
              // Extract data
              const image = dialog.querySelector('img[is="flipp-fit-img"]')?.getAttribute('src') || 
                            dialog.querySelector('img[is="flipp-fit-img"]')?.getAttribute('href');
          
              const priceElement = dialog.querySelector('flipp-price span.dollars');
              const priceCentsElement = dialog.querySelector('flipp-price span.cents');
              const price = priceElement ? `${priceElement.textContent}.${priceCentsElement?.textContent || '00'}` : null;
          
              const name = dialog.querySelector('h2.slideable.title span[content-slot="title"]')?.textContent;
              const description = dialog.querySelector('section.description span')?.textContent;

              return {
                image,
                price,
                name,
                description,
              };
        });
    } catch (error) {
        console.error(`Error in extractProductData for product ID ${productId}:`, error.message);
        return null; // Return null to skip this product
    }
}

async function extrallAllProducts(page, storeProductIds) {
    const storeProducts = [];
    for (let j = 0; j < 2; j++) {
        const productId = storeProductIds[j];
        if (!productId) {
            console.log('Skipping invalid product id')
            continue;
        }
        try {
            const itemData = await extractProductData(page, storeProductIds[j]);
            storeProducts.push(itemData);
        } catch (error) {
            console.error(`Error extracting product data for product ID ${productId}:`, error.message);
            storeProducts.push(null);
        }
    }
    return storeProducts;
}

async function extractStoreData(page) {
    await page.waitForSelector('.subtitle');
    return await page.evaluate(() => {
        const getTextContent = (selector) => document.querySelector(selector)?.textContent || null;
        const getAttribute = (selector, attr) => document.querySelector(selector)?.getAttribute(attr) || null;

        const storeImage = getAttribute('img[is="flipp-lazy-image"]', 'src');
        const storeName = getTextContent('.subtitle');
        const validDate = getTextContent('.validity');
        const storeProductIds = Array.from(document.querySelectorAll('.item-container')).map(product => product.getAttribute('itemid'));

        return { storeImage, storeName, validDate, storeProductIds };
    });


}








// Loop through the storeIds open separate pages for each store
const storeDataPromises = storeIds.map(async (storeId, index) => {
    const storePage = await createPage(browser);
    await navigateToUrl(storePage, `https://flipp.com/en-us/grand-rapids-mi/weekly_ad/${storeId}`);
    

    const storeData = await extractStoreData(storePage);
    const storeProducts = await extrallAllProducts(storePage, storeData.storeProductIds);

    await storePage.close(); // Close the page to free resources
    return {
        storeName: storeData.storeName,
        storeImage: storeData.storeImage,
        validDate: storeData.validDate,
        storeProducts: storeProducts
    };
});

try {
    const allStoreData = await Promise.all(storeDataPromises);
    await fs.writeFile('storeData.json', JSON.stringify(allStoreData, null, 2));
} catch (error) {
    console.error('An error occurred while fetching store data:', error);
}






