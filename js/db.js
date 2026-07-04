/* ==========================================================
   MI NUTRICIÓN NEXT
   db.js
   PARTE 1/4
========================================================== */

"use strict";

const DB_NAME = "MiNutricionNext";

const DB_VERSION = 1;

const STORE = "app";

let db;

/* ==========================================================
   ABRIR BD
========================================================== */

async function openDB(){

    if(db){

        return db;

    }

    return new Promise((resolve,reject)=>{

        const request = indexedDB.open(

            DB_NAME,

            DB_VERSION

        );

        request.onupgradeneeded = ()=>{

            db = request.result;

            if(!db.objectStoreNames.contains(STORE)){

                db.createObjectStore(STORE);

            }

        };

        request.onsuccess = ()=>{

            db = request.result;

            resolve(db);

        };

        request.onerror = ()=>{

            reject(request.error);

        };

    });

}

/* ==========================================================
   GET
========================================================== */

async function dbGet(key){

    await openDB();

    return new Promise(resolve=>{

        const tx = db.transaction(

            STORE,

            "readonly"

        );

        const req = tx

            .objectStore(STORE)

            .get(key);

        req.onsuccess = ()=>{

            resolve(req.result);

        };

        req.onerror = ()=>{

            resolve(null);

        };

    });

}

/* ==========================================================
   SET
========================================================== */

async function dbSet(key,value){

    await openDB();

    return new Promise(resolve=>{

        const tx = db.transaction(

            STORE,

            "readwrite"

        );

        tx.objectStore(STORE)

            .put(value,key);

        tx.oncomplete = ()=>{

            resolve(true);

        };

        tx.onerror = ()=>{

            resolve(false);

        };

    });

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   db.js
   PARTE 2/4
========================================================== */

/* ==========================================================
   DELETE
========================================================== */

async function dbDelete(key){

    await openDB();

    return new Promise(resolve=>{

        const tx = db.transaction(
            STORE,
            "readwrite"
        );

        tx.objectStore(STORE)
            .delete(key);

        tx.oncomplete = ()=>resolve(true);

        tx.onerror = ()=>resolve(false);

    });

}

/* ==========================================================
   CLEAR
========================================================== */

async function dbClear(){

    await openDB();

    return new Promise(resolve=>{

        const tx = db.transaction(
            STORE,
            "readwrite"
        );

        tx.objectStore(STORE)
            .clear();

        tx.oncomplete = ()=>resolve(true);

        tx.onerror = ()=>resolve(false);

    });

}

/* ==========================================================
   FECHA YYYY-MM-DD
========================================================== */

function todayKey(){

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth()+1
    ).padStart(2,"0");

    const day = String(
        now.getDate()
    ).padStart(2,"0");

    return `${year}-${month}-${day}`;

}

/* ==========================================================
   DÍA VACÍO
========================================================== */

function emptyDay(){

    return{

        desayuno:[],

        comida:[],

        merienda:[],

        cena:[]

    };

}

/* ==========================================================
   CONFIGURACIÓN
========================================================== */

function defaultSettings(){

    return{

        kcalGoal:2200

    };

}

/* ==========================================================
   INICIALIZAR BASE DE DATOS
========================================================== */

async function initializeDatabase(){

    await openDB();

    let foods = await dbGet("foods");

    if(!foods){

        foods = [];

        await dbSet("foods",foods);

    }

    let settings = await dbGet("settings");

    if(!settings){

        settings = defaultSettings();

        await dbSet("settings",settings);

    }

    let diary = await dbGet("diary");

    if(!diary){

        diary = {};

    }

    const today = todayKey();

    if(!diary[today]){

        diary[today] = emptyDay();

    }

    await dbSet("diary",diary);

}

/* ==========================================================
   CARGAR DATOS
========================================================== */

async function loadDatabase(){

    await initializeDatabase();

    return{

        foods:

            await dbGet("foods") || [],

        settings:

            await dbGet("settings") || defaultSettings(),

        diary:

            await dbGet("diary") || {}

    };

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   db.js
   PARTE 3/4
========================================================== */

/* ==========================================================
   GUARDAR ALIMENTOS
========================================================== */

async function saveFoods(foods){

    return dbSet("foods", foods);

}

/* ==========================================================
   GUARDAR CONFIGURACIÓN
========================================================== */

async function saveSettings(settings){

    return dbSet("settings", settings);

}

/* ==========================================================
   GUARDAR HISTORIAL COMPLETO
========================================================== */

async function saveDiary(diary){

    return dbSet("diary", diary);

}

/* ==========================================================
   OBTENER DÍA
========================================================== */

async function getDay(date = todayKey()){

    const diary = await dbGet("diary") || {};

    if(!diary[date]){

        diary[date] = emptyDay();

        await dbSet("diary", diary);

    }

    return structuredClone(diary[date]);

}

/* ==========================================================
   GUARDAR DÍA
========================================================== */

async function saveDay(date, meals){

    const diary = await dbGet("diary") || {};

    diary[date] = structuredClone(meals);

    await dbSet("diary", diary);

}

/* ==========================================================
   ELIMINAR DÍA
========================================================== */

async function deleteDay(date){

    const diary = await dbGet("diary") || {};

    delete diary[date];

    await dbSet("diary", diary);

}

/* ==========================================================
   LISTA DE DÍAS
========================================================== */

async function getHistory(){

    const diary = await dbGet("diary") || {};

    return Object.keys(diary)

        .sort((a,b)=>b.localeCompare(a));

}

/* ==========================================================
   COPIAR DÍA
========================================================== */

async function duplicateDay(fromDate,toDate){

    const diary = await dbGet("diary") || {};

    if(!diary[fromDate]){

        return false;

    }

    diary[toDate] = structuredClone(

        diary[fromDate]

    );

    await dbSet("diary", diary);

    return true;

}

/* ==========================================================
   ESTADÍSTICAS
========================================================== */

async function databaseStats(){

    const foods = await dbGet("foods") || [];

    const diary = await dbGet("diary") || {};

    return{

        foods: foods.length,

        days: Object.keys(diary).length,

        latest: Object.keys(diary)

            .sort()

            .pop() || null

    };

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   db.js
   PARTE 4/4
========================================================== */

/* ==========================================================
   EXPORTAR COPIA
========================================================== */

async function exportBackup(){

    return {

        version:1,

        created:new Date().toISOString(),

        foods:await dbGet("foods") || [],

        settings:await dbGet("settings") || defaultSettings(),

        diary:await dbGet("diary") || {}

    };

}

/* ==========================================================
   IMPORTAR COPIA
========================================================== */

async function importBackup(data){

    if(!data){

        return false;

    }

    await dbSet(

        "foods",

        Array.isArray(data.foods)

            ? data.foods

            : []

    );

    await dbSet(

        "settings",

        data.settings ||

        defaultSettings()

    );

    await dbSet(

        "diary",

        data.diary ||

        {}

    );

    return true;

}

/* ==========================================================
   RESETEAR BASE DE DATOS
========================================================== */

async function resetDatabase(){

    await dbClear();

    await initializeDatabase();

}

/* ==========================================================
   API PÚBLICA
========================================================== */

window.DB = {

    open:openDB,

    get:dbGet,

    set:dbSet,

    delete:dbDelete,

    clear:dbClear,

    load:loadDatabase,

    saveFoods,

    saveSettings,

    saveDiary,

    getDay,

    saveDay,

    deleteDay,

    getHistory,

    duplicateDay,

    exportBackup,

    importBackup,

    databaseStats,

    resetDatabase,

    todayKey,

    emptyDay

};

/* ==========================================================
   INICIALIZACIÓN
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    async()=>{

        try{

            await initializeDatabase();

            console.log(

                "%c💾 Base de datos lista",

                "color:#38d46a;font-weight:bold;"

            );

        }

        catch(error){

            console.error(

                "Error inicializando la base de datos",

                error

            );

        }

    }

);

/* ==========================================================
   FIN DEL ARCHIVO
   db.js
========================================================== */