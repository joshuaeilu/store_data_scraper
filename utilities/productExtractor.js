//This file extracts all the products alongside with all their information.

export async function extractProductData(page, productId) {
    try {
        // Navigate to the product page
        await page.goto(`https://flipp.com/en-us/grand-rapids-mi/item/${productId}`, {
            waitUntil: "domcontentloaded",
        });

        // Wait for the product dialog to appear
        await page.waitForSelector("flipp-item-dialog", { timeout: 5000 });
        await page.waitForSelector('section.description', {timeout: 3000});

        // Extract product details
        return await page.evaluate(() => {
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
    } catch (error) {
        console.error(`Error extracting product data for product ID ${productId}:`, error.message);
        return null; // Return null if extraction fails
    }
}


export async function extractAllProducts(page, storeProductIds) {
    const storeProducts = [];
    const storeProductIdsLength = storeProductIds.length;
    for (let j = 0; j < storeProductIdsLength; j++) {
        const productId = storeProductIds[j];
        if (!productId) {
            console.log('Skipping invalid product id', productId);
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