const DB_NAME = "MiNutricionDB";
const STORE = "datos";

let db;

async function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);

        req.onupgradeneeded = () => {
            db = req.result;
            db.createObjectStore(STORE);
        };

        req.onsuccess = () => {
            db = req.result;
            resolve();
        };

        req.onerror = () => reject(req.error);
    });
}

async function dbGet(key) {
    return new Promise((resolve) => {
        const tx = db.transaction(STORE, "readonly");
        const store = tx.objectStore(STORE);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
}

async function dbSet(key, value) {
    return new Promise((resolve) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(value, key);
        tx.oncomplete = () => resolve();
    });
}