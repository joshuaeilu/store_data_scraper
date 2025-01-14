import { createNewBrowserInstance } from "./browser.js";
import { navigateToUrl } from "./navigation.js";
import { extractStoreData } from "./storeExtractor.js";
import { extractAllProducts } from "./productExtractor.js";
import { saveToFile } from "./fileUtils.js";


let database = {};
const allowedStores = ['Gordon Food Service Store', 'D&W Fresh Market', 'Fresh Thyme Market', 'Forest Hills Foods', 'Dollar General', 'Meijer', 'Family Fare'];
async function getProductsForEachStore(storeId) {
    try {
        // Create a new browser instance and page for each store
        const storePageInstance = await createNewBrowserInstance();
        const storePage = storePageInstance.page;
        await navigateToUrl(storePage, `https://flipp.com/en-us/grand-rapids-mi/weekly_ad/${storeId}`);
        const storeData = await extractStoreData(storePage);

        if (allowedStores.includes(storeData.storeName)) {
            await extractAllProducts(storePage, storeData, database);
        }




        await storePage.close();
        await storePageInstance.browser.close();

    } catch (error) {
        console.log("An error occurred while getting data from the storeId", "Reason: ", error);

    }
}



export async function getStoresProducts(storeIds) {
    for (const storeId of storeIds) {
        await getProductsForEachStore(storeId);
    }
    await saveToFile('storeData.json', database);
}







