import fs from 'fs';

// Read the storeData.json file
const data = fs.readFileSync('storeData.json', 'utf8');
const storeData = JSON.parse(data); // Parse the JSON data

// Extract product list
let productList = [];
for (let store of storeData) {
    try {
        for (let product of store.storeProducts) {
            if (product?.name) {
                productList.push(product.name);
            }
        }
    } catch (e) {
        console.error("Error processing store products:", e);
    }
}

// Category Definitions
const categories = {
    meat: [
        "meat","beef", "pork", "sausage", "bacon", "chicken", "turkey", "ham",
        "steak", "lamb", "veal", "duck", "meatballs", "pulled pork",
        "salami", "prosciutto", "ribs", "brisket", "hot dogs", "ground beef",
        "corned beef", "tenderloin", "roast", "patties", "cutlets"
    ],
    dairy: ["dairy",
        "milk", "cheese", "butter", "yogurt", "cream", "ice cream", "kefir",
        "ricotta", "mozzarella", "parmesan", "cream cheese", "gouda", "brie",
        "cheddar", "feta", "buttermilk", "cottage cheese", "sour cream", "whipping cream",
        "half-and-half", "mascarpone", "provolone", "swiss cheese", "american cheese"
    ],
    bakery: ["bake",
        "bread", "cake", "cookies", "muffins", "pastry", "croissant",
        "bagels", "buns", "rolls", "brownie", "doughnuts", "tarts",
        "scones", "pie", "pancakes", "waffles", "eclairs", "breadsticks",
        "brioche", "tortillas", "focaccia", "baguette"
    ],
    produce: [
        "lettuce", "onion", "carrot", "broccoli", "spinach", "tomato",
        "zucchini", "cucumber", "bell pepper", "potato", "sweet potato",
        "ginger", "garlic", "radish", "celery", "asparagus", "artichoke",
        "beet", "cabbage", "cauliflower", "kale", "leek", "turnip",
        "parsnip", "bok choy", "brussels sprouts", "okra", "green beans",
        "peas", "chard", "scallion"
    ],
    fruits: ["fruti",
        "apple", "banana", "orange", "grape", "kiwi", "mango", "pineapple",
        "blueberr", "strawberr", "raspberr", "watermelon", "peach",
        "plum", "pear", "cherr", "apricot", "grapefruit", "lemon",
        "lime", "pomegranate", "blackberr", "cranberr", "tangerine",
        "cantaloupe", "honeydew", "dragonfruit", "papaya", "guava"
    ],
    beverages: ["beverage",
        "juice", "soda", "coffee", "tea", "water", "wine", "beer",
        "energy drink", "smoothie", "sports drink", "lemonade", "sparkling water",
        "iced tea", "kombucha", "milkshake", "chai", "latte", "espresso",
        "cappuccino", "hot chocolate", "herbal tea"
    ],
    frozen: [
        "frozen", "ice", "popsicles", "frozen pizza", "frozen vegetables",
        "ice cream", "frozen fruits", "frozen dinners", "frozen meals",
        "frozen yogurt", "ice cubes", "frozen seafood", "frozen snacks"
    ],
    snacks: ["snack",
        "chips", "crackers", "popcorn", "candy", "chocolate", "nuts",
        "pretzels", "granola bars", "trail mix", "fruit snacks",
        "beef jerky", "biscotti", "protein bars", "potato chips",
        "nachos", "corn chips", "cheese sticks", "chewing gum", "cookies",
        "marshmallows", "snack cakes", "rice cakes"
    ],
    pantry: [
        "pasta", "rice", "flour", "sugar", "spices", "canned", "soup",
        "oil", "vinegar", "honey", "jelly", "peanut butter", "baking powder",
        "cereal", "oatmeal", "pancake mix", "cornmeal", "cornstarch",
        "yeast", "cocoa powder", "stock", "broth", "tomato paste",
        "jam", "granola", "syrup", "mustard seeds", "chia seeds"
    ],
    household: [
        "detergent", "cleaner", "tissue", "paper towels", "soap",
        "shampoo", "toothpaste", "dish soap", "laundry detergent",
        "sponges", "batteries", "trash bags", "mops", "brooms",
        "light bulbs", "air fresheners", "toilet paper", "bleach",
        "sanitizer", "dishwasher pods", "gloves", "razors"
    ],
    seafood: ["sea",
        "fish", "shrimp", "lobster", "crab", "salmon", "tuna",
        "scallops", "oysters", "clams", "mussels", "squid",
        "octopus", "cod", "haddock", "tilapia", "halibut",
        "trout", "sardines", "anchovies", "prawns", "caviar"
    ],
    condiments: [
        "ketchup", "mustard", "mayonnaise", "vinegar", "soy sauce",
        "hot sauce", "barbecue sauce", "salad dressing", "ranch",
        "salsa", "tartar sauce", "hummus", "pesto", "aioli",
        "relish", "gravy", "chutney", "honey mustard", "marinade"
    ],
    beverages_alcoholic: ["alcohol",
        "beer", "wine", "vodka", "whiskey", "rum", "tequila",
        "gin", "champagne", "brandy", "liqueur", "cider",
        "mead", "schnapps", "bourbon", "cocktail", "martini",
        "margarita", "bloody mary", "rum punch", "port", "sherry"
    ],
    vegetables: ["vegetable",
        "asparagus", "beet", "cabbage", "cauliflower", "celery",
        "corn", "eggplant", "kale", "leek", "mushroom",
        "peas", "pumpkin", "squash", "turnip", "spinach",
        "radicchio", "artichoke", "fennel", "arugula", "bok choy",
        "brussels sprouts", "chard", "scallion", "radish"
    ]
};

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

// Categorize Products
const categorizedProducts = {};

const categorizeProducts = (product) => {
    const productName = product.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
        for (const keyword of keywords) {
            if (boyerMoore(productName, keyword)) {
                return category;
            }
        }
    }
    return "uncategorized";
};

for (const product of productList) {
    try {
        const category = categorizeProducts(product);
        if (!categorizedProducts[category]) {
            categorizedProducts[category] = [];
        }
        categorizedProducts[category].push(product);
    } catch (e) {
        console.error("Error categorizing product:", product, e);
    }
}

// Save to File
fs.writeFileSync('categorizedProducts.json', JSON.stringify(categorizedProducts, null, 2));
