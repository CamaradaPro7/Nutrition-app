"use strict";

/* ==========================================================
   MI NUTRICIÓN NEXT V7
   biblioteca.js
========================================================== */

const Biblioteca={

meal:null,

open(meal){

this.meal=meal;

const modal=document.getElementById("modal");

const title=document.getElementById("sheetTitle");

const list=document.getElementById("foodResults");

title.textContent={

desayuno:"🍳 Desayuno",

comida:"🍝 Comida",

merienda:"🥪 Merienda",

cena:"🌙 Cena"

}[meal];

list.innerHTML=`

<div class="emptyMeal">

Biblioteca vacía

</div>

`;

modal.classList.add("show");

},

close(){

document

.getElementById("modal")

.classList.remove("show");

},

init(){

document

.getElementById("closeFoodModal")

.addEventListener(

"click",

()=>this.close()

);

document

.getElementById("modal")

.addEventListener(

"click",

e=>{

if(e.target.id==="modal"){

this.close();

}

}

);

}

};

console.log("✅ biblioteca.js cargado");