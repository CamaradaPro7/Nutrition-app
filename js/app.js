/* =====================================================
   MI NUTRICIÓN V2.1
   app.js
   Parte 1/8
===================================================== */

/* ===========================
   BIBLIOTECA DE ALIMENTOS
=========================== */

let foods = JSON.parse(
    localStorage.getItem("foodLibrary")
) || [];

/* ===========================
   COMIDAS
=========================== */

const meals = JSON.parse(
    localStorage.getItem("miNutricion")
) || {

    desayuno:[],
    comida:[],
    merienda:[],
    cena:[]

};

/* ===========================
   ESTADO
=========================== */

let currentMeal = null;
let selectedFood = null;

let editingMeal = null;
let editingIndex = null;

/* ===========================
   MODALES
=========================== */

const modal =
document.getElementById("modal");

const gramsModal =
document.getElementById("gramsModal");

const newFoodModal =
document.getElementById("newFoodModal");

/* ===========================
   BUSCADOR
=========================== */

const search =
document.getElementById("searchFood");

const foodResults =
document.getElementById("foodResults");

/* ===========================
   MODAL GRAMOS
=========================== */

const gramsInput =
document.getElementById("gramsInput");

const selectedFoodLabel =
document.getElementById("selectedFood");

const acceptGrams =
document.getElementById("acceptGrams");

const cancelGrams =
document.getElementById("cancelGrams");

/* ===========================
   NUEVO ALIMENTO
=========================== */

const jsonInput =
document.getElementById("jsonInput");

const importJsonBtn =
document.getElementById("importJsonBtn");

const newFoodBtn =
document.getElementById("newFoodBtn");

const cancelFood =
document.getElementById("cancelFood");

const saveFood =
document.getElementById("saveFood");

const foodName =
document.getElementById("foodName");

const foodBrand =
document.getElementById("foodBrand");

const foodUnit =
document.getElementById("foodUnit");

const foodKcal =
document.getElementById("foodKcal");

const foodProtein =
document.getElementById("foodProtein");

const foodCarbs =
document.getElementById("foodCarbs");

const foodFat =
document.getElementById("foodFat");

/* ===========================
   DASHBOARD
=========================== */

const totalKcal =
document.getElementById("totalKcal");

const protein =
document.getElementById("protein");

const carbs =
document.getElementById("carbs");

const fat =
document.getElementById("fat");

/* ===========================
   FECHA
=========================== */

const fecha =
document.getElementById("fecha");

if(fecha){

    fecha.textContent =
    new Date().toLocaleDateString(

        "es-ES",

        {

            weekday:"long",
            day:"numeric",
            month:"long",
            year:"numeric"

        }

    );

}

/* =====================================================
   MI NUTRICIÓN V2.1
   app.js
   Parte 2/8
===================================================== */

/* ===========================
   GUARDAR DATOS
=========================== */

function saveFoods(){

    localStorage.setItem(

        "foodLibrary",

        JSON.stringify(foods)

    );

}

function saveMeals(){

    localStorage.setItem(

        "miNutricion",

        JSON.stringify(meals)

    );

}

/* ===========================
   MODALES
=========================== */

function openMeal(meal){

    currentMeal = meal;

    search.value = "";

    renderFoods();

    modal.classList.add("show");

    search.focus();

}

function closeMeal(){

    modal.classList.remove("show");

}

function openNewFood(){

    jsonInput.value = "";

    foodName.value = "";
    foodBrand.value = "";
    foodUnit.value = "g";

    foodKcal.value = "";
    foodProtein.value = "";
    foodCarbs.value = "";
    foodFat.value = "";

    newFoodModal.classList.add("show");

}

function closeNewFood(){

    newFoodModal.classList.remove("show");

}

function openGrams(food){

    selectedFood = food;

    selectedFoodLabel.textContent = food.name;

    gramsInput.value = 100;

    gramsModal.classList.add("show");

    gramsInput.focus();

}

function closeGrams(){

    gramsModal.classList.remove("show");

}

/* ===========================
   EVENTOS MODALES
=========================== */

document
.getElementById("closeFoodModal")
.onclick = closeMeal;

newFoodBtn.onclick = openNewFood;

cancelFood.onclick = closeNewFood;

cancelGrams.onclick = closeGrams;

modal.onclick = e=>{

    if(e.target===modal){

        closeMeal();

    }

};

gramsModal.onclick = e=>{

    if(e.target===gramsModal){

        closeGrams();

    }

};

newFoodModal.onclick = e=>{

    if(e.target===newFoodModal){

        closeNewFood();

    }

};

document
.querySelectorAll(".add")
.forEach((btn,index)=>{

    const ids=[

        "desayuno",
        "comida",
        "merienda",
        "cena"

    ];

    btn.onclick=()=>{

        openMeal(ids[index]);

    };

});

/* =====================================================
   MI NUTRICIÓN V2.1
   app.js
   Parte 3/8
===================================================== */

/* ===========================
   IMPORTAR JSON
=========================== */

importJsonBtn.onclick = () => {

    const texto = jsonInput.value.trim();

    if(texto === ""){

        alert("Pega primero el JSON.");

        return;

    }

    try{

        const data = JSON.parse(texto);

        foodName.value = data.nombre || "";
        foodBrand.value = data.marca || "";
        foodUnit.value = data.unidad || "g";

        foodKcal.value = parseFloat(data.kcal) || 0;
        foodProtein.value = parseFloat(data.proteinas) || 0;
        foodCarbs.value = parseFloat(data.hidratos) || 0;
        foodFat.value = parseFloat(data.grasas) || 0;

    }catch(error){

        console.error(error);
        alert(error.message);

    }

};

/* ===========================
   GUARDAR ALIMENTO
=========================== */

saveFood.onclick=()=>{

    if(foodName.value.trim()===""){

        alert("Introduce un nombre.");

        return;

    }

    const food={

        id:Date.now(),

        name:foodName.value.trim(),

        brand:foodBrand.value.trim(),

        unit:foodUnit.value.trim() || "g",

        kcal:Number(foodKcal.value),

        protein:Number(foodProtein.value),

        carbs:Number(foodCarbs.value),

        fat:Number(foodFat.value)

    };

    foods.push(food);

    saveFoods();

    closeNewFood();

    renderFoods(search.value);

};

/* ===========================
   BUSCADOR
=========================== */

search.oninput=()=>{

    renderFoods(search.value);

};

/* =====================================================
   MI NUTRICIÓN V2.1
   app.js
   Parte 4/8
===================================================== */

/* ===========================
   RENDER BIBLIOTECA
=========================== */

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
        padding:40px 20px;
        text-align:center;
        color:#8d97a6;
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

            editingMeal=null;
            editingIndex=null;

            openGrams(food);

        };

        foodResults.appendChild(item);

    });

}

/* =====================================================
   MI NUTRICIÓN V2.1
   app.js
   Parte 5/8
===================================================== */

/* ===========================
   AÑADIR ALIMENTO
=========================== */

acceptGrams.onclick=()=>{

    const grams=parseFloat(gramsInput.value);

    if(isNaN(grams) || grams<=0){

        alert("Introduce una cantidad válida.");

        return;

    }

    const factor=grams/100;

    const item={

        id:Date.now(),

        name:selectedFood.name,

        brand:selectedFood.brand,

        unit:selectedFood.unit,

        grams:grams,

        kcal:Math.round(selectedFood.kcal*factor),

        protein:Number((selectedFood.protein*factor).toFixed(1)),

        carbs:Number((selectedFood.carbs*factor).toFixed(1)),

        fat:Number((selectedFood.fat*factor).toFixed(1))

    };

    if(editingMeal!==null){

        meals[editingMeal][editingIndex]=item;

        editingMeal=null;
        editingIndex=null;

    }else{

        meals[currentMeal].push(item);

    }

    saveMeals();

    renderMeals();

    updateTotals();

    closeGrams();

};

/* ===========================
   EDITAR ALIMENTO
=========================== */

function editFood(meal,index){

    const item=meals[meal][index];

    const original=foods.find(f=>f.name===item.name);

    if(!original){

        alert("El alimento ya no existe en la biblioteca.");

        return;

    }

    editingMeal=meal;
    editingIndex=index;

    openGrams(original);

}

/* =====================================================
   MI NUTRICIÓN V2.1
   app.js
   Parte 6/8
===================================================== */

/* ===========================
   RENDER COMIDAS
=========================== */

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
cursor:pointer;">

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

<span>Total</span>

<span>${mealTotal} kcal</span>

`;

        list.appendChild(total);

    });

}

/* =====================================================
   MI NUTRICIÓN V2.1
   app.js
   Parte 7/8
===================================================== */

/* ===========================
   TOTALES
=========================== */

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

    totalKcal=Math.round(totalKcal);

    totalProtein=Math.round(totalProtein*10)/10;
    totalCarbs=Math.round(totalCarbs*10)/10;
    totalFat=Math.round(totalFat*10)/10;

    document.getElementById("totalKcal").textContent=totalKcal;

    document.getElementById("protein").textContent=
        totalProtein+" g";

    document.getElementById("carbs").textContent=
        totalCarbs+" g";

    document.getElementById("fat").textContent=
        totalFat+" g";

}

/* ===========================
   ELIMINAR ALIMENTO
=========================== */

function removeFood(meal,index){

    if(!confirm("¿Eliminar alimento?")) return;

    meals[meal].splice(index,1);

    saveMeals();

    renderMeals();

    updateTotals();

}

/* =====================================================
   MI NUTRICIÓN V2.1
   app.js
   Parte 8/8
===================================================== */

/* ===========================
   INICIALIZACIÓN
=========================== */

renderFoods();

renderMeals();

updateTotals();

/* ===========================
   ATAJOS DE TECLADO
=========================== */

gramsInput.addEventListener("keydown",e=>{

    if(e.key==="Enter"){

        acceptGrams.click();

    }

});

search.addEventListener("keydown",e=>{

    if(e.key==="Escape"){

        closeMeal();

    }

});

jsonInput.addEventListener("keydown",e=>{

    if(e.key==="Escape"){

        closeNewFood();

    }

});

/* ===========================
   CERRAR MODALES
=========================== */

window.addEventListener("keydown",e=>{

    if(e.key!=="Escape") return;

    closeMeal();

    closeGrams();

    closeNewFood();

});

console.log(

    "%c🍎 Mi Nutrición V2.1",

    "color:#38d46a;font-size:16px;font-weight:bold;"

);

console.log(

    "Biblioteca:",foods.length,

    "Comidas:",

    Object.values(meals).flat().length

);