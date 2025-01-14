import { categories } from "../assets/categories.js";

// Boyer-Moore Helpers
const buildBadMatchTable = (str) => {
    const tableObj = {};
    const len = str.length;
    for (let i = 0; i < len - 1; i++) {
        tableObj[str[i]] = len - 1 - i;
    }
    tableObj[str[len - 1]] = tableObj[str[len - 1]] || len;
    return tableObj;
};

const boyerMoore = (str, pattern) => {
    const badMatchTable = buildBadMatchTable(pattern);
    let offset = 0;
    const lastIndex = pattern.length - 1;
    const maxOffset = str.length - pattern.length;

    while (offset <= maxOffset) {
        let scanIndex = 0;
        while (pattern[scanIndex] === str[offset + scanIndex]) {
            if (scanIndex === lastIndex) return true;
            scanIndex++;
        }
        const badMatchChar = str[offset + lastIndex];
        offset += badMatchTable[badMatchChar] || 1;
    }
    return false;
};


export default function categorizeProducts(product){
    const productName = product.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
        for (const keyword of keywords) {
            if (boyerMoore(productName, keyword)) {
                return category;
            }
        }
    }
    return "other";
}