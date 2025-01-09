import { createNewBrowserInstance } from "./utilities/browser.js";
import { navigateToUrl } from "./utilities/navigation.js";
import { getStoreIds, extractStoreData } from "./utilities/storeExtractor.js";
import { extractAllProducts } from "./utilities/productExtractor.js";
import { saveToFile, saveMapToFile } from "./utilities/fileUtils.js";
import fs from 'fs';

// Array to store all store data
let allStoreData = [];

// Navigate to the grocery stores page in the flipp website.
const homepageInstance = await createNewBrowserInstance();
const homepage = homepageInstance.page;
await navigateToUrl(homepage, 'https://flipp.com/en-us/grand-rapids-mi/weekly_ads/groceries?postal_code=49504');
await homepage.locator('.cky-btn-accept').click();
await homepage.locator('.download-app-banner-button').click();


// Extract the store ids from the homepage
const storeIds = await getStoreIds(homepage);
for (const storeId of storeIds) {
    try{
        // Create a new browser instance and page for each store
        const storePageInstance = await createNewBrowserInstance();
        const storePage = storePageInstance.page;
        await navigateToUrl(storePage, `https://flipp.com/en-us/grand-rapids-mi/weekly_ad/${storeId}`);
        const storeData = await extractStoreData(storePage);
        const storeProducts = await extractAllProducts(storePage, storeData.storeProductIds);
        allStoreData.push({
            storeName: storeData.storeName,
            storeImage: storeData.storeImage,
            validDate: storeData.validDate,
            storeProducts: storeProducts
        });
        await storePage.close();
        await storePageInstance.browser.close();

    }catch(error){
        console.log("An error occurred while getting data from the storeId", "Reason: ", error);

    }
}



//filter to remove null objects 
allStoreData = allStoreData.filter((store) => store.storeProducts.length > 0);
await saveToFile('storeData.json', allStoreData);
homepageInstance.browser.close();





async function organizeDataAndSaveToMap(){
    const allowedStores = ['Gordon Food Service Store', 'D&W Fresh Market', 'Fresh Thyme Market', 'Forest Hills Foods', 'Dollar General', 'Meijer', 'Family Fare']
    const productData = fs.readFileSync('storeData.json', 'utf8');
    const parsedProductData = JSON.parse(productData);
    const productMap = new Map();
    
    parsedProductData.forEach((item) => {
         // Check if the storeName is in the allowed list
         if (!allowedStores.includes(item.storeName)) {
            console.log(`Skipping store: ${item.storeName}`);
            return; // Skip this store
        }
        item.storeProducts.forEach((product) => {
            const productWithStoreName = {...product, storeName: item.storeName};
           try{
            const lowerCaseItem = product.name.toLowerCase();
            const words = lowerCaseItem.split(" ");
    
            const splitWords = [];
            for (let i = 0; i < words.length; i += 3) {
                const pair = words.slice(i, i + 3).join(" ");
                splitWords.push(pair);
            }
            
            splitWords.forEach((word) => {
                if (productMap.has(word)) {
                    productMap.set(word, [...productMap.get(word), productWithStoreName]);
                } else {
                    productMap.set(word, [productWithStoreName]);
                }
            });
           } catch (e) {
               console.log("Cannot get product name");
               
           }
        });
    });
    const sortedProductMap = new Map([...productMap.entries()].sort());
    await saveMapToFile('productMap.json', sortedProductMap);
}




organizeDataAndSaveToMap();