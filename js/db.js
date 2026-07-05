"use strict";

const DB={

db:null,

name:"MiNutricionNEXT",

version:1,

today(){

return new Date().toISOString().slice(0,10);

},

emptyDay(){

return{

desayuno:[],

comida:[],

merienda:[],

cena:[]

};

},

async open(){

if(this.db){

return this.db;

}

return new Promise((resolve,reject)=>{

const request=indexedDB.open(

this.name,

this.version

);

request.onupgradeneeded=e=>{

const db=e.target.result;

if(!db.objectStoreNames.contains("foods")){

db.createObjectStore("foods",{

keyPath:"id"

});

}

if(!db.objectStoreNames.contains("days")){

db.createObjectStore("days");

}

if(!db.objectStoreNames.contains("settings")){

db.createObjectStore("settings");

}

};

request.onsuccess=e=>{

this.db=e.target.result;

resolve(this.db);

};

request.onerror=()=>reject(request.error);

});

}

};

console.log("✅ db.js cargado");