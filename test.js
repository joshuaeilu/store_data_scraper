
(async () => {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to the target URL
    await page.goto('https://flipp.com/en-us/grand-rapids-mi/weekly_ads/groceries?postal_code=49504', {
        waitUntil: 'load',
    });

    // Accept the cookies
    await page.locator('.cky-btn-accept').click();
    // Close the download app advert
    await page.locator('.download-app-banner-button').click();


    // Get the flyer-ids for all the stores
    const storeIds = await page.$$eval('flipp-flyer-listing-item', (stores) => {
        return stores.map((storeId) => {
            return storeId.getAttribute('flyer-id');
        })
    });

    // Initialize an empty array to store the flyer details
    const extractedData = [];

    // Loop through the storeIds and get the flyer details
    for (let i = 0; i < 3; i++) {
        // Navigate to the store flyer page
        await page.goto(`https://flipp.com/en-us/grand-rapids-mi/weekly_ad/${storeIds[i]}`, {
            waitUntil: 'networkidle2',
        });

        await page.waitForSelector('.subtitle');


        // Select the image element and extract the 'src' or 'data-src' attribute
        const storeImage = await page.$eval('img[is="flipp-lazy-image"]', (storeimg) => {
            return storeimg?.getAttribute('src');
        });
        const storeName = await page.$eval('.subtitle', (store) => {
            return store.textContent;
        });
        const validDate = await page.$eval('.validity', (date) => {
            return date.textContent;
        });
        
        const storeProductIds = await page.$$eval('.item-container', (products) => {
            return products.map((product) => {
                const productId = product.getAttribute('itemid');
                return {productId: productId };
            })

        });

        const storeProducts = [];
        for(let j = 0; j < storeProductIds.length; j++) {
            await page.goto(`https://flipp.com/en-us/grand-rapids-mi/item/${storeProductIds[j].productId}`, {
                waitUntil: 'networkidle2',
            });

            await page.waitForSelector('flipp-item-dialog');

            const itemData = await page.evaluate(() => {
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

            if (itemData) {
                storeProducts.push(itemData);
              } else {
                console.log('Item dialog not found.');
              }
            }
            extractedData.push({
                storeName: storeName,
                storeImage: storeImage,
                validDate: validDate,
                storeProducts: storeProducts
            });
            console.log("Finished scraping data for: ", storeName);
    }


    await fs.writeFile('data.json', JSON.stringify(extractedData, null, 2), 'utf-8');
    await browser.close();


})();
