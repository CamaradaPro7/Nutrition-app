/* =====================================================
   MI NUTRICIÓN V3
   app.js
   Parte 1/3
===================================================== */

const foods = [

{
name:"Pechuga de pollo",
kcal:110,
protein:23,
carbs:0,
fat:1.5
},

{
name:"Arroz blanco",
kcal:130,
protein:2.7,
carbs:28,
fat:0.3
},

{
name:"Avena",
kcal:370,
protein:13,
carbs:60,
fat:7
},

{
name:"Plátano",
kcal:89,
protein:1.1,
carbs:23,
fat:0.3
},

{
name:"Huevo",
kcal:155,
protein:13,
carbs:1,
fat:11
},

{
name:"Salmón",
kcal:208,
protein:20,
carbs:0,
fat:13
},

{
name:"Atún",
kcal:116,
protein:26,
carbs:0,
fat:1
},

{
name:"Patata cocida",
kcal:87,
protein:2,
carbs:20,
fat:0.1
},

{
name:"Yogur griego",
kcal:97,
protein:9,
carbs:4,
fat:5
}

];

const meals={

desayuno:[],
comida:[],
merienda:[],
cena:[]

};

let currentMeal=null;

const modal=document.getElementById("modal");

const search=document.getElementById("searchFood");

const foodResults=document.getElementById("foodResults");

const kcal=document.getElementById("totalKcal");

const protein=document.getElementById("protein");

const carbs=document.getElementById("carbs");

const fat=document.getElementById("fat");

const fecha=document.getElementById("fecha");

const gramsModal=document.getElementById("gramsModal");

const gramsInput=document.getElementById("gramsInput");

const selectedFood=document.getElementById("selectedFood");

const acceptGrams=document.getElementById("acceptGrams");

const cancelGrams=document.getElementById("cancelGrams");

let selectedFoodData=null;

if(fecha){

fecha.textContent=new Date().toLocaleDateString("es-ES",{

weekday:"long",
day:"numeric",
month:"long",
year:"numeric"

});

}

/* =====================================================
   app.js
   Parte 2/3
===================================================== */

function openMeal(meal){

currentMeal=meal;

modal.classList.add("show");

search.value="";

renderFoods();

search.focus();

}

function closeModal(){

modal.classList.remove("show");

}

modal.addEventListener("click",(e)=>{

if(e.target===modal){

closeModal();

}

});

document.querySelectorAll(".add").forEach((btn,index)=>{

const ids=["desayuno","comida","merienda","cena"];

btn.addEventListener("click",()=>{

openMeal(ids[index]);

});

});

function renderFoods(filter=""){

foodResults.innerHTML="";

foods

.filter(food=>

food.name.toLowerCase()

.includes(filter.toLowerCase())

)

.forEach(food=>{

const item=document.createElement("div");

item.className="food-item";

item.innerHTML=`

<div>

<div class="food-name">

${food.name}

</div>

<div class="food-kcal">

${food.kcal} kcal / 100 g

</div>

</div>

`;

item.onclick=()=>{

addFood(food);

};

foodResults.appendChild(item);

});

}

search.addEventListener("input",()=>{

renderFoods(search.value);

});

/* =====================================================
   app.js
   Parte 3/3
===================================================== */

function addFood(food){

    selectedFoodData=food;

    selectedFood.textContent=food.name;

    gramsInput.value=100;

    gramsModal.classList.add("show");

    gramsInput.focus();

}

acceptGrams.onclick=()=>{

    if(!currentMeal || !selectedFoodData) return;

    let grams=parseFloat(gramsInput.value);

    if(isNaN(grams) || grams<=0) return;

    const factor=grams/100;

    meals[currentMeal].push({

        name:selectedFoodData.name,

        grams:grams,

        kcal:Math.round(selectedFoodData.kcal*factor),

        protein:Number((selectedFoodData.protein*factor).toFixed(1)),

        carbs:Number((selectedFoodData.carbs*factor).toFixed(1)),

        fat:Number((selectedFoodData.fat*factor).toFixed(1))

    });

    renderMeals();

    updateTotals();

    gramsInput.value=100;

    search.value="";

    renderFoods();

    gramsModal.classList.remove("show");

};

cancelGrams.onclick=()=>{

    gramsModal.classList.remove("show");

};

function renderMeals(){

    Object.keys(meals).forEach(meal=>{

        const card=document.querySelector(`[data-meal="${meal}"]`);

        if(!card) return;

        const list=card.querySelector(".meal-list");

        const empty=card.querySelector(".emptyMeal");

        list.innerHTML="";

        if(meals[meal].length===0){

            empty.style.display="block";
            return;

        }

        empty.style.display="none";

        meals[meal].forEach((food,index)=>{

            const item=document.createElement("div");

            item.className="food-item fade-in";

            item.innerHTML=`

            <div class="food-name">

        ${food.name}

<br>

<small style="color:#999;">
${food.grams} g
</small>

            </div>

            <div style="display:flex;align-items:center;gap:12px;">

                <div class="food-kcal">

                    ${food.kcal} kcal

                </div>

                <button
                onclick="removeFood('${meal}',${index})"
                style="
                width:34px;
                height:34px;
                border:none;
                border-radius:10px;
                background:#ff5b67;
                color:white;
                font-size:18px;
                cursor:pointer;
                ">
                🗑️
                </button>

            </div>

            `;

            list.appendChild(item);

        });

    });

}

function updateTotals(){

    let totalKcal=0;
    let totalProtein=0;
    let totalCarbs=0;
    let totalFat=0;

    Object.values(meals).flat().forEach(food=>{

        totalKcal+=food.kcal;
        totalProtein+=food.protein;
        totalCarbs+=food.carbs;
        totalFat+=food.fat;

    });

    kcal.textContent=Math.round(totalKcal);
    protein.textContent=Math.round(totalProtein)+" g";
    carbs.textContent=Math.round(totalCarbs)+" g";
    fat.textContent=Math.round(totalFat)+" g";

    localStorage.setItem("miNutricion",JSON.stringify(meals));

}

function removeFood(meal,index){

    meals[meal].splice(index,1);

    renderMeals();

    updateTotals();

}

const saved=localStorage.getItem("miNutricion");

if(saved){

    Object.assign(meals,JSON.parse(saved));

}

renderMeals();

updateTotals();

renderFoods();