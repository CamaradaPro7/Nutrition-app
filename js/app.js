/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.1
   PARTE 1/10
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

    previewFood:null,

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

    sheetTitle:$("sheetTitle"),

    searchFood:$("searchFood"),

    foodResults:$("foodResults"),

    newFoodBtn:$("newFoodBtn"),

    closeFoodModal:$("closeFoodModal"),

    gramsModal:$("gramsModal"),

    gramsInput:$("gramsInput"),

    selectedFood:$("selectedFood"),

    acceptGrams:$("acceptGrams"),

    cancelGrams:$("cancelGrams"),

    newFoodModal:$("newFoodModal"),

    jsonInput:$("jsonInput"),

    saveFood:$("saveFood"),

    manualFoodBtn:$("manualFoodBtn"),

    editFoodModal:$("editFoodModal"),

    foodName:$("foodName"),

    foodBrand:$("foodBrand"),

    foodCategory:$("foodCategory"),

    foodBase:$("foodBase"),

    foodUnit:$("foodUnit"),

    foodKcal:$("foodKcal"),

    foodProtein:$("foodProtein"),

    foodCarbs:$("foodCarbs"),

    foodFat:$("foodFat"),

    saveEditFood:$("saveEditFood"),

    cancelEditFood:$("cancelEditFood")

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
   GUARDAR
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

function existsFood(name){

    return state.foods.find(f=>

        normalize(f.name)===

        normalize(name)

    );

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
   app.js V5.1
   PARTE 2/10
   Dashboard
========================================================== */

/* ==========================================================
   SALUDO
========================================================== */

function updateGreeting(){

    const hour=new Date().getHours();

    let greeting="Buenas noches";

    if(hour>=6 && hour<14){

        greeting="Buenos días";

    }else if(hour>=14 && hour<21){

        greeting="Buenas tardes";

    }

    ui.greeting.textContent=greeting;

}

/* ==========================================================
   FECHA
========================================================== */

function updateDate(){

    ui.fecha.textContent=

        formatDate(

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

            totals.kcal+=food.kcal||0;

            totals.protein+=food.protein||0;

            totals.carbs+=food.carbs||0;

            totals.fat+=food.fat||0;

        });

    });

    return totals;

}

/* ==========================================================
   ANILLO
========================================================== */

function updateRing(){

    const totals=calculateTotals();

    const goal=

        state.settings.kcalGoal||2200;

    const percent=Math.min(

        totals.kcal/goal,

        1

    );

    const degrees=percent*360;

    ui.ring.style.setProperty(

        "--progress",

        `${degrees}deg`

    );

    ui.ring.classList.remove(

        "green",

        "yellow",

        "red"

    );

    if(percent<0.8){

        ui.ring.classList.add("green");

    }else if(percent<1){

        ui.ring.classList.add("yellow");

    }else{

        ui.ring.classList.add("red");

    }

}

/* ==========================================================
   DASHBOARD
========================================================== */

function refreshDashboard(){

    const totals=

        calculateTotals();

    updateGreeting();

    updateDate();

    updateRing();

    ui.totalKcal.textContent=

        Math.round(totals.kcal);

    ui.protein.textContent=

        `${totals.protein.toFixed(1)} g`;

    ui.carbs.textContent=

        `${totals.carbs.toFixed(1)} g`;

    ui.fat.textContent=

        `${totals.fat.toFixed(1)} g`;

    const label=

        ui.ring.querySelector("small");

    if(label){

        label.textContent=

        `de ${state.settings.kcalGoal} kcal`;

    }

}

/* ==========================================================
   RESUMEN
========================================================== */

function buildSummary(){

    const totals=

        calculateTotals();

    let text=

`${formatDate(new Date(state.currentDate))}

Calorías: ${Math.round(totals.kcal)} / ${state.settings.kcalGoal} kcal

Proteínas: ${totals.protein.toFixed(1)} g
Hidratos: ${totals.carbs.toFixed(1)} g
Grasas: ${totals.fat.toFixed(1)} g`;

    Object.keys(state.meals).forEach(meal=>{

        if(!state.meals[meal].length){

            return;

        }

        text+=`\n\n${meal.toUpperCase()}\n`;

        state.meals[meal].forEach(food=>{

            text+=`• ${food.name} (${food.grams}${food.unit}) - ${food.kcal} kcal\n`;

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

        alert("No se pudo copiar el resumen.");

    }

}

/* ==========================================================
   REFRESCO GENERAL
========================================================== */

function refresh(){

    refreshDashboard();

    renderMeals();

    renderFoods(

        ui.searchFood.value

    );

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.1
   PARTE 3/10
   Biblioteca
========================================================== */

/* ==========================================================
   ABRIR BIBLIOTECA
========================================================== */

function openLibrary(meal){

    state.currentMeal=meal;

    const titles={

        desayuno:"🍳 Desayuno",

        comida:"🍝 Comida",

        merienda:"🥪 Merienda",

        cena:"🌙 Cena"

    };

    ui.sheetTitle.textContent=

        titles[meal];

    ui.searchFood.value="";

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

function renderFoods(filter=""){

    ui.foodResults.innerHTML="";

    const text=normalize(filter);

    const foods=state.foods

        .filter(food=>

            normalize(food.name)

            .includes(text)

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

Sin alimentos

</p>`;

        return;

    }

    foods.forEach(food=>{

        const card=

            document.createElement("div");

        card.className=

            "food-item fade-in";

        card.innerHTML=`

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

        card.onclick=()=>{

            openGrams(food);

        };

        ui.foodResults.appendChild(

            card

        );

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
   NUEVO ALIMENTO
========================================================== */

ui.newFoodBtn.onclick=()=>{

    ui.modal.classList.remove("show");

    ui.newFoodModal.classList.add("show");

    ui.jsonInput.value="";

    setTimeout(()=>{

        ui.jsonInput.focus();

    },150);

};

/* ==========================================================
   CERRAR MODAL
========================================================== */

ui.closeFoodModal.onclick=

    closeLibrary;

ui.modal.onclick=e=>{

    if(e.target===ui.modal){

        closeLibrary();

    }

};

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.1
   PARTE 4/10
   Importador ChatGPT
========================================================== */

/* ==========================================================
   DETECTAR FORMATO
========================================================== */

function detectImport(text){

    text=text
        .replace(/```/g,"")
        .trim();

    if(!text){

        return "empty";

    }

    try{

        JSON.parse(text);

        return "json";

    }

    catch{}

    return "chatgpt";

}

/* ==========================================================
   EXTRAER ALIMENTO
========================================================== */

function parseChatGPTFood(text){

    text=text
        .replace(/```/g,"")
        .replace(/\r/g,"")
        .trim();

    const food={

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

    const lines=text

        .split("\n")

        .map(l=>l.trim())

        .filter(Boolean);

    if(lines.length){

        food.name=lines[0];

    }

    lines.forEach(line=>{

        const value=line.match(

            /(\d+[.,]?\d*)/

        );

        if(!value){

            return;

        }

        const n=number(value[1]);

        if(/100\s*ml/i.test(line)){

            food.base=100;

            food.unit="ml";

        }

        if(/100\s*g/i.test(line)){

            food.base=100;

            food.unit="g";

        }

        if(/energ|kcal|calor/i.test(line)){

            food.kcal=n;

        }

        if(/prote/i.test(line)){

            food.protein=n;

        }

        if(/hidr|carbo|hc/i.test(line)){

            food.carbs=n;

        }

        if(/gras/i.test(line)){

            food.fat=n;

        }

    });

    return food;

}

/* ==========================================================
   IMPORTAR CHATGPT
========================================================== */

async function importChatGPT(text){

    const food=parseChatGPTFood(text);

    if(!food.name){

        alert(

            "No se pudo detectar el alimento."

        );

        return;

    }

    state.previewFood=food;

    const existing=existsFood(

        food.name

    );

    if(existing){

        Object.assign(

            existing,

            food

        );

    }

    else{

        state.foods.push(food);

    }

    await saveFoods();

    renderFoods();

    ui.newFoodModal.classList.remove(

        "show"

    );

    ui.modal.classList.add(

        "show"

    );

    alert(

        `✅ ${food.name} añadido a la biblioteca.`

    );

}

/* ==========================================================
   IMPORTAR JSON
========================================================== */

async function importJSON(text){

    const food=JSON.parse(text);

    if(!food.id){

        food.id=createId();

    }

    const existing=existsFood(

        food.name

    );

    if(existing){

        Object.assign(

            existing,

            food

        );

    }

    else{

        state.foods.push(food);

    }

    await saveFoods();

    renderFoods();

}

/* ==========================================================
   GUARDAR
========================================================== */

async function importFood(){

    const text=

        ui.jsonInput.value.trim();

    const type=

        detectImport(text);

    if(type==="empty"){

        alert(

            "Pega primero el texto."

        );

        return;

    }

    if(type==="json"){

        await importJSON(text);

    }

    else{

        await importChatGPT(text);

    }

    ui.jsonInput.value="";

}

/* ==========================================================
   EVENTOS
========================================================== */

ui.saveFood.onclick=

    importFood;

ui.manualFoodBtn.onclick=()=>{

    ui.newFoodModal.classList.remove("show");

    newFood();

};

ui.newFoodModal.onclick=e=>{

    if(e.target===ui.newFoodModal){

        ui.newFoodModal.classList.remove("show");

        ui.modal.classList.add("show");

    }

};

$("closeNewFood").onclick=()=>{

    ui.newFoodModal.classList.remove("show");

    ui.modal.classList.add("show");

};

ui.jsonInput.addEventListener(

    "keydown",

    e=>{

        if(

            e.key==="Enter"

            &&

            e.ctrlKey

        ){

            importFood();

        }

    }

);

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.1
   PARTE 5/10
   Editor manual de alimentos
========================================================== */

/* ==========================================================
   NUEVO ALIMENTO
========================================================== */

function newFood(){

    state.editingFood=null;

    ui.foodName.value="";

    ui.foodBrand.value="";

    ui.foodCategory.value="";

    ui.foodBase.value=100;

    ui.foodUnit.value="g";

    ui.foodKcal.value="";

    ui.foodProtein.value="";

    ui.foodCarbs.value="";

    ui.foodFat.value="";

    lockScroll();

    ui.editFoodModal.classList.add("show");

}

/* ==========================================================
   EDITAR ALIMENTO
========================================================== */

function editFood(food){

    state.editingFood=food;

    ui.foodName.value=food.name;

    ui.foodBrand.value=food.brand||"";

    ui.foodCategory.value=food.category||"";

    ui.foodBase.value=food.base||100;

    ui.foodUnit.value=food.unit||"g";

    ui.foodKcal.value=food.kcal||0;

    ui.foodProtein.value=food.protein||0;

    ui.foodCarbs.value=food.carbs||0;

    ui.foodFat.value=food.fat||0;

    lockScroll();

    ui.editFoodModal.classList.add("show");

}

/* ==========================================================
   CERRAR EDITOR
========================================================== */

function closeEditFood(){

    ui.editFoodModal.classList.remove("show");

    unlockScroll();

    ui.modal.classList.add("show");

}

/* ==========================================================
   GUARDAR ALIMENTO
========================================================== */

async function saveEditedFood(){

    const food={

        id:state.editingFood
            ? state.editingFood.id
            : createId(),

        emoji:state.editingFood?.emoji||"🍽️",

        name:ui.foodName.value.trim(),

        brand:ui.foodBrand.value.trim(),

        category:ui.foodCategory.value.trim(),

        base:number(ui.foodBase.value)||100,

        unit:ui.foodUnit.value.trim()||"g",

        kcal:number(ui.foodKcal.value),

        protein:number(ui.foodProtein.value),

        carbs:number(ui.foodCarbs.value),

        fat:number(ui.foodFat.value)

    };

    if(!food.name){

        alert("Introduce un nombre.");

        return;

    }

    const index=state.foods.findIndex(

        f=>f.id===food.id

    );

    if(index===-1){

        state.foods.push(food);

    }else{

        state.foods[index]=food;

    }

    await saveFoods();

    renderFoods(ui.searchFood.value);

    closeEditFood();

}

/* ==========================================================
   ELIMINAR ALIMENTO
========================================================== */

async function deleteFood(id){

    if(!confirm("¿Eliminar este alimento?")){

        return;

    }

    state.foods=state.foods.filter(

        food=>food.id!==id

    );

    await saveFoods();

    renderFoods(ui.searchFood.value);

}

/* ==========================================================
   EVENTOS
========================================================== */

ui.saveEditFood.onclick=

    saveEditedFood;

ui.cancelEditFood.onclick=

    closeEditFood;

ui.editFoodModal.onclick=e=>{

    if(e.target===ui.editFoodModal){

        closeEditFood();

    }

};

[
    ui.foodName,
    ui.foodBrand,
    ui.foodCategory,
    ui.foodBase,
    ui.foodUnit,
    ui.foodKcal,
    ui.foodProtein,
    ui.foodCarbs,
    ui.foodFat
].forEach(input=>{

    input.addEventListener(

        "keydown",

        e=>{

            if(e.key==="Enter"){

                saveEditedFood();

            }

        }

    );

});

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.1
   PARTE 6/10
   Comidas
========================================================== */

/* ==========================================================
   ABRIR CANTIDAD
========================================================== */

function openGrams(food){

    state.selectedFood=food;

    ui.selectedFood.textContent=

        `${food.emoji||"🍽️"} ${food.name}`;

    ui.gramsInput.value=

        food.base||100;

    ui.modal.classList.remove("show");

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

    ui.modal.classList.add("show");

}

/* ==========================================================
   CREAR ALIMENTO DE LA COMIDA
========================================================== */

function buildMealFood(food,grams){

    const factor=

        grams/(food.base||100);

    return{

        id:createId(),

        foodId:food.id,

        emoji:food.emoji,

        name:food.name,

        brand:food.brand,

        category:food.category,

        grams,

        unit:food.unit,

        base:food.base,

        kcal:Math.round(food.kcal*factor),

        protein:Number(

            (food.protein*factor).toFixed(1)

        ),

        carbs:Number(

            (food.carbs*factor).toFixed(1)

        ),

        fat:Number(

            (food.fat*factor).toFixed(1)

        )

    };

}

function editMealFood(meal,index){

    const food=state.meals[meal][index];

    state.editingFood={
        meal,
        index
    };

    ui.selectedFood.textContent=food.name;
    ui.gramsInput.value=food.grams;

    ui.modal.classList.remove("show");
    ui.gramsModal.classList.add("show");

    setTimeout(()=>{
        ui.gramsInput.focus();
        ui.gramsInput.select();
    },150);

}

/* ==========================================================
   AÑADIR A LA COMIDA
========================================================== */

async function addFoodToMeal(){

    if(!state.selectedFood){

        return;

    }

    const grams=

        number(ui.gramsInput.value);

    if(grams<=0){

        alert("Cantidad no válida.");

        return;

    }
    
    if(state.editingFood){

    const grams=number(ui.gramsInput.value);

    const item=
        state.meals[
            state.editingFood.meal
        ][
            state.editingFood.index
        ];

    const food=
        state.foods.find(
            f=>f.id===item.foodId
        );

    const updated=
        buildMealFood(food,grams);

    updated.id=item.id;

    state.meals[
        state.editingFood.meal
    ][
        state.editingFood.index
    ]=updated;

    state.editingFood=null;

    await saveMeals();

    refresh();

    ui.gramsModal.classList.remove("show");

    unlockScroll();

    return;

}

    const item=

        buildMealFood(

            state.selectedFood,

            grams

        );

    state.meals

        [state.currentMeal]

        .push(item);

    await saveMeals();

    refresh();

    ui.gramsModal.classList.remove("show");

    unlockScroll();

}

/* ==========================================================
   EDITAR ALIMENTO DEL DÍA
========================================================== */

state.editMeal={

    meal:null,

    index:-1

};

function openEditMeal(meal,index){

    const food=state.meals[meal][index];

    if(!food){

        return;

    }

    state.editMeal.meal=meal;

    state.editMeal.index=index;

    $("editMealName").textContent=

        `${food.emoji||"🍽️"} ${food.name}`;

    $("editMealGrams").value=

        food.grams;

    lockScroll();

    $("editMealModal").classList.add("show");

    setTimeout(()=>{

        $("editMealGrams").focus();

        $("editMealGrams").select();

    },100);

}

function closeEditMeal(){

    $("editMealModal").classList.remove("show");

    unlockScroll();

}

async function saveMealEdit(){

    const meal=

        state.editMeal.meal;

    const index=

        state.editMeal.index;

    const item=

        state.meals[meal][index];

    const grams=

        number(

            $("editMealGrams").value

        );

    if(grams<=0){

        alert("Cantidad no válida.");

        return;

    }

    const food=

        state.foods.find(

            f=>f.id===item.foodId

        );

    if(!food){

        alert("No se encontró el alimento.");

        return;

    }

    const factor=

        grams/(food.base||100);

    item.grams=grams;

    item.kcal=Math.round(

        food.kcal*factor

    );

    item.protein=Number(

        (food.protein*factor).toFixed(1)

    );

    item.carbs=Number(

        (food.carbs*factor).toFixed(1)

    );

    item.fat=Number(

        (food.fat*factor).toFixed(1)

    );

    await saveMeals();

    refresh();

    closeEditMeal();

}

async function deleteMealItem(){

    const meal=

        state.editMeal.meal;

    const index=

        state.editMeal.index;

    if(!confirm(

        "¿Eliminar este alimento?"

    )){

        return;

    }

    state.meals[meal].splice(

        index,

        1

    );

    await saveMeals();

    refresh();

    closeEditMeal();

}

/* ==========================================================
   RENDER COMIDAS
========================================================== */

function renderMeals(){

    document

    .querySelectorAll(".meal")

    .forEach(card=>{

        const meal=

            card.dataset.meal;

        const foods=

            state.meals[meal];

        const preview=

            card.querySelector(".meal-preview");

        const empty=

            card.querySelector(".emptyMeal");

        const total=

            card.querySelector(".meal-total");

        preview.innerHTML="";

        if(!foods.length){

            empty.style.display="block";

            total.innerHTML="0 kcal";

            return;

        }

        empty.style.display="none";

        let kcal=0;

        foods.forEach((food,index)=>{

            kcal+=food.kcal;

            if(index<3){

                const row=

                    document.createElement("div");

                row.className="preview-item";
                
                row.onclick=(e)=>{
    e.stopPropagation();
    editMealFood(meal,index);
};

                row.innerHTML=`

<span>

${food.name}

</span>

<span>

${food.kcal} kcal

</span>

`;

row.style.cursor="pointer";

row.onclick=()=>{

    openEditMeal(

        meal,

        index

    );

};

                preview.appendChild(row);

            }

        });

        if(foods.length>3){

            const more=

                document.createElement("div");

            more.className="more-foods";

            more.textContent=

                `+${foods.length-3} más`;

            preview.appendChild(more);

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

ui.acceptGrams.onclick=

    addFoodToMeal;

ui.cancelGrams.onclick=

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
   app.js V5.1
   PARTE 7/10
   Historial + Favoritos + Recientes
========================================================== */

/* ==========================================================
   CARGAR HISTORIAL
========================================================== */

async function loadHistory(){

    return await DB.getHistory();

}

/* ==========================================================
   CAMBIAR DE DÍA
========================================================== */

async function loadDay(date){

    state.currentDate=date;

    state.meals=await DB.getDay(date);

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
   FAVORITOS
========================================================== */

function getFavorites(){

    return state.foods

        .filter(food=>food.favorite===true)

        .sort((a,b)=>

            a.name.localeCompare(

                b.name,

                "es"

            )

        );

}

async function toggleFavorite(id){

    const food=

        state.foods.find(

            f=>f.id===id

        );

    if(!food){

        return;

    }

    food.favorite=

        !food.favorite;

    await saveFoods();

    renderFoods(

        ui.searchFood.value

    );

}

/* ==========================================================
   RECIENTES
========================================================== */

function addRecent(foodId){

    let recent=

        JSON.parse(

            localStorage.getItem(

                "recentFoods"

            )||"[]"

        );

    recent=recent.filter(

        id=>id!==foodId

    );

    recent.unshift(foodId);

    recent=recent.slice(0,20);

    localStorage.setItem(

        "recentFoods",

        JSON.stringify(recent)

    );

}

function getRecentFoods(){

    const recent=

        JSON.parse(

            localStorage.getItem(

                "recentFoods"

            )||"[]"

        );

    return recent

        .map(id=>

            state.foods.find(

                f=>f.id===id

            )

        )

        .filter(Boolean);

}

/* ==========================================================
   AÑADIR A RECIENTES
========================================================== */

const originalAddFoodToMeal=

    addFoodToMeal;

addFoodToMeal=async function(){

    await originalAddFoodToMeal();

    if(state.selectedFood){

        addRecent(

            state.selectedFood.id

        );

    }

};

/* ==========================================================
   BUSCADOR INTELIGENTE
========================================================== */

function searchFoods(text){

    text=normalize(text);

    return state.foods.filter(food=>{

        return(

            normalize(food.name)

                .includes(text)

            ||

            normalize(

                food.brand||""

            )

            .includes(text)

            ||

            normalize(

                food.category||""

            )

            .includes(text)

        );

    });

}

/* ==========================================================
   RECARGAR
========================================================== */

async function reloadCurrentDay(){

    state.meals=

        await DB.getDay(

            state.currentDate

        );

    refresh();

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.1
   PARTE 8/10
   Exportación + Copias de seguridad + Sincronización
========================================================== */

/* ==========================================================
   EXPORTAR BASE DE DATOS
========================================================== */

async function exportDatabase(){

    const backup=await DB.exportBackup();

    const blob=new Blob(

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

    const url=

        URL.createObjectURL(blob);

    const link=

        document.createElement("a");

    link.href=url;

    link.download=

        `MiNutricion-${state.currentDate}.json`;

    link.click();

    URL.revokeObjectURL(url);

}

/* ==========================================================
   IMPORTAR BASE DE DATOS
========================================================== */

async function importDatabase(file){

    try{

        const text=

            await file.text();

        const json=

            JSON.parse(text);

        await DB.importBackup(json);

        await loadApp();

        refresh();

        alert(

            "Copia restaurada correctamente."

        );

    }

    catch(error){

        console.error(error);

        alert(

            "No se pudo importar la copia."

        );

    }

}

/* ==========================================================
   RECALCULAR TODAS LAS COMIDAS
========================================================== */

async function recalculateMeals(){

    Object.keys(state.meals).forEach(meal=>{

        state.meals[meal].forEach(item=>{

            const food=

                state.foods.find(

                    f=>f.id===item.foodId

                );

            if(!food){

                return;

            }

            const factor=

                item.grams/

                (food.base||100);

            item.name=food.name;

            item.brand=food.brand;

            item.category=food.category;

            item.emoji=food.emoji;

            item.unit=food.unit;

            item.base=food.base;

            item.kcal=Math.round(

                food.kcal*factor

            );

            item.protein=Number(

                (food.protein*factor)

                .toFixed(1)

            );

            item.carbs=Number(

                (food.carbs*factor)

                .toFixed(1)

            );

            item.fat=Number(

                (food.fat*factor)

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

    const data=

        await DB.load();

    state.foods=data.foods;

    state.settings=data.settings;

    state.meals=

        await DB.getDay(

            state.currentDate

        );

    refresh();

}

/* ==========================================================
   CAMBIOS EN OTRAS PESTAÑAS
========================================================== */

window.addEventListener(

    "storage",

    sync

);

/* ==========================================================
   API PÚBLICA
========================================================== */

window.miNutricion={

    state,

    refresh,

    sync,

    loadDay,

    goToday,

    exportDatabase,

    importDatabase,

    recalculateMeals,

    buildSummary,

    copySummary,

    toggleFavorite,

    getFavorites,

    getRecentFoods

};

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.1
   PARTE 9/10
   Inicialización + Eventos globales
========================================================== */

/* ==========================================================
   ABRIR / CERRAR MODALES
========================================================== */

function closeAllModals(){

    ui.modal.classList.remove("show");

    ui.newFoodModal.classList.remove("show");

    ui.editFoodModal.classList.remove("show");

    ui.gramsModal.classList.remove("show");

    unlockScroll();

}

function showLibrary(){

    closeAllModals();

    lockScroll();

    ui.modal.classList.add("show");

}

function showImport(){

    ui.modal.classList.remove("show");

    ui.newFoodModal.classList.add("show");

    ui.jsonInput.focus();

}

/* ==========================================================
   EVENTOS GLOBALES
========================================================== */

document.addEventListener(

    "keydown",

    e=>{

        if(e.key==="Escape"){

            closeAllModals();

        }

    }

);

document.querySelector(".ring").onclick=

    copySummary;

document.querySelectorAll(".meal")

.forEach(card=>{

    card.addEventListener(

        "click",

        ()=>{

            openLibrary(

                card.dataset.meal

            );

        }

    );

});

/* ==========================================================
   ACTUALIZAR FECHA
========================================================== */

setInterval(()=>{

    updateGreeting();

    updateDate();

},60000);

/* ==========================================================
   INICIALIZACIÓN
========================================================== */

async function init(){

    await loadApp();

    refresh();

    console.log(

        "%cMi Nutrición NEXT V5.1",

        "color:#34c759;font-size:18px;font-weight:bold;"

    );

}

/* ==========================================================
   ARRANQUE
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    init

);

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.1
   PARTE 10/10
   Utilidades finales + Fin del archivo
========================================================== */

/* ==========================================================
   UTILIDADES
========================================================== */

function resetImport(){

    if(ui.jsonInput){

        ui.jsonInput.value="";

    }

    state.previewFood=null;

}

function resetEditor(){

    state.editingFood=null;

    if(ui.foodName) ui.foodName.value="";
    if(ui.foodBrand) ui.foodBrand.value="";
    if(ui.foodCategory) ui.foodCategory.value="";
    if(ui.foodBase) ui.foodBase.value=100;
    if(ui.foodUnit) ui.foodUnit.value="g";
    if(ui.foodKcal) ui.foodKcal.value="";
    if(ui.foodProtein) ui.foodProtein.value="";
    if(ui.foodCarbs) ui.foodCarbs.value="";
    if(ui.foodFat) ui.foodFat.value="";

}

function resetSelection(){

    state.selectedFood=null;

    state.currentMeal=null;

}

/* ==========================================================
   RECARGAR TODO
========================================================== */

async function reload(){

    await loadApp();

    refresh();

}

/* ==========================================================
   RESETEAR APLICACIÓN
========================================================== */

async function resetApp(){

    if(!confirm("¿Reiniciar la aplicación?")){

        return;

    }

    await DB.resetDatabase();

    await reload();

}

/* ==========================================================
   EVENTOS VISIBILIDAD
========================================================== */

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(document.visibilityState==="visible"){

            sync();

        }

    }

);

/* ==========================================================
   API EXTRA
========================================================== */

window.miNutricion.reload=reload;

window.miNutricion.resetApp=resetApp;

window.miNutricion.resetImport=resetImport;

window.miNutricion.resetEditor=resetEditor;

window.miNutricion.resetSelection=resetSelection;

/* ==========================================================
   INFORMACIÓN
========================================================== */

console.table({

    Aplicacion:"Mi Nutrición NEXT",

    Version:"5.1",

    BaseDatos:"IndexedDB",

    Fecha:state.currentDate

});

console.log(

    "%cAplicación iniciada correctamente",

    "color:#34c759;font-weight:bold;font-size:16px;"

);

/* ==========================================================
   FIN DEL ARCHIVO
========================================================== */