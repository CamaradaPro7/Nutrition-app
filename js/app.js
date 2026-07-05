"use strict";

/* ==========================================================
   MI NUTRICIÓN NEXT V7
   app.js
========================================================== */

const App = {

async init(){

try{

await DB.open();

Dashboard.render();

Biblioteca.init();

Eventos.init();

console.log("✅ Mi Nutrición NEXT V7 iniciada");

}

catch(error){

console.error(error);

document.body.innerHTML=`
<h2 style="padding:40px;text-align:center">
Error al iniciar la aplicación
</h2>
`;

}

}

};

document.addEventListener(
"DOMContentLoaded",
()=>App.init()
);