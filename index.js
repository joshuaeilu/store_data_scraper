import { navigateToStoresPageAndGetStoreIds, homepage } from "./utilities/navigateAndGetStores.js";
import { getStoresProducts } from "./utilities/getStoreDataAndCategorize.js"


//Get the ids of the different stores
const storeIds = await navigateToStoresPageAndGetStoreIds();

await getStoresProducts(storeIds);

