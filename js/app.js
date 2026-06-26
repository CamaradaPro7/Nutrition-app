/* =====================================================
   MI NUTRICIÓN V2
   app.js
   Parte 1/6
===================================================== */

/* ===========================
   BIBLIOTECA
=========================== */

let foods = JSON.parse(localStorage.getItem("foodLibrary")) || [];

/* ===========================
   COMIDAS
=========================== */

const meals = {

    desayuno:[],
    comida:[],
    merienda:[],
    cena:[]

};

/* ===========================
   VARIABLES
=========================== */

let currentMeal = null;
let selectedFoodData = null;
let editingMeal = null;
let editingIndex = null;

/* ===========================
   MODALES
=========================== */

const modal = document.getElementById("modal");
const gramsModal = document.getElementById("gramsModal");
const newFoodModal = document.getElementById("newFoodModal");

/* ===========================
   BUSCADOR
=========================== */

const search = document.getElementById("searchFood");
const foodResults = document.getElementById("foodResults");

/* ===========================
   MODAL GRAMOS
=========================== */

const gramsInput = document.getElementById("gramsInput");
const selectedFood = document.getElementById("selectedFood");

const acceptGrams = document.getElementById("acceptGrams");
const cancelGrams = document.getElementById("cancelGrams");

/* ===========================
   NUEVO ALIMENTO
=========================== */

const newFoodBtn = document.getElementById("newFoodBtn");

const pasteJsonBtn = document.getElementById("pasteJsonBtn");
const jsonInput = document.getElementById("jsonInput");

const foodName = document.getElementById("foodName");
const foodBrand = document.getElementById("foodBrand");
const foodUnit = document.getElementById("foodUnit");

const foodKcal = document.getElementById("foodKcal");
const foodProtein = document.getElementById("foodProtein");
const foodCarbs = document.getElementById("foodCarbs");
const foodFat = document.getElementById("foodFat");

const saveFood = document.getElementById("saveFood");
const cancelFood = document.getElementById("cancelFood");

/* ===========================
   DASHBOARD
=========================== */

const kcal = document.getElementById("totalKcal");
const protein = document.getElementById("protein");
const carbs = document.getElementById("carbs");
const fat = document.getElementById("fat");

/* ===========================
   FECHA
=========================== */

const fecha = document.getElementById("fecha");

if(fecha){

    fecha.textContent = new Date().toLocaleDateString("es-ES",{

        weekday:"long",
        day:"numeric",
        month:"long",
        year:"numeric"

    });

}

/* =====================================================
   MI NUTRICIÓN V2
   app.js
   Parte 2/6
===================================================== */

function openMeal(meal){

    currentMeal = meal;

    modal.classList.add("show");

    search.value = "";

    renderFoods();

    search.focus();

}

function closeModal(){

    modal.classList.remove("show");

}

function openNewFood(){

    newFoodModal.classList.add("show");

    jsonInput.value = "";

    foodName.value = "";
    foodBrand.value = "";
    foodUnit.value = "g";

    foodKcal.value = "";
    foodProtein.value = "";
    foodCarbs.value = "";
    foodFat.value = "";

}

function closeNewFood(){

    newFoodModal.classList.remove("show");

}

document.querySelectorAll(".add").forEach((btn,index)=>{

    const ids=[

        "desayuno",
        "comida",
        "merienda",
        "cena"

    ];

    btn.onclick=()=>openMeal(ids[index]);

});

document.getElementById("closeFoodModal").onclick=()=>{

    closeModal();

};

newFoodBtn.onclick=()=>{

    openNewFood();

};

cancelFood.onclick=()=>{

    closeNewFood();

};

cancelGrams.onclick=()=>{

    gramsModal.classList.remove("show");

};

modal.onclick=(e)=>{

    if(e.target===modal){

        closeModal();

    }

};

gramsModal.onclick=(e)=>{

    if(e.target===gramsModal){

        gramsModal.classList.remove("show");

    }

};

newFoodModal.onclick=(e)=>{

    if(e.target===newFoodModal){

        closeNewFood();

    }

};

/* =====================================================
   MI NUTRICIÓN V2
   app.js
   Parte 3/6
===================================================== */

pasteJsonBtn.onclick=()=>{

    try{

        const data=JSON.parse(jsonInput.value);

        foodName.value=data.nombre ?? "";
        foodBrand.value=data.marca ?? "";
        foodUnit.value=data.unidad ?? "g";

        foodKcal.value=data.kcal ?? "";
        foodProtein.value=data.proteinas ?? "";
        foodCarbs.value=data.hidratos ?? "";
        foodFat.value=data.grasas ?? "";

    }catch{

        alert("El JSON no es válido.");

    }

};

saveFood.onclick=()=>{

    if(foodName.value.trim()===""){

        alert("Introduce un nombre.");

        return;

    }

    const newFood={

        name:foodName.value.trim(),

        brand:foodBrand.value.trim(),

        unit:foodUnit.value.trim() || "g",

        kcal:Number(foodKcal.value),

        protein:Number(foodProtein.value),

        carbs:Number(foodCarbs.value),

        fat:Number(foodFat.value)

    };

    foods.push(newFood);

    localStorage.setItem(

        "foodLibrary",

        JSON.stringify(foods)

    );

    closeNewFood();

    renderFoods(search.value);

};

function renderFoods(filter=""){

    foodResults.innerHTML="";

    const list=foods.filter(food=>

        food.name
        .toLowerCase()
        .includes(filter.toLowerCase())

    );

    if(list.length===0){

        foodResults.innerHTML=`

        <div style="
        text-align:center;
        padding:40px 20px;
        color:#8f98a8;
        ">

        📚<br><br>

        Tu biblioteca está vacía.<br><br>

        Pulsa <strong>➕ Nuevo alimento</strong>

        </div>

        `;

        return;

    }

    list.forEach(food=>{

        const item=document.createElement("div");

        item.className="food-item";

        item.innerHTML=`

        <div>

            <div class="food-name">

                ${food.name}

            </div>

            <div class="food-kcal">

                ${food.kcal} kcal /100 ${food.unit}

            </div>

        </div>

        `;

        item.onclick=()=>{

            selectedFoodData=food;

            editingMeal=null;

            editingIndex=null;

            selectedFood.textContent=food.name;

            gramsInput.value=100;

            gramsModal.classList.add("show");

            gramsInput.focus();

        };

        foodResults.appendChild(item);

    });

}

search.oninput=()=>{

    renderFoods(search.value);

};

/* =====================================================
   MI NUTRICIÓN V2
   app.js
   Parte 4/6
===================================================== */

acceptGrams.onclick=()=>{

    let grams=parseFloat(gramsInput.value);

    if(isNaN(grams) || grams<=0) return;

    const factor=grams/100;

    const item={

        name:selectedFoodData.name,

        brand:selectedFoodData.brand || "",

        unit:selectedFoodData.unit || "g",

        grams:grams,

        kcal:Math.round(selectedFoodData.kcal*factor),

        protein:Number((selectedFoodData.protein*factor).toFixed(1)),

        carbs:Number((selectedFoodData.carbs*factor).toFixed(1)),

        fat:Number((selectedFoodData.fat*factor).toFixed(1))

    };

    if(editingMeal!==null){

        meals[editingMeal][editingIndex]=item;

        editingMeal=null;
        editingIndex=null;

    }else{

        meals[currentMeal].push(item);

    }

    renderMeals();

    updateTotals();

    localStorage.setItem(

        "miNutricion",

        JSON.stringify(meals)

    );

    gramsModal.classList.remove("show");

};

function editFood(meal,index){

    const food=meals[meal][index];

    const original=foods.find(f=>f.name===food.name);

    if(!original) return;

    selectedFoodData=original;

    editingMeal=meal;
    editingIndex=index;

    selectedFood.textContent=food.name;

    gramsInput.value=food.grams;

    gramsModal.classList.add("show");

    gramsInput.focus();

}

/* =====================================================
   MI NUTRICIÓN V2
   app.js
   Parte 5/6
===================================================== */

function renderMeals(){

    Object.keys(meals).forEach(meal=>{

        const card=document.querySelector(`[data-meal="${meal}"]`);

        if(!card) return;

        const list=card.querySelector(".meal-list");

        const empty=card.querySelector(".emptyMeal");

        list.innerHTML="";

        let mealTotal=0;

        if(meals[meal].length===0){

            empty.style.display="block";

            return;

        }

        empty.style.display="none";

        meals[meal].forEach((food,index)=>{

            mealTotal+=food.kcal;

            const item=document.createElement("div");

            item.className="food-item fade-in";

            item.innerHTML=`

<div
style="flex:1;cursor:pointer;"
onclick="editFood('${meal}',${index})">

<div class="food-name">

${food.name}

</div>

<small style="color:#8d97a6;">

${food.grams} ${food.unit}

</small>

</div>

<div
style="
display:flex;
align-items:center;
gap:10px;
">

<div class="food-kcal">

${food.kcal} kcal

</div>

<button

onclick="event.stopPropagation();removeFood('${meal}',${index})"

style="
width:32px;
height:32px;
border:none;
border-radius:10px;
background:#ff5b67;
color:white;
font-size:16px;
cursor:pointer;
">

🗑️

</button>

</div>

`;

            list.appendChild(item);

        });

        const total=document.createElement("div");

        total.style.cssText=`
margin-top:14px;
padding-top:14px;
border-top:1px solid #2b3442;
display:flex;
justify-content:space-between;
font-weight:700;
color:#f4f6fb;
`;

        total.innerHTML=`

<span>

Total

</span>

<span>

${mealTotal} kcal

</span>

`;

        list.appendChild(total);

    });

}

/* =====================================================
   MI NUTRICIÓN V2
   app.js
   Parte 6/6
===================================================== */

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

    protein.textContent=
        Math.round(totalProtein)+" g";

    carbs.textContent=
        Math.round(totalCarbs)+" g";

    fat.textContent=
        Math.round(totalFat)+" g";

}

function removeFood(meal,index){

    meals[meal].splice(index,1);

    renderMeals();

    updateTotals();

    localStorage.setItem(

        "miNutricion",

        JSON.stringify(meals)

    );

}

const savedMeals=

JSON.parse(

    localStorage.getItem("miNutricion")

);

if(savedMeals){

    Object.assign(

        meals,

        savedMeals

    );

}

renderFoods();

renderMeals();

updateTotals();