"use strict";

/* ==========================================================
   MI NUTRICIÓN NEXT V7
   eventos.js
========================================================== */

const Eventos={

init(){

document.querySelectorAll(".meal").forEach(card=>{

card.addEventListener(

"click",

()=>{

Biblioteca.open(

card.dataset.meal

);

}

);

});

console.log("✅ Eventos iniciados");

}

};

console.log("✅ eventos.js cargado");