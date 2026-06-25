// ===== Mi Nutrición V2 =====

const fecha = document.getElementById("fecha");

fecha.textContent = new Date().toLocaleDateString("es-ES",{
weekday:"long",
day:"2-digit",
month:"2-digit",
year:"numeric"
});

const modal=document.getElementById("modal");

const close=document.getElementById("closeModal");

const search=document.getElementById("searchFood");

const results=document.getElementById("foodResults");

let mealSelected="";

document.querySelectorAll(".meal button").forEach(btn=>{

btn.onclick=()=>{

mealSelected=btn.dataset.meal;

modal.classList.remove("hidden");

search.focus();

renderFoods("");

};

});

close.onclick=()=>{

modal.classList.add("hidden");

};

modal.onclick=e=>{

if(e.target===modal){

modal.classList.add("hidden");

}

};

const foods=[

{name:"Pechuga de pollo",kcal:110,p:23,c:0,g:1.5},

{name:"Arroz blanco",kcal:130,p:2.7,c:28,g:0.3},

{name:"Patata cocida",kcal:87,p:2,c:20,g:0},

{name:"Huevo",kcal:155,p:13,c:1,g:11},

{name:"Plátano",kcal:89,p:1,c:23,g:0.3},

{name:"Avena",kcal:370,p:13,c:60,g:7},

{name:"Yogur griego",kcal:97,p:9,c:4,g:5},

{name:"Atún",kcal:116,p:26,c:0,g:1},

{name:"Salmón",kcal:208,p:20,c:0,g:13},

{name:"Aceite de oliva",kcal:884,p:0,c:0,g:100}

];

function renderFoods(filter){

results.innerHTML="";

foods

.filter(f=>f.name.toLowerCase().includes(filter.toLowerCase()))

.forEach(food=>{

results.innerHTML+=`

<div class="food">

<div>

<div class="food-name">${food.name}</div>

<div class="food-info">

${food.kcal} kcal · ${food.p}P · ${food.c}C · ${food.g}G

</div>

</div>

<div class="food-add">+</div>

</div>

`;

});

}

search.oninput=()=>{

renderFoods(search.value);

};

renderFoods("");