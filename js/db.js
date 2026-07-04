/* ==========================================================
   MI NUTRICIÓN NEXT
   db.js
   PARTE 1/4
========================================================== */

"use strict";

/* ==========================================================
   CONFIGURACIÓN
========================================================== */

const DB_NAME = "MiNutricionNext";

const DB_VERSION = 1;

const STORE = "app";

let db = null;

/* ==========================================================
   ABRIR BASE DE DATOS
========================================================== */

function openDB(){

    if(db){

        return Promise.resolve(db);

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

        const req = tx.objectStore(STORE).get(key);

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

        tx.objectStore(STORE).put(value,key);

        tx.oncomplete = ()=>{

            resolve(true);

        };

        tx.onerror = ()=>{

            resolve(false);

        };

    });

}

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

        tx.objectStore(STORE).delete(key);

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
   FECHA ACTUAL
========================================================== */

function todayKey(){

    const date = new Date();

    const year = date.getFullYear();

    const month = String(

        date.getMonth()+1

    ).padStart(2,"0");

    const day = String(

        date.getDate()

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
   INICIALIZAR
========================================================== */

async function initializeDatabase(){

    if(await dbGet("foods")===undefined){

        await dbSet(

            "foods",

            []

        );

    }

    if(await dbGet("settings")===undefined){

        await dbSet(

            "settings",

            defaultSettings()

        );

    }

    let diary = await dbGet("diary");

    if(!diary){

        diary = {};

    }

    const today = todayKey();

    if(!diary[today]){

        diary[today] = emptyDay();

    }

    await dbSet(

        "diary",

        diary

    );

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

            await dbGet("settings") ||

            defaultSettings(),

        diary:

            await dbGet("diary") || {}

    };

}

/* ==========================================================
   GUARDAR
========================================================== */

async function saveFoods(foods){

    return dbSet(

        "foods",

        foods

    );

}

async function saveSettings(settings){

    return dbSet(

        "settings",

        settings

    );

}

async function saveDiary(diary){

    return dbSet(

        "diary",

        diary

    );

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   db.js
   PARTE 3/4
========================================================== */

/* ==========================================================
   OBTENER DÍA
========================================================== */

async function getDay(date = todayKey()){

    const diary = await dbGet("diary") || {};

    if(!diary[date]){

        diary[date] = emptyDay();

        await dbSet(

            "diary",

            diary

        );

    }

    return structuredClone(

        diary[date]

    );

}

/* ==========================================================
   GUARDAR DÍA
========================================================== */

async function saveDay(date,meals){

    const diary = await dbGet("diary") || {};

    diary[date] = structuredClone(

        meals

    );

    await dbSet(

        "diary",

        diary

    );

}

/* ==========================================================
   ELIMINAR DÍA
========================================================== */

async function deleteDay(date){

    const diary = await dbGet("diary") || {};

    delete diary[date];

    await dbSet(

        "diary",

        diary

    );

}

/* ==========================================================
   HISTORIAL
========================================================== */

async function getHistory(){

    const diary = await dbGet("diary") || {};

    return Object.keys(diary)

        .sort((a,b)=>

            b.localeCompare(a)

        );

}

/* ==========================================================
   DUPLICAR DÍA
========================================================== */

async function duplicateDay(fromDate,toDate){

    const diary = await dbGet("diary") || {};

    if(!diary[fromDate]){

        return false;

    }

    diary[toDate] = structuredClone(

        diary[fromDate]

    );

    await dbSet(

        "diary",

        diary

    );

    return true;

}

/* ==========================================================
   ESTADÍSTICAS
========================================================== */

async function databaseStats(){

    const foods =

        await dbGet("foods") || [];

    const diary =

        await dbGet("diary") || {};

    return{

        foods: foods.length,

        days: Object.keys(diary).length,

        latest:

            Object.keys(diary)

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

    return{

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
   REINICIAR BASE DE DATOS
========================================================== */

async function resetDatabase(){

    await dbDelete("foods");

    await dbDelete("settings");

    await dbDelete("diary");

    await initializeDatabase();

}

/* ==========================================================
   API PÚBLICA
========================================================== */

window.DB={

    open:openDB,

    get:dbGet,

    set:dbSet,

    delete:dbDelete,

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

                "%c💾 Base de datos preparada",

                "color:#34c759;font-weight:bold;"

            );

        }

        catch(error){

            console.error(

                error

            );

        }

    }

);

/* ==========================================================
   FIN DEL ARCHIVO
========================================================== */