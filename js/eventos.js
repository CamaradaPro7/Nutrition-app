"use strict";

/* ==========================================================
   MI NUTRICIÓN NEXT V7
   eventos.js
========================================================== */

const Eventos={

init(){

const cards=document.querySelectorAll(".meal");

cards.forEach(card=>{

card.addEventListener(

"click",

()=>{

const meal=card.dataset.meal;

this.openMeal(meal);

}

);

});

console.log("✅ Eventos iniciados");

},

openMeal(meal){

const nombres={

desayuno:"🍳 Desayuno",

comida:"🍝 Comida",

merienda:"🥪 Merienda",

cena:"🌙 Cena"

};

alert(

`Has pulsado:\n\n${nombres[meal]}`

);

}

};

console.log("✅ eventos.js cargado");