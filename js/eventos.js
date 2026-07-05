"use strict";

const Eventos={

init(){

console.log("Eventos.init()");

document.querySelectorAll(".meal").forEach(card=>{

card.onclick=()=>{

alert(card.dataset.meal);

};

});

}

};