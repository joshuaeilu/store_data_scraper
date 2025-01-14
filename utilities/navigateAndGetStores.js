import { createNewBrowserInstance } from "./browser.js";
import { navigateToUrl } from "./navigation.js";
import { getStoreIds } from "./storeExtractor.js";
// Navigate to the grocery stores page in the flipp website.
export const homepageInstance = await createNewBrowserInstance();
export const homepage = homepageInstance.page;

export async function navigateToStoresPageAndGetStoreIds(){
    await navigateToUrl(homepage, 'https://flipp.com/en-us/grand-rapids-mi/weekly_ads/groceries?postal_code=49504');
    await homepage.locator('.cky-btn-accept').click();
    await homepage.locator('.download-app-banner-button').click();
    return await getStoreIds(homepage);

}