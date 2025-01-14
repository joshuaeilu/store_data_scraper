import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch } from "firebase/firestore";
import { doc,  setDoc } from "firebase/firestore";
import { categories } from '../assets/categories.js';
//read the productMap.json file and return the data

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {

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



// read the storeData.json file and return the data
export function readStoreData() {
  const data = fs.readFileSync('./assets/storeData.json');
  return JSON.parse(data);
}


async function sendDataToFireBase() {
  // Read all the categories from the storeData.json file and return the data
  const storeData = readStoreData();
  const categories = Object.keys(storeData);

  for (const category of categories) {
    const batch = writeBatch(db); // Start a new batch
    const categoryData = storeData[category];
    const collectionPath = `products/${category}/items`; // Specify items as a subcollection

    categoryData.forEach((item, index) => {
      const docRef = doc(db, collectionPath, `item-${index}`); // Use a unique document ID
      batch.set(docRef, item);
    });

    try {
      await batch.commit(); // Commit the batch
      console.log(`Successfully added all items for ${category}`);
    } catch (e) {
      console.error(`Failed to add items for ${category}`, e);
    }
  }
}

// await sendDataToFireBase();

async function saveCategoriesToFirestore(categories) {
  try {
    const categoriesRef = doc(db, "searchData", "categories"); // Single document for categories
    await setDoc(categoriesRef, categories);
    console.log("Categories successfully saved to Firestore.");
  } catch (error) {
    console.error("Error saving categories:", error);
  }
}

// // Example usage
// saveCategoriesToFirestore(categories);

