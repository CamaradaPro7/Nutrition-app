"use strict";

/* ==========================================================
   MI NUTRICIÓN NEXT V7
   app.js
========================================================== */

const App={

state:{

date:DB.today(),

foods:[],

meals:DB.emptyDay(),

settings:{

kcalGoal:2200

}

},

async init(){

try{

console.log("🚀 Iniciando...");

await DB.open();

Dashboard.render();

Comidas.render();

Eventos.init();

console.log("✅ Mi Nutrición NEXT V7 iniciada");

}

catch(error){

console.error(error);

document.body.innerHTML=`

<div style="padding:40px;text-align:center;font-family:sans-serif;">

<h2>❌ Error al iniciar la aplicación</h2>

<p>Abre la consola para ver el error.</p>

</div>

`;

}

}

};

document.addEventListener(

"DOMContentLoaded",

async()=>{

await App.init();

}

);