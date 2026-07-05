"use strict";

const Comidas={

data:DB.emptyDay(),

mealNames:[

"desayuno",

"comida",

"merienda",

"cena"

],

get(meal){

return this.data[meal];

},

add(meal,food){

if(!this.data[meal]){

return false;

}

this.data[meal].push(food);

this.render();

return true;

},

remove(meal,index){

this.data[meal].splice(index,1);

this.render();

},

total(meal){

return this.data[meal]

.reduce(

(sum,item)=>sum+(item.kcal||0),

0

);

},

render(){

this.mealNames.forEach(meal=>{

const card=document.querySelector(

`[data-meal="${meal}"]`

);

if(!card){

return;

}

const preview=

card.querySelector(".meal-preview");

const empty=

card.querySelector(".emptyMeal");

const total=

card.querySelector(".meal-total");

preview.innerHTML="";

const foods=this.data[meal];

if(!foods.length){

empty.style.display="block";

total.textContent="0 kcal";

return;

}

empty.style.display="none";

foods.forEach(food=>{

const row=document.createElement("div");

row.className="preview-item";

row.innerHTML=`

<div>${food.name}</div>

<div>${food.kcal} kcal</div>

`;

preview.appendChild(row);

});

total.textContent=

this.total(meal)+" kcal";

});

}

};

console.log("✅ comidas.js cargado");