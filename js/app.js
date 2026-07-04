/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   PARTE 1/8
========================================================== */

"use strict";

/* ==========================================================
   ESTADO
========================================================== */

const state={

    foods:[],

    settings:{
        kcalGoal:2200
    },

    currentDate:DB.todayKey(),

    meals:DB.emptyDay(),

    currentMeal:null,

    selectedFood:null,

    editingFood:null,

    editingMeal:null,

    editingIndex:null,

    lastScroll:0

};

/* ==========================================================
   SELECTORES
========================================================== */

const $=id=>document.getElementById(id);

const ui={

    greeting:$("greeting"),

    fecha:$("fecha"),

    totalKcal:$("totalKcal"),

    protein:$("protein"),

    carbs:$("carbs"),

    fat:$("fat"),

    ring:$("ringProgress"),

    meals:$("meals"),

    modal:$("modal"),

    searchFood:$("searchFood"),

    foodResults:$("foodResults"),

    gramsModal:$("gramsModal"),

    gramsInput:$("gramsInput"),

    selectedFood:$("selectedFood"),

    newFoodModal:$("newFoodModal"),

    jsonInput:$("jsonInput"),

    jsonStatus:$("jsonStatus"),

    editFoodModal:$("editFoodModal"),

    foodName:$("foodName"),

    foodBrand:$("foodBrand"),

    foodCategory:$("foodCategory"),

    foodBase:$("foodBase"),

    foodUnit:$("foodUnit"),

    foodKcal:$("foodKcal"),

    foodProtein:$("foodProtein"),

    foodCarbs:$("foodCarbs"),

    foodFat:$("foodFat")

};

/* ==========================================================
   CARGA
========================================================== */

async function loadApp(){

    const data=await DB.load();

    state.foods=data.foods;

    state.settings=data.settings;

    state.meals=await DB.getDay(

        state.currentDate

    );

}

/* ==========================================================
   GUARDADO
========================================================== */

async function saveFoods(){

    await DB.saveFoods(

        state.foods

    );

}

async function saveMeals(){

    await DB.saveDay(

        state.currentDate,

        state.meals

    );

}

async function saveSettings(){

    await DB.saveSettings(

        state.settings

    );

}

/* ==========================================================
   UTILIDADES
========================================================== */

function normalize(text){

    return String(text)

    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g,"")

    .toLowerCase()

    .trim();

}

function number(value){

    return Number(

        String(value)

        .replace(",", ".")

    )||0;

}

function createId(){

    return Date.now()

    +

    Math.floor(

        Math.random()*100000

    );

}

function existsFood(name){

    return state.foods.find(food=>

        normalize(food.name)

        ===

        normalize(name)

    );

}

function formatDate(date){

    const text=date.toLocaleDateString(

        "es-ES",

        {

            weekday:"long",

            day:"numeric",

            month:"long",

            year:"numeric"

        }

    );

    return text.charAt(0).toUpperCase()

    +

    text.slice(1);

}

/* ==========================================================
   SCROLL
========================================================== */

function lockScroll(){

    state.lastScroll=window.scrollY;

    document.body.style.position="fixed";

    document.body.style.top=

    `-${state.lastScroll}px`;

    document.body.style.width="100%";

}

function unlockScroll(){

    document.body.style.position="";

    document.body.style.top="";

    document.body.style.width="";

    window.scrollTo(

        0,

        state.lastScroll

    );

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   PARTE 2/8
   Dashboard
========================================================== */

/* ==========================================================
   SALUDO
========================================================== */

function updateGreeting(){

    const hour = new Date().getHours();

    let text = "Buenas noches";

    if(hour >= 6 && hour < 14){

        text = "Buenos días";

    }else if(hour >= 14 && hour < 21){

        text = "Buenas tardes";

    }

    ui.greeting.textContent = text;

}

/* ==========================================================
   FECHA
========================================================== */

function updateDate(){

    ui.fecha.textContent = formatDate(

        new Date(state.currentDate)

    );

}

/* ==========================================================
   TOTALES
========================================================== */

function calculateTotals(){

    const totals={

        kcal:0,

        protein:0,

        carbs:0,

        fat:0

    };

    Object.values(state.meals).forEach(meal=>{

        meal.forEach(food=>{

            totals.kcal+=Number(food.kcal||0);

            totals.protein+=Number(food.protein||0);

            totals.carbs+=Number(food.carbs||0);

            totals.fat+=Number(food.fat||0);

        });

    });

    return totals;

}

/* ==========================================================
   ANILLO
========================================================== */

function updateRing(){

    const totals = calculateTotals();

    const goal = state.settings.kcalGoal || 2200;

    const percent = Math.min(

        (totals.kcal/goal)*100,

        100

    );

    const degrees = percent * 3.6;

    ui.ring.style.setProperty(

        "--progress",

        `${degrees}deg`

    );

    ui.ring.classList.remove(

        "green",

        "yellow",

        "red"

    );

    if(percent < 80){

        ui.ring.classList.add("green");

    }else if(percent < 100){

        ui.ring.classList.add("yellow");

    }else{

        ui.ring.classList.add("red");

    }

}

/* ==========================================================
   DASHBOARD
========================================================== */

function refreshDashboard(){

    const totals = calculateTotals();

    const goal = state.settings.kcalGoal || 2200;

    updateGreeting();

    updateDate();

    updateRing();

    ui.totalKcal.textContent =

        Math.round(totals.kcal);

    ui.protein.textContent =

        `${totals.protein.toFixed(1)} g`;

    ui.carbs.textContent =

        `${totals.carbs.toFixed(1)} g`;

    ui.fat.textContent =

        `${totals.fat.toFixed(1)} g`;

    const label = ui.ring.querySelector("small");

    if(label){

        label.textContent =

            `de ${goal} kcal`;

    }

}

/* ==========================================================
   REFRESCO GENERAL
========================================================== */

function refresh(){

    refreshDashboard();

    renderMeals();

    renderFoods(

        ui.searchFood

            ? ui.searchFood.value

            : ""

    );

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   PARTE 3/8
   Biblioteca de alimentos
========================================================== */

/* ==========================================================
   ABRIR BIBLIOTECA
========================================================== */

function openLibrary(meal){

    state.currentMeal = meal;

    const title = {

        desayuno:"🍳 Desayuno",

        comida:"🍝 Comida",

        merienda:"🥪 Merienda",

        cena:"🌙 Cena"

    };

    $("sheetTitle").textContent = title[meal];

    ui.searchFood.value = "";

    renderFoods();

    lockScroll();

    ui.modal.classList.add("show");

}

/* ==========================================================
   CERRAR BIBLIOTECA
========================================================== */

function closeLibrary(){

    ui.modal.classList.remove("show");

    unlockScroll();

}

/* ==========================================================
   RENDER BIBLIOTECA
========================================================== */

function renderFoods(filter=""){

    if(!ui.foodResults){

        return;

    }

    ui.foodResults.innerHTML="";

    const text = normalize(filter);

    const foods = state.foods

    .filter(food=>

        normalize(food.name).includes(text)

        ||

        normalize(food.brand||"")

        .includes(text)

    )

    .sort((a,b)=>

        a.name.localeCompare(

            b.name,

            "es"

        )

    );

    if(!foods.length){

        ui.foodResults.innerHTML=

        `<p class="emptyMeal">

        No hay alimentos.

        </p>`;

        return;

    }

    foods.forEach(food=>{

        const item=document.createElement("div");

        item.className="food-item fade-in";

        item.innerHTML=`

<div>

<div class="food-name">

${food.emoji||"🍽️"} ${food.name}

</div>

<div class="food-brand">

${food.brand||""}

</div>

<div class="food-kcal">

${food.kcal} kcal · ${food.base}${food.unit}

</div>

</div>

`;

        item.onclick=()=>{

            openGrams(food);

        };

        ui.foodResults.appendChild(item);

    });

}

/* ==========================================================
   BUSCADOR
========================================================== */

ui.searchFood.addEventListener(

    "input",

    ()=>{

        renderFoods(

            ui.searchFood.value

        );

    }

);

/* ==========================================================
   ABRIR NUEVO ALIMENTO
========================================================== */

$("newFoodBtn").onclick=()=>{

    ui.modal.classList.remove("show");

    ui.newFoodModal.classList.add("show");

};

/* ==========================================================
   CERRAR MODAL
========================================================== */

$("closeFoodModal").onclick=

closeLibrary;

ui.modal.onclick=e=>{

    if(e.target===ui.modal){

        closeLibrary();

    }

};

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   PARTE 4/8
   Comidas
========================================================== */

/* ==========================================================
   ABRIR CANTIDAD
========================================================== */

function openGrams(food){

    state.selectedFood = food;

    ui.selectedFood.textContent =

        `${food.emoji || "🍽️"} ${food.name}`;

    ui.gramsInput.value =

        food.base || 100;

    ui.newFoodModal.classList.remove("show");

    lockScroll();

    ui.gramsModal.classList.add("show");

    setTimeout(()=>{

        ui.gramsInput.focus();

        ui.gramsInput.select();

    },150);

}

/* ==========================================================
   CERRAR CANTIDAD
========================================================== */

function closeGrams(){

    ui.gramsModal.classList.remove("show");

    unlockScroll();

}

/* ==========================================================
   CREAR ALIMENTO
========================================================== */

function buildMealFood(food,grams){

    const factor =

        grams / (food.base || 100);

    return{

        id:createId(),

        foodId:food.id,

        emoji:food.emoji || "🍽️",

        name:food.name,

        brand:food.brand || "",

        category:food.category || "Otros",

        grams,

        unit:food.unit || "g",

        base:food.base || 100,

        kcal:Math.round(

            food.kcal * factor

        ),

        protein:Number(

            (food.protein * factor)

            .toFixed(1)

        ),

        carbs:Number(

            (food.carbs * factor)

            .toFixed(1)

        ),

        fat:Number(

            (food.fat * factor)

            .toFixed(1)

        )

    };

}

/* ==========================================================
   AÑADIR ALIMENTO
========================================================== */

async function addFoodToMeal(){

    if(!state.selectedFood){

        return;

    }

    const grams =

        number(

            ui.gramsInput.value

        );

    if(grams<=0){

        alert(

            "Cantidad no válida."

        );

        return;

    }

    const item = buildMealFood(

        state.selectedFood,

        grams

    );

    state.meals

        [state.currentMeal]

        .push(item);

    await saveMeals();

    refresh();

    closeGrams();

    closeLibrary();

}

/* ==========================================================
   RENDER COMIDAS
========================================================== */

function renderMeals(){

    document

    .querySelectorAll(".meal")

    .forEach(card=>{

        const meal =

            card.dataset.meal;

        const preview =

            card.querySelector(

                ".meal-preview"

            );

        const empty =

            card.querySelector(

                ".emptyMeal"

            );

        const total =

            card.querySelector(

                ".meal-total"

            );

        preview.innerHTML = "";

        const foods =

            state.meals[meal];

        if(!foods.length){

            empty.style.display="block";

            total.textContent="0 kcal";

            return;

        }

        empty.style.display="none";

        let kcal = 0;

        foods.forEach((food,index)=>{

            kcal += food.kcal;

            if(index<3){

                const row =

                    document.createElement(

                        "div"

                    );

                row.className=

                    "preview-item";

                row.innerHTML=`

<span>

${food.name}

</span>

<span>

${food.kcal} kcal

</span>

`;

                preview.appendChild(

                    row

                );

            }

        });

        if(foods.length>3){

            const more =

                document.createElement(

                    "div"

                );

            more.className=

                "more-foods";

            more.textContent=

                `+${foods.length-3} más`;

            preview.appendChild(

                more

            );

        }

        total.innerHTML=

        `<strong>${Math.round(kcal)} kcal</strong>`;

    });

}

/* ==========================================================
   EVENTOS
========================================================== */

document

.querySelectorAll(".meal")

.forEach(card=>{

    card.onclick=()=>{

        openLibrary(

            card.dataset.meal

        );

    };

});

$("acceptGrams").onclick =

    addFoodToMeal;

$("cancelGrams").onclick =

    closeGrams;

ui.gramsModal.onclick=e=>{

    if(e.target===ui.gramsModal){

        closeGrams();

    }

};

ui.gramsInput.addEventListener(

    "keydown",

    e=>{

        if(e.key==="Enter"){

            addFoodToMeal();

        }

    }

);

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   PARTE 5/8
   Editor de alimentos
========================================================== */

/* ==========================================================
   NUEVO ALIMENTO
========================================================== */

function newFood(){

    state.editingFood = null;

    ui.foodName.value = "";

    ui.foodBrand.value = "";

    ui.foodCategory.value = "";

    ui.foodBase.value = 100;

    ui.foodUnit.value = "g";

    ui.foodKcal.value = "";

    ui.foodProtein.value = "";

    ui.foodCarbs.value = "";

    ui.foodFat.value = "";

    ui.newFoodModal.classList.remove("show");

    lockScroll();

    ui.editFoodModal.classList.add("show");

}

/* ==========================================================
   EDITAR
========================================================== */

function editFood(food){

    state.editingFood = food;

    ui.foodName.value = food.name;

    ui.foodBrand.value = food.brand || "";

    ui.foodCategory.value = food.category || "";

    ui.foodBase.value = food.base || 100;

    ui.foodUnit.value = food.unit || "g";

    ui.foodKcal.value = food.kcal || 0;

    ui.foodProtein.value = food.protein || 0;

    ui.foodCarbs.value = food.carbs || 0;

    ui.foodFat.value = food.fat || 0;

    lockScroll();

    ui.editFoodModal.classList.add("show");

}

/* ==========================================================
   CERRAR EDITOR
========================================================== */

function closeEditFood(){

    ui.editFoodModal.classList.remove("show");

    unlockScroll();

}

/* ==========================================================
   GUARDAR
========================================================== */

async function saveEditedFood(){

    const food={

        id:state.editingFood
            ? state.editingFood.id
            : createId(),

        emoji:state.editingFood?.emoji || "🍽️",

        name:ui.foodName.value.trim(),

        brand:ui.foodBrand.value.trim(),

        category:ui.foodCategory.value.trim(),

        base:number(ui.foodBase.value),

        unit:ui.foodUnit.value.trim(),

        kcal:number(ui.foodKcal.value),

        protein:number(ui.foodProtein.value),

        carbs:number(ui.foodCarbs.value),

        fat:number(ui.foodFat.value)

    };

    if(!food.name){

        alert("Introduce un nombre.");

        return;

    }

    const index = state.foods.findIndex(

        f=>f.id===food.id

    );

    if(index===-1){

        state.foods.push(food);

    }else{

        state.foods[index]=food;

    }

    await saveFoods();

    renderFoods();

    closeEditFood();

}

/* ==========================================================
   ELIMINAR
========================================================== */

async function deleteFood(id){

    if(!confirm("¿Eliminar alimento?")){

        return;

    }

    state.foods = state.foods.filter(

        food=>food.id!==id

    );

    await saveFoods();

    renderFoods();

}

/* ==========================================================
   BOTONES
========================================================== */

$("newFoodBtn").onclick = newFood;

$("saveEditFood").onclick =

    saveEditedFood;

$("cancelEditFood").onclick =

    closeEditFood;

ui.editFoodModal.onclick=e=>{

    if(e.target===ui.editFoodModal){

        closeEditFood();

    }

};

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   PARTE 6/8
   Importación desde ChatGPT / JSON
========================================================== */

/* ==========================================================
   DETECTAR FORMATO
========================================================== */

function detectImport(text){

    text = text.trim();

    if(!text){

        return "empty";

    }

    try{

        JSON.parse(text);

        return "json";

    }

    catch{}

    return "text";

}

/* ==========================================================
   IMPORTAR JSON
========================================================== */

async function importJSON(text){

    const food = JSON.parse(text);

    if(!food.id){

        food.id = createId();

    }

    const exists = state.foods.find(

        f=>normalize(f.name)===normalize(food.name)

    );

    if(exists){

        Object.assign(exists,food);

    }

    else{

        state.foods.push(food);

    }

    await saveFoods();

}

/* ==========================================================
   IMPORTAR TEXTO CHATGPT
========================================================== */

async function importChatGPT(text){

    text = text
        .replace(/```/g,"")
        .replace(/\r/g,"")
        .trim();

    const food = {

        id:createId(),

        emoji:"🍽️",

        name:"",

        brand:"",

        category:"Otros",

        base:100,

        unit:"g",

        kcal:0,

        protein:0,

        carbs:0,

        fat:0

    };

    const lines = text
        .split("\n")
        .map(l=>l.trim())
        .filter(Boolean);

    if(lines.length){

        food.name = lines[0];
    }

    for(const line of lines){

        const value = line.match(/(\d+[.,]?\d*)/);

        if(!value) continue;

        const n = number(value[1]);

        if(/energ|kcal|calor/i.test(line)){

            food.kcal = n;
            continue;

        }

        if(/prote/i.test(line)){

            food.protein = n;
            continue;

        }

        if(/hidr|carbo|hc/i.test(line)){

            food.carbs = n;
            continue;

        }

        if(/gras/i.test(line)){

            food.fat = n;
            continue;

        }

        if(/100\s*ml/i.test(line)){

            food.base = 100;
            food.unit = "ml";
            continue;

        }

        if(/100\s*g/i.test(line)){

            food.base = 100;
            food.unit = "g";
            continue;

        }

    }

    if(!food.name){

        alert("No se ha podido detectar el nombre del alimento.");

        return;

    }

    const existing = state.foods.find(f=>

        normalize(f.name)===normalize(food.name)

    );

    if(existing){

        Object.assign(existing,food);

    }else{

        state.foods.push(food);

    }

    await saveFoods();

    renderFoods();

    alert(`✅ ${food.name} añadido correctamente.`);

}

/* ==========================================================
   IMPORTAR
========================================================== */

async function importFood(){

    const text=

        ui.jsonInput.value.trim();

    const type=

        detectImport(text);

    if(type==="empty"){

        alert("No hay datos.");

        return;

    }

    if(type==="json"){

        await importJSON(text);

    }

    else{

        await importChatGPT(text);

    }

    ui.jsonInput.value="";

    ui.newFoodModal.classList.remove("show");

    renderFoods();

}

/* ==========================================================
   BOTONES
========================================================== */

$("saveFood").onclick=

    importFood;

$("cancelFood").onclick=()=>{

    ui.newFoodModal.classList.remove("show");

};

$("pasteFoodBtn").onclick=()=>{

    ui.jsonInput.focus();

};

$("manualFoodBtn").onclick=()=>{

    ui.newFoodModal.classList.remove("show");

    newFood();

};

$("jsonFoodBtn").onclick=()=>{

    ui.jsonInput.focus();

};

ui.newFoodModal.onclick=e=>{

    if(e.target===ui.newFoodModal){

        ui.newFoodModal.classList.remove("show");

    }

};

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   PARTE 7/8
   Resumen + Eventos + Inicialización
========================================================== */

/* ==========================================================
   RESUMEN
========================================================== */

function buildSummary(){

    const totals = calculateTotals();

    let text =

`${formatDate(new Date(state.currentDate))}

Calorías: ${Math.round(totals.kcal)} / ${state.settings.kcalGoal} kcal

Proteínas: ${totals.protein.toFixed(1)} g
Hidratos: ${totals.carbs.toFixed(1)} g
Grasas: ${totals.fat.toFixed(1)} g`;

    Object.keys(state.meals).forEach(meal=>{

        if(!state.meals[meal].length){

            return;

        }

        text += `\n\n${meal.toUpperCase()}\n`;

        state.meals[meal].forEach(food=>{

            text +=

`• ${food.name} (${food.grams}${food.unit}) - ${food.kcal} kcal\n`;

        });

    });

    return text;

}

/* ==========================================================
   COPIAR RESUMEN
========================================================== */

async function copySummary(){

    try{

        await navigator.clipboard.writeText(

            buildSummary()

        );

        alert("Resumen copiado.");

    }

    catch{

        alert("No se pudo copiar.");

    }

}

/* ==========================================================
   EXPORTAR
========================================================== */

async function exportData(){

    const backup =

        await DB.exportBackup();

    const blob = new Blob(

        [

            JSON.stringify(

                backup,

                null,

                2

            )

        ],

        {

            type:"application/json"

        }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download =

        `MiNutricion-${state.currentDate}.json`;

    a.click();

    URL.revokeObjectURL(url);

}

/* ==========================================================
   IMPORTAR COPIA
========================================================== */

async function importBackup(file){

    const text = await file.text();

    const json = JSON.parse(text);

    await DB.importBackup(json);

    await loadApp();

    refresh();

}

/* ==========================================================
   EVENTOS
========================================================== */

ui.ring.onclick = copySummary;

window.addEventListener(

    "keydown",

    e=>{

        if(e.key==="Escape"){

            closeLibrary();

            closeGrams();

            closeEditFood();

        }

    }

);

setInterval(

    ()=>{

        updateGreeting();

        updateDate();

    },

    60000

);

/* ==========================================================
   INICIO
========================================================== */

async function init(){

    await loadApp();

    refresh();

    console.log(

        "%cMi Nutrición NEXT",

        "color:#34c759;font-size:18px;font-weight:bold;"

    );

}

document.addEventListener(

    "DOMContentLoaded",

    init

);

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   PARTE 8/8
   Historial + Sincronización + API
========================================================== */

/* ==========================================================
   CAMBIAR DE DÍA
========================================================== */

async function loadDay(date){

    state.currentDate = date;

    state.meals = await DB.getDay(date);

    refresh();

}

/* ==========================================================
   IR A HOY
========================================================== */

async function goToday(){

    await loadDay(

        DB.todayKey()

    );

}

/* ==========================================================
   REINICIAR DÍA
========================================================== */

async function clearCurrentDay(){

    if(

        !confirm(

            "¿Eliminar todas las comidas de hoy?"

        )

    ){

        return;

    }

    state.meals = DB.emptyDay();

    await saveMeals();

    refresh();

}

/* ==========================================================
   RECALCULAR COMIDAS
========================================================== */

async function recalculateMeals(){

    Object.keys(state.meals).forEach(meal=>{

        state.meals[meal].forEach(item=>{

            const food = state.foods.find(

                f=>f.id===item.foodId

            );

            if(!food){

                return;

            }

            const factor =

                item.grams /

                (food.base || 100);

            item.name = food.name;

            item.brand = food.brand;

            item.category = food.category;

            item.unit = food.unit;

            item.base = food.base;

            item.emoji = food.emoji;

            item.kcal = Math.round(

                food.kcal * factor

            );

            item.protein = Number(

                (food.protein * factor)

                .toFixed(1)

            );

            item.carbs = Number(

                (food.carbs * factor)

                .toFixed(1)

            );

            item.fat = Number(

                (food.fat * factor)

                .toFixed(1)

            );

        });

    });

    await saveMeals();

    refresh();

}

/* ==========================================================
   SINCRONIZAR
========================================================== */

async function sync(){

    const data = await DB.load();

    state.foods = data.foods;

    state.settings = data.settings;

    state.meals = await DB.getDay(

        state.currentDate

    );

    refresh();

}

/* ==========================================================
   API PÚBLICA
========================================================== */

window.miNutricion={

    state,

    refresh,

    loadDay,

    goToday,

    sync,

    buildSummary,

    copySummary,

    exportData,

    clearCurrentDay,

    recalculateMeals

};

/* ==========================================================
   CAMBIOS EN OTRAS PESTAÑAS
========================================================== */

window.addEventListener(

    "storage",

    sync

);

/* ==========================================================
   INFORMACIÓN
========================================================== */

console.table({

    Aplicacion:"Mi Nutrición NEXT",

    Version:"5.0",

    Fecha:state.currentDate

});

console.log(

    "%cAplicación lista",

    "color:#34c759;font-size:18px;font-weight:bold;"

);

/* ==========================================================
   FIN DEL ARCHIVO
========================================================== */