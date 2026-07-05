"use strict";

/* ==========================================================
   MI NUTRICIÓN NEXT V7
   db.js
========================================================== */

const DB={

    NAME:"MiNutricionNEXT",

    VERSION:1,

    DATABASE:null,

    async open(){

        if(this.DATABASE){

            return this.DATABASE;

        }

        return new Promise((resolve,reject)=>{

            const request=indexedDB.open(

                this.NAME,

                this.VERSION

            );

            request.onupgradeneeded=e=>{

                const db=e.target.result;

                if(!db.objectStoreNames.contains("config")){

                    db.createObjectStore("config");

                }

                if(!db.objectStoreNames.contains("foods")){

                    db.createObjectStore("foods",{

                        keyPath:"id"

                    });

                }

                if(!db.objectStoreNames.contains("days")){

                    db.createObjectStore("days");

                }

            };

            request.onsuccess=e=>{

                this.DATABASE=e.target.result;

                resolve(this.DATABASE);

            };

            request.onerror=()=>{

                reject(request.error);

            };

        });

    },

    emptyDay(){

        return{

            desayuno:[],

            comida:[],

            merienda:[],

            cena:[]

        };

    },

    todayKey(){

        return new Date().toISOString().slice(0,10);

    }

};

console.log("✅ DB V7 cargada");