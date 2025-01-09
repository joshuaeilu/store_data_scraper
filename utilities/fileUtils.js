import fs from "fs/promises";

export async function saveToFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`Data saved to ${filePath}`);
    } catch (error) {
        console.error(`Error saving data to ${filePath}:`, error.message);
    }
}

export async function saveMapToFile(filePath, map){
    try {
        const jsonString = JSON.stringify(Object.fromEntries(map), null, 2);
       await fs.writeFile(filePath, jsonString, 'utf8');
        console.log(`Map saved to ${filePath}`);
    } catch (error) {
        console.error(`Error saving map to ${filePath}:`, error.message);
    }
}