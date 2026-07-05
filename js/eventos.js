"use strict";

const Eventos={

init(){

document

.querySelectorAll(".meal")

.forEach(card=>{

card.addEventListener(

"click",

()=>{

const meal=

card.dataset.meal;

Eventos.openMeal(meal);

}

);

});

},

openMeal(meal){

alert(

`Has pulsado:\n\n${meal}`

);

}

};

console.log("✅ eventos.js cargado");