const DB_NAME = "MiNutricionDB";
const DB_VERSION = 1;

let db;

function openDB() {
    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = e => {

            db = e.target.result;

            if (!db.objectStoreNames.contains("data")) {
                db.createObjectStore("data");
            }

        };

        request.onsuccess = e => {
            db = e.target.result;
            resolve();
        };

        request.onerror = reject;

    });
}

async function get(key) {

    await openDB();

    return new Promise(resolve => {

        const tx = db.transaction("data", "readonly");
        const store = tx.objectStore("data");

        const req = store.get(key);

        req.onsuccess = () => resolve(req.result);

        req.onerror = () => resolve(null);

    });

}

async function set(key, value) {

    await openDB();

    return new Promise(resolve => {

        const tx = db.transaction("data", "readwrite");

        tx.objectStore("data").put(value, key);

        tx.oncomplete = resolve;

    });

}

window.DB = {

    getFoods: () => get("foods"),

    saveFoods: data => set("foods", data),

    getMeals: () => get("meals"),

    saveMeals: data => set("meals", data),

    getSettings: () => get("settings"),

    saveSettings: data => set("settings", data)

};

openDB().then(() => {
    console.log("✅ IndexedDB lista");
});