import { navigateToStoresPageAndGetStoreIds, homepage } from "./utilities/navigateAndGetStores.js";
import { getStoresProducts } from "./utilities/getStoreDataAndCategorize.js"

const storeIds = await navigateToStoresPageAndGetStoreIds();

await getStoresProducts(storeIds);

