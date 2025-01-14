import fs, { read } from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore"; 
//read the productMap.json file and return the data
function readProductMap(){
    const productMap = fs.readFileSync('productMap.json', 'utf8');
    return JSON.parse(productMap);
}



readProductMap();

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  //   apiKey: "AIzaSyAqURZfi3Qz_xG-2z1WUB16RunpX88ku9E",
  // authDomain: "grocery-saver-application.firebaseapp.com",
  // projectId: "grocery-saver-application",
  // storageBucket: "grocery-saver-application.firebasestorage.app",
  // messagingSenderId: "305830128291",
  // appId: "1:305830128291:web:36b2c23fe006173d79ed16",
  // measurementId: "G-E5SFQ1YX5G"
  apiKey: "AIzaSyBien41fw8Tu4VilIUk6BaBv3cSv714xuI",
  authDomain: "grocery-saver-applicatio-811f0.firebaseapp.com",
  projectId: "grocery-saver-applicatio-811f0",
  storageBucket: "grocery-saver-applicatio-811f0.firebasestorage.app",
  messagingSenderId: "223250624774",
  appId: "1:223250624774:web:a1e85056c939d4c42d6e87",
  measurementId: "G-WVCT4W78BW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);


function getFirstThreeWords(sentence) {
    if (!sentence || typeof sentence !== "string") return ""; // Handle invalid input
    return sentence
      .split(" ") // Split the sentence into words
      .slice(0, 3) // Get the first 3 words
      .join(" "); // Join the words back into a string
  }

/**
 * Function to read productMap.json and store its data in Firestore.
 */
async function storeProductMap() {
    try {
      // Read the productMap.json file
      const data = await fs.promises.readFile('productMap.json', 'utf8');
      const productMap = JSON.parse(data); // Parse the JSON data
  
      // Check if productMap is an array or object
      if (!Array.isArray(productMap) && typeof productMap !== 'object') {
        throw new Error("Invalid productMap format. Expected an array or object.");
      }
  
      // Iterate through the productMap and add each product to Firestore
      const productsCollection = collection(db, "products");
      for (let [key, product] of Object.entries(productMap)) {
        const categoryIsNotAlphanumerical = /^[^a-zA-Z]/.test(key);
        if (categoryIsNotAlphanumerical) {
          key = getFirstThreeWords(product[0].name);
        }
        const productData = {
          category: key, // Use the key as the product ID (optional, based on your JSON structure)
          ...product,
          addedAt: new Date(), // Add a timestamp for when the product is added
        };
  
        // Add product to Firestore
        const docRef = await addDoc(productsCollection, productData);
        console.log(`Product ${key} added with ID:`, docRef.id);
      }
  
      console.log("All products from productMap have been added to Firestore.");
    } catch (error) {
      console.error("Error storing productMap in Firestore:", error);
    }
  }
  
  // Call the function
  storeProductMap();

  async function storeStoreData() {

    const storeData = fs.readFileSync('storeData.json', 'utf8');
    const parsedStoreData = JSON.parse(storeData);
    const storesCollection = collection(db, "stores");
  
    for (let store of parsedStoreData) {
      const storeData = {
        name: store.storeName,
        image: store.storeImage,
      };
  
      // Add store to Firestore
      const docRef = await addDoc(storesCollection, storeData);
      console.log(`Store ${store.storeName} added with ID:`, docRef.id);
    }
  
    console.log("All stores from storeData have been added to Firestore.");
  }
storeStoreData();

  
