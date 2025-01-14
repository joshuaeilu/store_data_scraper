//This file extracts all the products alongside with all their information.
import categorizeProducts from "./categorizeProducts.js";

export async function extractProductData(page, productId) {
    try {
        // Navigate to the product page
        await page.goto(`https://flipp.com/en-us/grand-rapids-mi/item/${productId}`, {
            waitUntil: "domcontentloaded",
        });

        // Wait for the product dialog to appear
        await page.waitForSelector("flipp-item-dialog", { timeout: 10000 });
        await page.waitForSelector('section.description', { timeout: 5000 });

        // Extract product details
        const productData = await page.evaluate(() => {
            const dialog = document.querySelector("flipp-item-dialog");
            if (!dialog) {
                throw new Error("Product dialog not found");
            }

            // Extract product details
            const name = dialog.querySelector('h2.slideable.title span[content-slot="title"]')?.textContent.trim() || null;
            const image = dialog.querySelector('img[is="flipp-fit-img"]')?.getAttribute('src') || null;

            // Extract price
            const priceDollars = dialog.querySelector("flipp-price span.dollars")?.textContent.trim();
            const priceCents = dialog.querySelector("flipp-price span.cents")?.textContent.trim() || "00";
            const price = priceDollars ? `${priceDollars}.${priceCents}` : null;

            // Extract pre-price (if available)
            const prePrice = dialog.querySelector("span.pre-price-text")?.textContent.trim() || null;

            // Extract description
            const description = dialog.querySelector("section.description span")?.textContent.trim() || null;

            // Extract disclaimer text (if available)
            const disclaimer = dialog.querySelector("div.flyer-item-disclaimer-text")?.textContent.trim() || null;

            // Extract sale story (if available)
            const saleStory = dialog.querySelector("div.sale-story")?.textContent.trim() || null;

            // Return structured product data
            return {
                name,
                image,
                price,
                prePrice,
                description,
                disclaimer,
                saleStory,
            };
        });
        const category = categorizeProducts(productData.name);
        return { productData, category };
    } catch (error) {
        return null;
    }
}


export async function extractAllProducts(page, storeData, database) {
    const storeProductIds = await storeData.storeProductIds;

    const storeProductIdsLength = storeData.storeProductIds.length;
    for (let j = 0; j < storeProductIdsLength ; j++) {
        const productId = storeProductIds[j];
        try {
            const itemData = await extractProductData(page, productId);
            itemData.productData.storeName = storeData.storeName;
            //make a new category if it doesn't exist in database, and add products 
            if (!database[itemData.category]) {
                database[itemData.category] = [];
                database[itemData.category].push(itemData.productData);
            } else {
                database[itemData.category].push(itemData.productData);
            }
        } catch (error) {
            console.error(`Error extracting product data for product ID ${productId}:`);
        }

    }


}
