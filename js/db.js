const DB_NAME = "MiNutricionDB";
const DB_VERSION = 1;

let db;

function openDB(){

    return new Promise((resolve,reject)=>{

        const request = indexedDB.open(DB_NAME,DB_VERSION);

        request.onupgradeneeded = e=>{

            db = e.target.result;

            db.createObjectStore("foods");
            db.createObjectStore("meals");
            db.createObjectStore("settings");

        };

        request.onsuccess = e=>{

            db = e.target.result;

            resolve(db);

        };

        request.onerror = ()=>reject(request.error);

    });

}

openDB().then(()=>{

    console.log("✅ IndexedDB lista");

});