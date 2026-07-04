const DB_NAME = "MiNutricionDB";
const DB_VERSION = 1;
const STORE = "app";

let db = null;

async function openDB() {

    if (db) return db;

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {

            db = request.result;

            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE);
            }

        };

        request.onsuccess = () => {

            db = request.result;
            resolve(db);

        };

        request.onerror = () => reject(request.error);

    });

}

async function dbGet(key) {

    await openDB();

    return new Promise(resolve => {

        const tx = db.transaction(STORE, "readonly");

        const req = tx.objectStore(STORE).get(key);

        req.onsuccess = () => resolve(req.result);

        req.onerror = () => resolve(null);

    });

}

async function dbSet(key, value) {

    await openDB();

    return new Promise(resolve => {

        const tx = db.transaction(STORE, "readwrite");

        tx.objectStore(STORE).put(value, key);

        tx.oncomplete = () => resolve(true);

        tx.onerror = () => resolve(false);

    });

}

async function dbDelete(key){

    await openDB();

    return new Promise(resolve=>{

        const tx=db.transaction(STORE,"readwrite");

        tx.objectStore(STORE).delete(key);

        tx.oncomplete=()=>resolve(true);

    });

}

async function dbClear(){

    await openDB();

    return new Promise(resolve=>{

        const tx=db.transaction(STORE,"readwrite");

        tx.objectStore(STORE).clear();

        tx.oncomplete=()=>resolve(true);

    });

}

async function migrateFromLocalStorage(){

    if(await dbGet("migrated")) return;

    await dbSet(
        "foods",
        JSON.parse(localStorage.getItem("foodLibrary")) || []
    );

    await dbSet(
        "meals",
        JSON.parse(localStorage.getItem("miNutricion")) || {
            desayuno:[],
            comida:[],
            merienda:[],
            cena:[]
        }
    );

    await dbSet(
        "settings",
        JSON.parse(localStorage.getItem("miNutricionSettings")) || {
            kcalGoal:2200
        }
    );

    await dbSet("migrated", true);

}