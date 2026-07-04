/* ==========================================================
   MI NUTRICIÓN V5
   db.js
   Parte 1/2
   IndexedDB + Migración + API
========================================================== */

"use strict";

/* ==========================================================
   CONFIGURACIÓN
========================================================== */

const DB_NAME = "MiNutricionDB";
const DB_VERSION = 2;
const STORE_NAME = "app";

/* Claves antiguas (compatibilidad V3) */

const LEGACY = {

    FOODS: "foodLibrary",

    MEALS: "miNutricion",

    SETTINGS: "miNutricionSettings"

};

/* Valores por defecto */

const DEFAULT_DATA = {

    foods: [],

    meals: {

        desayuno: [],
        comida: [],
        merienda: [],
        cena: []

    },

    settings: {

        kcalGoal: 2200

    }

};

/* ==========================================================
   ESTADO
========================================================== */

let dbInstance = null;

/* ==========================================================
   ABRIR BASE DE DATOS
========================================================== */

async function openDB() {

    if (dbInstance) {

        return dbInstance;

    }

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = event => {

            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {

                db.createObjectStore(STORE_NAME);

            }

        };

        request.onsuccess = event => {

            dbInstance = event.target.result;

            resolve(dbInstance);

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}

/* ==========================================================
   TRANSACCIÓN
========================================================== */

async function getStore(mode = "readonly") {

    const db = await openDB();

    return db
        .transaction(STORE_NAME, mode)
        .objectStore(STORE_NAME);

}

/* ==========================================================
   GET
========================================================== */

async function dbGet(key) {

    const store = await getStore();

    return new Promise(resolve => {

        const request = store.get(key);

        request.onsuccess = () => {

            resolve(request.result);

        };

        request.onerror = () => {

            resolve(null);

        };

    });

}

/* ==========================================================
   SET
========================================================== */

async function dbSet(key, value) {

    const store = await getStore("readwrite");

    return new Promise((resolve, reject) => {

        const request = store.put(value, key);

        request.onsuccess = () => resolve(value);

        request.onerror = () => reject(request.error);

    });

}

/* ==========================================================
   DELETE
========================================================== */

async function dbDelete(key) {

    const store = await getStore("readwrite");

    return new Promise((resolve, reject) => {

        const request = store.delete(key);

        request.onsuccess = () => resolve(true);

        request.onerror = () => reject(request.error);

    });

}

/* ==========================================================
   CLEAR
========================================================== */

async function dbClear() {

    const store = await getStore("readwrite");

    return new Promise((resolve, reject) => {

        const request = store.clear();

        request.onsuccess = () => resolve(true);

        request.onerror = () => reject(request.error);

    });

}

/* ==========================================================
   EXISTE CLAVE
========================================================== */

async function hasKey(key) {

    return (await dbGet(key)) !== undefined;

}

/* ==========================================================
   MIGRACIÓN DESDE V3
========================================================== */

async function migrateLegacyData() {

    const migrated = await dbGet("migration_v5");

    if (migrated) {

        return;

    }

    const foods =
        JSON.parse(localStorage.getItem(LEGACY.FOODS))
        || DEFAULT_DATA.foods;

    const meals =
        JSON.parse(localStorage.getItem(LEGACY.MEALS))
        || DEFAULT_DATA.meals;

    const settings =
        JSON.parse(localStorage.getItem(LEGACY.SETTINGS))
        || DEFAULT_DATA.settings;

    await dbSet("foods", foods);

    await dbSet("meals", meals);

    await dbSet("settings", settings);

    await dbSet("migration_v5", true);

}

/* ==========================================================
   MI NUTRICIÓN V5
   db.js
   Parte 2/2
   Inicialización + API pública + Backup
========================================================== */

/* ==========================================================
   CARGAR DATOS
========================================================== */

async function loadAppData() {

    await openDB();

    await migrateLegacyData();

    const foods =
        (await dbGet("foods")) ??
        structuredClone(DEFAULT_DATA.foods);

    const meals =
        (await dbGet("meals")) ??
        structuredClone(DEFAULT_DATA.meals);

    const settings =
        (await dbGet("settings")) ??
        structuredClone(DEFAULT_DATA.settings);

    return {
        foods,
        meals,
        settings
    };

}

/* ==========================================================
   GUARDAR DATOS
========================================================== */

async function saveAppData(data = {}) {

    if (data.foods !== undefined) {
        await dbSet("foods", data.foods);
    }

    if (data.meals !== undefined) {
        await dbSet("meals", data.meals);
    }

    if (data.settings !== undefined) {
        await dbSet("settings", data.settings);
    }

}

/* ==========================================================
   BACKUP
========================================================== */

async function createBackup() {

    const data = await loadAppData();

    return {

        version: 5,

        createdAt: new Date().toISOString(),

        foods: data.foods,

        meals: data.meals,

        settings: data.settings

    };

}

/* ==========================================================
   RESTAURAR BACKUP
========================================================== */

async function restoreBackup(backup) {

    if (!backup || typeof backup !== "object") {
        throw new Error("Backup no válido.");
    }

    await saveAppData({

        foods: backup.foods || [],

        meals: backup.meals || structuredClone(DEFAULT_DATA.meals),

        settings: backup.settings || structuredClone(DEFAULT_DATA.settings)

    });

}

/* ==========================================================
   RESETEAR BASE DE DATOS
========================================================== */

async function resetDatabase() {

    await dbClear();

    await saveAppData(DEFAULT_DATA);

    await dbSet("migration_v5", true);

}

/* ==========================================================
   ELIMINAR DATOS LEGACY (OPCIONAL)
========================================================== */

function removeLegacyStorage() {

    localStorage.removeItem(LEGACY.FOODS);

    localStorage.removeItem(LEGACY.MEALS);

    localStorage.removeItem(LEGACY.SETTINGS);

}

/* ==========================================================
   INFORMACIÓN
========================================================== */

async function databaseInfo() {

    const data = await loadAppData();

    return {

        version: DB_VERSION,

        foods: data.foods.length,

        desayuno: data.meals.desayuno.length,

        comida: data.meals.comida.length,

        merienda: data.meals.merienda.length,

        cena: data.meals.cena.length,

        kcalGoal: data.settings.kcalGoal

    };

}

/* ==========================================================
   API PÚBLICA
========================================================== */

window.DB = {

    open: openDB,

    get: dbGet,

    set: dbSet,

    delete: dbDelete,

    clear: dbClear,

    has: hasKey,

    load: loadAppData,

    save: saveAppData,

    backup: createBackup,

    restore: restoreBackup,

    reset: resetDatabase,

    info: databaseInfo,

    removeLegacyStorage

};

/* ==========================================================
   INICIALIZACIÓN
========================================================== */

(async () => {

    try {

        await openDB();

        await migrateLegacyData();

        console.log(
            "%c💾 Mi Nutrición V5 - Base de datos preparada",
            "color:#38d46a;font-weight:bold;"
        );

    } catch (error) {

        console.error(
            "Error inicializando IndexedDB:",
            error
        );

    }

})();

/* ==========================================================
   FIN DEL ARCHIVO db.js V5
========================================================== */