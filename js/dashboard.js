"use strict";

const Dashboard={

render(){

$("app").innerHTML=`

<header class="header">

<h1 id="greeting">Buenos días</h1>

<p id="fecha">${formatDate(new Date())}</p>

</header>

<section class="dashboard">

<div class="ring">

<div id="ringProgress" class="ring-progress">

<div class="ring-center">

<span id="totalKcal">0</span>

<small>de 2200 kcal</small>

</div>

</div>

</div>

<div class="macros">

<div class="macro">

<span>🥩 Proteínas</span>

<strong id="protein">0 g</strong>

</div>

<div class="macro">

<span>🍚 Hidratos</span>

<strong id="carbs">0 g</strong>

</div>

<div class="macro">

<span>🥑 Grasas</span>

<strong id="fat">0 g</strong>

</div>

</div>

</section>

<section class="meals">

${this.card("desayuno","🍳 Desayuno")}

${this.card("comida","🍝 Comida")}

${this.card("merienda","🥪 Merienda")}

${this.card("cena","🌙 Cena")}

</section>

`;

},

card(id,title){

return`

<article class="meal" data-meal="${id}">

<div class="meal-header">

<h2>${title}</h2>

</div>

<div class="meal-body">

<p class="emptyMeal">

Sin alimentos

</p>

<div class="meal-preview"></div>

<div class="meal-total">

0 kcal

</div>

</div>

</article>

`;

}

};

console.log("✅ dashboard.js cargado");