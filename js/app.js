/* =====================================================
   MI NUTRICIÓN V3
   app.js
===================================================== */

/* ===========================
   BIBLIOTECA DE ALIMENTOS
=========================== */

let foods = JSON.parse(localStorage.getItem("foodLibrary"));

if(!foods){

    foods=[];

    localStorage.setItem("foodLibrary",JSON.stringify(foods));

}

/* ===========================
   COMIDAS DEL DÍA
=========================== */

const meals={

desayuno:[],
comida:[],
merienda:[],
cena:[]

};

/* ===========================
   VARIABLES
=========================== */

let currentMeal=null;
let selectedFoodData=null;
let editingMeal=null;
let editingIndex=null;

/* ===========================
   MODALES
=========================== */

const modal=document.getElementById("modal");
const gramsModal=document.getElementById("gramsModal");
const newFoodModal=document.getElementById("newFoodModal");

/* ===========================
   BUSCADOR
=========================== */

const search=document.getElementById("searchFood");
const foodResults=document.getElementById("foodResults");

/* ===========================
   GRAMOS
=========================== */

const gramsInput=document.getElementById("gramsInput");
const selectedFood=document.getElementById("selectedFood");

const acceptGrams=document.getElementById("acceptGrams");
const cancelGrams=document.getElementById("cancelGrams");

/* ===========================
   NUEVO ALIMENTO
=========================== */

const newFoodBtn=document.getElementById("newFoodBtn");

const foodName=document.getElementById("foodName");
const foodKcal=document.getElementById("foodKcal");
const foodProtein=document.getElementById("foodProtein");
const foodCarbs=document.getElementById("foodCarbs");
const foodFat=document.getElementById("foodFat");

const saveFood=document.getElementById("saveFood");
const cancelFood=document.getElementById("cancelFood");

const pasteJsonBtn=document.getElementById("pasteJsonBtn");
const jsonInput=document.getElementById("jsonInput");
const foodBrand=document.getElementById("foodBrand");
const foodUnit=document.getElementById("foodUnit");

/* ===========================
   DASHBOARD
=========================== */

const kcal=document.getElementById("totalKcal");
const protein=document.getElementById("protein");
const carbs=document.getElementById("carbs");
const fat=document.getElementById("fat");

/* ===========================
   FECHA
=========================== */

const fecha=document.getElementById("fecha");

if(fecha){

fecha.textContent=new Date().toLocaleDateString("es-ES",{

weekday:"long",
day:"numeric",
month:"long",
year:"numeric"

});

}

/* =====================================================
   MI NUTRICIÓN V3
   app.js
   Parte 2/4
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

modal.addEventListener("click",(e)=>{

    if(e.target===modal){

        closeModal();

    }

});

cancelGrams.onclick=()=>{

    gramsModal.classList.remove("show");

};

newFoodBtn.onclick=()=>{

    newFoodModal.classList.add("show");

    foodName.value="";
    foodKcal.value="";
    foodProtein.value="";
    foodCarbs.value="";
    foodFat.value="";

    foodName.focus();

};

cancelFood.onclick=()=>{

    newFoodModal.classList.remove("show");

};

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

    const newFood={

        name:foodName.value.trim(),

        brand:foodBrand.value.trim(),

        unit:foodUnit.value.trim() || "g",

        kcal:Number(foodKcal.value),

        protein:Number(foodProtein.value),

        carbs:Number(foodCarbs.value),

        fat:Number(foodFat.value)

    };

    if(!newFood.name){

        alert("Introduce un nombre.");

        return;

    }

    foods.push(newFood);

    localStorage.setItem("foodLibrary",JSON.stringify(foods));

    newFoodModal.classList.remove("show");

    jsonInput.value="";

    foodName.value="";
    foodBrand.value="";
    foodUnit.value="";
    foodKcal.value="";
    foodProtein.value="";
    foodCarbs.value="";
    foodFat.value="";

    renderFoods(search.value);

};

function renderFoods(filter=""){

    foodResults.innerHTML="";

    if(foods.length===0){

        foodResults.innerHTML=`

        <div style="
        padding:40px 20px;
        text-align:center;
        color:#8d97a6;
        ">

        📚<br><br>

        Tu biblioteca está vacía.<br><br>

        Pulsa <strong>➕ Nuevo alimento</strong><br>
        para crear el primero.

        </div>

        `;

        return;

    }

    foods
    .filter(food=>

        food.name
        .toLowerCase()
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

                ${food.kcal} kcal /100 g

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

/* =====================================================
   MI NUTRICIÓN V3
   app.js
   Parte 3/4
===================================================== */

acceptGrams.onclick=()=>{

    let grams=parseFloat(gramsInput.value);

    if(isNaN(grams) || grams<=0) return;

    const factor=grams/100;

    const item={

        name:selectedFoodData.name,

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

    localStorage.setItem("miNutricion",JSON.stringify(meals));

    gramsModal.classList.remove("show");

    search.value="";

    renderFoods();

    search.focus();

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
   MI NUTRICIÓN V3
   app.js
   Parte 4/4
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

<div onclick="editFood('${meal}',${index})" style="flex:1;cursor:pointer;">

<div class="food-name"
onclick="editFood('${meal}',${index})"
style="cursor:pointer;">

${food.name}

</div>

<small
onclick="editFood('${meal}',${index})"
style="color:#999;cursor:pointer;">

${food.grams} g

</small>

</div>

<div style="display:flex;align-items:center;gap:10px;">

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
color:#fff;
font-size:16px;
cursor:pointer;">
🗑️
</button>

</div>

`;

            list.appendChild(item);

        });

        const total=document.createElement("div");

        total.style.cssText="margin-top:12px;padding-top:12px;border-top:1px solid #2b3442;font-weight:600;color:#f4f6fb;display:flex;justify-content:space-between;";

        total.innerHTML=`
<span>Total</span>
<span>${mealTotal} kcal</span>
`;

        list.appendChild(total);

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

}

function removeFood(meal,index){

    meals[meal].splice(index,1);

    renderMeals();

    updateTotals();

    localStorage.setItem("miNutricion",JSON.stringify(meals));

}

const saved=localStorage.getItem("miNutricion");

if(saved){

    Object.assign(meals,JSON.parse(saved));

}

renderMeals();

updateTotals();

renderFoods();

document.getElementById("closeFoodModal").onclick = () => {

    closeModal();

};