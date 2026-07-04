/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   PARTE 1/8
========================================================== */

"use strict";

/* ==========================================================
   ESTADO
========================================================== */

const state = {

    foods: [],

    settings: {

        kcalGoal: 2200

    },

    currentDate: DB.todayKey(),

    meals: DB.emptyDay(),

    currentMeal: null,

    selectedFood: null,

    editingFood: null,

    editingMeal: null,

    editingIndex: null,

    lastScroll: 0

};

/* ==========================================================
   SELECTORES
========================================================== */

const $ = id => document.getElementById(id);

const ui = {

    greeting: $("greeting"),

    fecha: $("fecha"),

    totalKcal: $("totalKcal"),

    protein: $("protein"),

    carbs: $("carbs"),

    fat: $("fat"),

    ring: $("ringProgress"),

    meals: $("meals"),

    modal: $("modal"),

    searchFood: $("searchFood"),

    foodResults: $("foodResults"),

    gramsModal: $("gramsModal"),

    gramsInput: $("gramsInput"),

    selectedFood: $("selectedFood"),

    newFoodModal: $("newFoodModal"),

    jsonInput: $("jsonInput"),

    jsonStatus: $("jsonStatus"),

    editFoodModal: $("editFoodModal"),

    foodName: $("foodName"),

    foodBrand: $("foodBrand"),

    foodCategory: $("foodCategory"),

    foodBase: $("foodBase"),

    foodUnit: $("foodUnit"),

    foodKcal: $("foodKcal"),

    foodProtein: $("foodProtein"),

    foodCarbs: $("foodCarbs"),

    foodFat: $("foodFat")

};

/* ==========================================================
   CARGA
========================================================== */

async function loadApp(){

    const data = await DB.load();

    state.foods = data.foods;

    state.settings = data.settings;

    state.meals = await DB.getDay(

        state.currentDate

    );

}

/* ==========================================================
   GUARDADO
========================================================== */

async function saveMeals(){

    await DB.saveDay(

        state.currentDate,

        state.meals

    );

}

async function saveFoods(){

    await DB.saveFoods(

        state.foods

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

    ) || 0;

}

function createId(){

    return Date.now() +

        Math.floor(

            Math.random()*100000

        );

}

function existsFood(name){

    return state.foods.find(food=>

        normalize(food.name)===

        normalize(name)

    );

}

function formatDate(date){

    const text = date.toLocaleDateString(

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

    state.lastScroll = window.scrollY;

    document.body.style.position = "fixed";

    document.body.style.top =

        `-${state.lastScroll}px`;

    document.body.style.width = "100%";

}

function unlockScroll(){

    document.body.style.position = "";

    document.body.style.top = "";

    document.body.style.width = "";

    window.scrollTo(

        0,

        state.lastScroll

    );

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

console.clear();

console.log(

    "%c🍎 Mi Nutrición NEXT",

    "color:#38d46a;font-size:18px;font-weight:bold;"

);

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

    let greeting = "Buenas noches";

    if(hour >= 6 && hour < 14){

        greeting = "Buenos días";

    }else if(hour >= 14 && hour < 21){

        greeting = "Buenas tardes";

    }

    ui.greeting.textContent = greeting;

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

    const totals = {

        kcal:0,

        protein:0,

        carbs:0,

        fat:0

    };

    Object.values(state.meals)

        .forEach(meal=>{

            meal.forEach(food=>{

                totals.kcal += Number(food.kcal || 0);

                totals.protein += Number(food.protein || 0);

                totals.carbs += Number(food.carbs || 0);

                totals.fat += Number(food.fat || 0);

            });

        });

    return totals;

}

/* ==========================================================
   ANILLO
========================================================== */

function updateRing(percent){

    if(!ui.ring){

        return;

    }

    const progress = Math.max(

        0,

        Math.min(percent,100)

    );

    const degrees = progress * 3.6;

    ui.ring.style.setProperty(

        "--progress",

        `${degrees}deg`

    );

    ui.ring.classList.remove(

        "green",

        "yellow",

        "orange",

        "red"

    );

    let color = "green";

    if(progress >= 100){

        color = "red";

    }else if(progress >= 80){

        color = "yellow";

    }

    ui.ring.classList.add(color);

}

/* ==========================================================
   DASHBOARD
========================================================== */

function updateDashboard(){

    const totals = calculateTotals();

    const goal =

        Number(state.settings.kcalGoal)

        ||

        2200;

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

        label.textContent = `de ${goal} kcal`;

    }

    updateRing(

        (totals.kcal / goal) * 100

    );

}

/* ==========================================================
   CALORÍAS RESTANTES
========================================================== */

function caloriesRemaining(){

    return Math.max(

        0,

        (state.settings.kcalGoal || 2200)

        -

        calculateTotals().kcal

    );

}

/* ==========================================================
   REFRESCAR DASHBOARD
========================================================== */

function refreshDashboard(){

    updateGreeting();

    updateDate();

    updateDashboard();

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
   RENDER
========================================================== */

function renderFoods(filter = ""){

    ui.foodResults.innerHTML = "";

    const text = normalize(filter);

    const list = state.foods

        .filter(food=>{

            return (

                normalize(food.name).includes(text) ||

                normalize(food.brand || "").includes(text) ||

                normalize(food.category || "").includes(text)

            );

        })

        .sort((a,b)=>

            a.name.localeCompare(

                b.name,

                "es"

            )

        );

    if(list.length === 0){

        ui.foodResults.innerHTML = `

<div class="empty-library">

No hay alimentos

</div>

`;

        return;

    }

    list.forEach(food=>{

        const row = document.createElement("div");

        row.className = "food-item fade-in";

        row.innerHTML = `

<div class="food-info">

<div class="food-name">

${food.emoji || "🍽️"} ${food.name}

</div>

<div class="food-brand">

${food.brand || ""}

</div>

<div class="food-kcal">

${food.kcal} kcal / ${food.base}${food.unit}

</div>

</div>

<div class="food-actions">

<button
class="icon-btn"
data-action="edit">

✏️

</button>

<button
class="icon-btn delete"
data-action="delete">

🗑️

</button>

</div>

`;

        row.querySelector('[data-action="edit"]')
            .onclick = e=>{

                e.stopPropagation();

                openEditFood(food);

            };

        row.querySelector('[data-action="delete"]')
            .onclick = async e=>{

                e.stopPropagation();

                await deleteFood(food.id);

            };

        row.onclick = ()=>{

            openGrams(food);

        };

        ui.foodResults.appendChild(row);

    });

}

/* ==========================================================
   ELIMINAR
========================================================== */

async function deleteFood(id){

    const food = state.foods.find(

        f=>f.id===id

    );

    if(!food){

        return;

    }

    if(

        !confirm(

            `¿Eliminar "${food.name}"?`

        )

    ){

        return;

    }

    state.foods = state.foods.filter(

        f=>f.id!==id

    );

    await saveFoods();

    renderFoods(

        ui.searchFood.value

    );

}

/* ==========================================================
   NUEVO ALIMENTO
========================================================== */

function newFood(){

    state.editingFood = null;

    ui.foodName.value = "";

    ui.foodBrand.value = "";

    ui.foodCategory.value = "Otros";

    ui.foodBase.value = 100;

    ui.foodUnit.value = "g";

    ui.foodKcal.value = "";

    ui.foodProtein.value = "";

    ui.foodCarbs.value = "";

    ui.foodFat.value = "";

    lockScroll();

    ui.editFoodModal.classList.add(

        "show"

    );

}

/* ==========================================================
   EDITAR
========================================================== */

function openEditFood(food){

    state.editingFood = food;

    ui.foodName.value = food.name;

    ui.foodBrand.value = food.brand || "";

    ui.foodCategory.value =

        food.category || "Otros";

    ui.foodBase.value =

        food.base || 100;

    ui.foodUnit.value =

        food.unit || "g";

    ui.foodKcal.value =

        food.kcal || 0;

    ui.foodProtein.value =

        food.protein || 0;

    ui.foodCarbs.value =

        food.carbs || 0;

    ui.foodFat.value =

        food.fat || 0;

    lockScroll();

    ui.editFoodModal.classList.add(

        "show"

    );

}

/* ==========================================================
   CERRAR EDITOR
========================================================== */

function closeEditFood(){

    ui.editFoodModal.classList.remove(

        "show"

    );

    unlockScroll();

}

/* ==========================================================
   BUSCADOR
========================================================== */

if(ui.searchFood){

    ui.searchFood.addEventListener(

        "input",

        ()=>{

            renderFoods(

                ui.searchFood.value

            );

        }

    );

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   PARTE 4/8
   Gestión de comidas
========================================================== */

/* ==========================================================
   ABRIR MODAL DE CANTIDAD
========================================================== */

function openGrams(food){

    state.selectedFood = food;

    ui.selectedFood.textContent =

        `${food.emoji || "🍽️"} ${food.name}`;

    ui.gramsInput.value =

        food.base || 100;

    lockScroll();

    ui.gramsModal.classList.add("show");

    setTimeout(()=>{

        ui.gramsInput.focus();

        ui.gramsInput.select();

    },200);

}

/* ==========================================================
   CERRAR MODAL
========================================================== */

function closeGrams(){

    ui.gramsModal.classList.remove("show");

    unlockScroll();

}

/* ==========================================================
   CALCULAR ALIMENTO
========================================================== */

function buildMealFood(food, grams){

    const factor = grams / (food.base || 100);

    return {

        id: createId(),

        foodId: food.id,

        emoji: food.emoji || "🍽️",

        name: food.name,

        brand: food.brand || "",

        category: food.category || "Otros",

        unit: food.unit || "g",

        base: food.base || 100,

        grams,

        kcal: Math.round(food.kcal * factor),

        protein: Number(

            (food.protein * factor).toFixed(1)

        ),

        carbs: Number(

            (food.carbs * factor).toFixed(1)

        ),

        fat: Number(

            (food.fat * factor).toFixed(1)

        )

    };

}

/* ==========================================================
   GUARDAR ALIMENTO
========================================================== */

async function saveMealFood(){

    if(!state.selectedFood){

        return;

    }

    const grams = number(

        ui.gramsInput.value

    );

    if(grams <= 0){

        alert("Cantidad no válida.");

        return;

    }

    const item = buildMealFood(

        state.selectedFood,

        grams

    );

    if(state.editingMeal !== null){

        state.meals[state.editingMeal]

            [state.editingIndex] = item;

        state.editingMeal = null;

        state.editingIndex = null;

    }else{

        state.meals[state.currentMeal]

            .push(item);

    }

    await saveMeals();

    renderMeals();

    refreshDashboard();

    closeGrams();

}

/* ==========================================================
   EDITAR ALIMENTO
========================================================== */

function editMealFood(meal,index){

    const item =

        state.meals[meal][index];

    const original =

        state.foods.find(

            f=>f.id===item.foodId

        );

    if(!original){

        alert(

            "El alimento ya no existe en la biblioteca."

        );

        return;

    }

    state.editingMeal = meal;

    state.editingIndex = index;

    openGrams(original);

}

/* ==========================================================
   ELIMINAR ALIMENTO
========================================================== */

async function removeMealFood(meal,index){

    if(!confirm("¿Eliminar alimento?")){

        return;

    }

    state.meals[meal].splice(index,1);

    await saveMeals();

    renderMeals();

    refreshDashboard();

}

/* ==========================================================
   RENDER COMIDAS
========================================================== */

function renderMeals(){

    Object.keys(state.meals).forEach(meal=>{

        const card = document.querySelector(

            `[data-meal="${meal}"]`

        );

        if(!card){

            return;

        }

        const list =

            card.querySelector(".meal-list");

        const empty =

            card.querySelector(".emptyMeal");

        list.innerHTML = "";

        const foods = state.meals[meal];

        if(foods.length === 0){

            empty.style.display = "block";

            return;

        }

        empty.style.display = "none";

        let total = 0;

        foods.forEach((food,index)=>{

            total += food.kcal;

            const row =

                document.createElement("div");

            row.className =

                "food-item fade-in";

            row.innerHTML = `

<div class="food-info">

<div class="food-name">

${food.emoji} ${food.name}

</div>

<div class="food-brand">

${food.grams} ${food.unit}

</div>

</div>

<div class="food-actions">

<div class="food-kcal">

${food.kcal} kcal

</div>

<button class="icon-btn delete">

🗑️

</button>

</div>

`;

            row.onclick = ()=>{

                editMealFood(

                    meal,

                    index

                );

            };

            row.querySelector("button")

                .onclick = e=>{

                    e.stopPropagation();

                    removeMealFood(

                        meal,

                        index

                    );

                };

            list.appendChild(row);

        });

        const footer =

            document.createElement("div");

        footer.className = "meal-total";

        footer.innerHTML = `

<span>Total</span>

<strong>${Math.round(total)} kcal</strong>

`;

        list.appendChild(footer);

    });

}

/* ==========================================================
   EVENTOS
========================================================== */

if(ui.gramsInput){

    ui.gramsInput.addEventListener(

        "keydown",

        e=>{

            if(e.key==="Enter"){

                saveMealFood();

            }

        }

    );

}

document.getElementById("acceptGrams").onclick =

    saveMealFood;

document.getElementById("cancelGrams").onclick =

    closeGrams;
    
/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   PARTE 5/8
   Editor de alimentos
========================================================== */

/* ==========================================================
   NUEVO ALIMENTO
========================================================== */

function createFoodFromForm(){

    return {

        id: state.editingFood
            ? state.editingFood.id
            : createId(),

        emoji: state.editingFood?.emoji || "🍽️",

        name: ui.foodName.value.trim(),

        brand: ui.foodBrand.value.trim(),

        category:
            ui.foodCategory.value.trim() || "Otros",

        base:
            number(ui.foodBase.value) || 100,

        unit:
            ui.foodUnit.value.trim() || "g",

        kcal:
            number(ui.foodKcal.value),

        protein:
            number(ui.foodProtein.value),

        carbs:
            number(ui.foodCarbs.value),

        fat:
            number(ui.foodFat.value)

    };

}

/* ==========================================================
   VALIDACIÓN
========================================================== */

function validateFood(food){

    if(!food.name){

        alert("Introduce un nombre.");

        return false;

    }

    if(food.base <= 0){

        alert("La base debe ser mayor que cero.");

        return false;

    }

    return true;

}

/* ==========================================================
   ACTUALIZAR COMIDAS
========================================================== */

function updateMealsFromFood(food){

    Object.keys(state.meals).forEach(meal=>{

        state.meals[meal].forEach(item=>{

            if(item.foodId !== food.id){

                return;

            }

            const factor =
                item.grams / food.base;

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
                (food.protein * factor).toFixed(1)
            );

            item.carbs = Number(
                (food.carbs * factor).toFixed(1)
            );

            item.fat = Number(
                (food.fat * factor).toFixed(1)
            );

        });

    });

}

/* ==========================================================
   GUARDAR
========================================================== */

async function saveEditedFood(){

    const food = createFoodFromForm();

    if(!validateFood(food)){

        return;

    }

    const duplicated = state.foods.find(f=>

        normalize(f.name) === normalize(food.name)

        &&

        f.id !== food.id

    );

    if(duplicated){

        alert("Ya existe un alimento con ese nombre.");

        return;

    }

    if(state.editingFood){

        const index = state.foods.findIndex(

            f=>f.id===food.id

        );

        if(index !== -1){

            state.foods[index] = food;

        }

    }else{

        state.foods.push(food);

    }

    updateMealsFromFood(food);

    await saveFoods();

    await saveMeals();

    renderFoods(ui.searchFood.value);

    renderMeals();

    refreshDashboard();

    closeEditFood();

}

/* ==========================================================
   CERRAR
========================================================== */

function closeEditFood(){

    state.editingFood = null;

    ui.editFoodModal.classList.remove("show");

    unlockScroll();

}

/* ==========================================================
   BOTONES
========================================================== */

document.getElementById("saveEditFood").onclick =

    saveEditedFood;

document.getElementById("cancelEditFood").onclick =

    closeEditFood;

ui.editFoodModal.onclick = e=>{

    if(e.target === ui.editFoodModal){

        closeEditFood();

    }

};

/* ==========================================================
   NUEVO ALIMENTO
========================================================== */

document.getElementById("newFoodBtn").onclick =

    ()=>{

        state.editingFood = null;

        ui.foodName.value = "";

        ui.foodBrand.value = "";

        ui.foodCategory.value = "Otros";

        ui.foodBase.value = 100;

        ui.foodUnit.value = "g";

        ui.foodKcal.value = "";

        ui.foodProtein.value = "";

        ui.foodCarbs.value = "";

        ui.foodFat.value = "";

        lockScroll();

        ui.editFoodModal.classList.add("show");

    };
    
    /* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   PARTE 6/8
   Importación inteligente
========================================================== */

/* ==========================================================
   DETECTAR FORMATO
========================================================== */

function detectImport(text){

    text = text
        .replace(/```json/g,"")
        .replace(/```/g,"")
        .trim();

    if(!text){

        return "empty";

    }

    try{

        JSON.parse(text);

        return "json";

    }catch{}

    const t = normalize(text);

    if(

        t.includes("nombre:") ||

        t.includes("proteinas") ||

        t.includes("proteínas") ||

        t.includes("hidratos") ||

        t.includes("grasas") ||

        t.includes("kcal")

    ){

        return "chatgpt";

    }

    return "unknown";

}

/* ==========================================================
   IMPORTAR JSON
========================================================== */

async function importJSON(text){

    let data;

    try{

        data = JSON.parse(text);

    }catch{

        alert("JSON no válido.");

        return;

    }

    const food = {

        id: data.id || createId(),

        emoji: data.emoji || "🍽️",

        name: data.nombre || data.name || "",

        brand: data.marca || data.brand || "",

        category: data.categoria || data.category || "Otros",

        base: number(data.base || 100),

        unit: (data.unidad || data.unit || "g"),

        kcal: number(data.kcal),

        protein: number(data.proteinas || data.protein),

        carbs: number(data.hidratos || data.carbs),

        fat: number(data.grasas || data.fat)

    };

    const existing = existsFood(food.name);

    if(existing){

        Object.assign(existing,food);

    }else{

        state.foods.push(food);

    }

    await saveFoods();

    renderFoods();

}

/* ==========================================================
   IMPORTAR TEXTO CHATGPT
========================================================== */

async function importChatGPT(text){

    text = text
        .replace(/```/g,"")
        .trim();

    const food = {

        id:createId(),

        emoji:"🍽️",

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

    food.name = lines[0];

    lines.forEach(line=>{

        if(/^marca/i.test(line)){

            food.brand = line.split(":")[1]?.trim() || "";

        }

        if(/^categor/i.test(line)){

            food.category = line.split(":")[1]?.trim() || "Otros";

        }

        if(/^base/i.test(line)){

            const m = line.match(/([\d.,]+)/);

            if(m){

                food.base = number(m[1]);

            }

            food.unit = line.includes("ml") ? "ml" : "g";

        }

        if(/kcal/i.test(line)){

            const m = line.match(/([\d.,]+)/);

            if(m){

                food.kcal = number(m[1]);

            }

        }

        if(/prote/i.test(line)){

            const m = line.match(/([\d.,]+)/);

            if(m){

                food.protein = number(m[1]);

            }

        }

        if(/hidr/i.test(line) || /\bHC\b/i.test(line)){

            const m = line.match(/([\d.,]+)/);

            if(m){

                food.carbs = number(m[1]);

            }

        }

        if(/gras/i.test(line) || /\bG\b/i.test(line)){

            const m = line.match(/([\d.,]+)/);

            if(m){

                food.fat = number(m[1]);

            }

        }

    });

    if(!food.name){

        alert("No se pudo detectar el alimento.");

        return;

    }

    const existing = existsFood(food.name);

    if(existing){

        Object.assign(existing,food);

    }else{

        state.foods.push(food);

    }

    await saveFoods();

    renderFoods();

}

/* ==========================================================
   IMPORTAR
========================================================== */

async function importFood(){

    const text = ui.jsonInput.value.trim();

    switch(detectImport(text)){

        case "json":

            await importJSON(text);

            break;

        case "chatgpt":

            await importChatGPT(text);

            break;

        case "empty":

            alert("No hay datos para importar.");

            return;

        default:

            alert("Formato no reconocido.");

            return;

    }

    ui.jsonInput.value = "";

    ui.jsonStatus.textContent = "";

    ui.newFoodModal.classList.remove("show");

}

/* ==========================================================
   EVENTOS
========================================================== */

document.getElementById("saveFood").onclick =

    importFood;

document.getElementById("cancelFood").onclick =

    ()=>{

        ui.newFoodModal.classList.remove("show");

    };

ui.newFoodModal.onclick = e=>{

    if(e.target===ui.newFoodModal){

        ui.newFoodModal.classList.remove("show");

    }

};

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   PARTE 7/8
   Eventos + Resumen + Inicialización
========================================================== */

/* ==========================================================
   RESUMEN DEL DÍA
========================================================== */

function buildSummary(){

    const totals = calculateTotals();

    const goal = state.settings.kcalGoal || 2200;

    const names = {

        desayuno:"🍳 Desayuno",

        comida:"🍝 Comida",

        merienda:"🥪 Merienda",

        cena:"🌙 Cena"

    };

    let text =

`${formatDate(new Date(state.currentDate))}

Objetivo: ${goal} kcal
Consumidas: ${Math.round(totals.kcal)} kcal

Proteínas: ${totals.protein.toFixed(1)} g
Hidratos: ${totals.carbs.toFixed(1)} g
Grasas: ${totals.fat.toFixed(1)} g`;

    Object.keys(state.meals).forEach(meal=>{

        if(state.meals[meal].length===0){

            return;

        }

        text += `\n\n${names[meal]}\n`;

        state.meals[meal].forEach(food=>{

            text +=

`• ${food.name} (${food.grams} ${food.unit})\n`;

        });

    });

    return text.trim();

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

        alert("No se pudo copiar el resumen.");

    }

}

/* ==========================================================
   EXPORTAR COPIA
========================================================== */

async function exportData(){

    const backup = await DB.exportBackup();

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
   BOTONES +
========================================================== */

document

.querySelectorAll(".add")

.forEach((button,index)=>{

    const meals=[

        "desayuno",

        "comida",

        "merienda",

        "cena"

    ];

    button.onclick=()=>{

        openLibrary(

            meals[index]

        );

    };

});

/* ==========================================================
   MODALES
========================================================== */

document

.getElementById("closeFoodModal")

.onclick = closeLibrary;

ui.modal.onclick = e=>{

    if(e.target===ui.modal){

        closeLibrary();

    }

};

ui.gramsModal.onclick = e=>{

    if(e.target===ui.gramsModal){

        closeGrams();

    }

};

/* ==========================================================
   ESCAPE
========================================================== */

window.addEventListener(

    "keydown",

    e=>{

        if(e.key!=="Escape"){

            return;

        }

        closeLibrary();

        closeGrams();

        closeEditFood();

    }

);

/* ==========================================================
   ACTUALIZAR FECHA
========================================================== */

setInterval(

    ()=>{

        updateGreeting();

        updateDate();

    },

    60000

);

/* ==========================================================
   INICIALIZAR
========================================================== */

async function init(){

    await loadApp();

    refresh();

    ui.ring.onclick = copySummary;

    console.log(

        "%cAplicación iniciada",

        "color:#38d46a;font-weight:bold;"

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
   DÍA ANTERIOR
========================================================== */

async function previousDay(){

    const d = new Date(state.currentDate);

    d.setDate(

        d.getDate() - 1

    );

    await loadDay(

        DB.todayKey.call({

            getFullYear:()=>d.getFullYear()

        })

    );

}

/* ==========================================================
   DÍA SIGUIENTE
========================================================== */

async function nextDay(){

    const d = new Date(state.currentDate);

    d.setDate(

        d.getDate() + 1

    );

    const date =

        d.toISOString()

        .slice(0,10);

    await loadDay(date);

}

/* ==========================================================
   SINCRONIZAR
========================================================== */

async function sync(){

    state.foods =

        (await DB.get("foods")) ||

        [];

    state.settings =

        (await DB.get("settings")) ||

        state.settings;

    state.meals =

        await DB.getDay(

            state.currentDate

        );

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

                (food.protein * factor).toFixed(1)

            );

            item.carbs = Number(

                (food.carbs * factor).toFixed(1)

            );

            item.fat = Number(

                (food.fat * factor).toFixed(1)

            );

        });

    });

    await saveMeals();

}

/* ==========================================================
   REINICIAR DÍA
========================================================== */

async function resetToday(){

    if(

        !confirm(

            "¿Eliminar todas las comidas del día?"

        )

    ){

        return;

    }

    state.meals = DB.emptyDay();

    await saveMeals();

    refresh();

}

/* ==========================================================
   API PÚBLICA
========================================================== */

window.miNutricion = {

    version: "NEXT",

    state,

    refresh,

    sync,

    loadDay,

    previousDay,

    nextDay,

    buildSummary,

    copySummary,

    exportData,

    resetToday,

    recalculateMeals

};

/* ==========================================================
   STORAGE
========================================================== */

window.addEventListener(

    "storage",

    ()=>{

        sync();

    }

);

/* ==========================================================
   INFORMACIÓN
========================================================== */

console.table({

    Version: "NEXT",

    Fecha: state.currentDate,

    Objetivo: state.settings.kcalGoal

});

console.log(

    "%c🍎 Mi Nutrición NEXT lista",

    "color:#38d46a;font-size:18px;font-weight:bold;"

);

/* ==========================================================
   FIN DEL ARCHIVO
========================================================== */