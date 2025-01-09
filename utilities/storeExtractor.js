//This function looks at all the stores (storeIds) in the first home page;
export async function getStoreIds(page) {
    try {
        console.log("Getting store ids...");
        return await page.$$eval('flipp-flyer-listing-item', (stores) =>
            stores.map((store) => store.getAttribute('flyer-id'))
        );
    } catch (error) {
        console.log("Failed to get store ids", "Reason: ", error);
    }
}


//Extract Store Data for every store
export async function extractStoreData(page) {
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