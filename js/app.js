/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V6.0
   PARTE 1/12
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

    previewFood:null,

    lastScroll:0,

    touch:false

};

async function loadApp(){

    const data=await DB.load();

    state.foods=data.foods||[];

    state.settings=data.settings||{

        kcalGoal:2200

    };

    state.meals=

        await DB.getDay(

            state.currentDate

        );

}

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

window.Base={

    state,

    loadApp,

    saveFoods,

    saveMeals

};

/* ==========================================================
   ATAJOS
========================================================== */

const $=id=>document.getElementById(id);

const $$=selector=>

    [...document.querySelectorAll(selector)];

/* ==========================================================
   UI
========================================================== */

const ui={

    greeting:$("greeting"),

    date:$("fecha"),

    ring:$("ringProgress"),

    totalKcal:$("totalKcal"),

    protein:$("protein"),

    carbs:$("carbs"),

    fat:$("fat"),

    meals:$("meals"),

    /* Biblioteca */

    library:$("modal"),

    sheetTitle:$("sheetTitle"),

    search:$("searchFood"),

    results:$("foodResults"),

    newFood:$("newFoodBtn"),

    closeLibrary:$("closeFoodModal"),

    /* Cantidad */

    gramsModal:$("gramsModal"),

    gramsInput:$("gramsInput"),

    selectedFood:$("selectedFood"),

    acceptGrams:$("acceptGrams"),

    cancelGrams:$("cancelGrams"),

    /* Importar */

    importModal:$("newFoodModal"),

    importInput:$("jsonInput"),

    importSave:$("saveFood"),

    importManual:$("manualFoodBtn"),

    closeImport:$("closeNewFood"),

    /* Editor alimentos */

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

    saveFoodEdit:$("saveEditFood"),

    cancelFoodEdit:$("cancelEditFood"),

    /* Editor comida */

    editMealModal:$("editMealModal"),

    editMealName:$("editMealName"),

    editMealGrams:$("editMealGrams"),

    saveMeal:$("saveMealFood"),

    deleteMeal:$("deleteMealFood"),

    closeMeal:$("closeEditMeal")

};

/* ==========================================================
   CARGA
========================================================== */

async function loadApp(){

    const data=await DB.load();

    state.foods=data.foods||[];

    state.settings=data.settings||{

        kcalGoal:2200

    };

    state.meals=

        await DB.getDay(

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

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V6.0
   PARTE 2/12
   Utilidades + Parser inteligente
========================================================== */

/* ==========================================================
   UTILIDADES
========================================================== */

function normalize(text){

    return String(text||"")

        .normalize("NFD")

        .replace(/[\u0300-\u036f]/g,"")

        .toLowerCase()

        .trim();

}

function number(value){

    return Number(

        String(value)

        .replace(",", ".")

        .replace(/[^\d.-]/g,"")

    )||0;

}

function uid(){

    return Date.now()

        +

        Math.floor(

            Math.random()*100000

        );

}

function foodById(id){

    return state.foods.find(

        food=>food.id===id

    );

}

function existsFood(name){

    return state.foods.find(

        food=>

        normalize(food.name)===

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
   PARSER CHATGPT V6
========================================================== */

function parseChatGPTFood(text){

    text=text

        .replace(/```/g,"")

        .replace(/\r/g,"")

        .trim();

    const food={

        id:uid(),

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

        .map(x=>x.trim())

        .filter(Boolean);

    /* Nombre */

    for(const line of lines){

        const l=normalize(line);

        if(

            l.includes("informacion nutricional")||

            l.includes("valores nutricionales")||

            l.includes("valor nutricional")||

            l.includes("por 100")||

            l.includes("cantidad")

        ){

            continue;

        }

        if(!/\d/.test(line)){

            food.name=line;

            break;

        }

    }

    /* Base */

    for(const line of lines){

        const m=line.match(

            /(\d+[.,]?\d*)\s*(g|gr|gramos|ml|l|ud|unidad|unidades)/i

        );

        if(m){

            food.base=number(m[1]);

            const u=m[2].toLowerCase();

            if(u.startsWith("g")){

                food.unit="g";

            }

            else if(u==="ml"){

                food.unit="ml";

            }

            else{

                food.unit="ud";

            }

            break;

        }

    }

    /* Nutrientes */

    lines.forEach(line=>{

        const n=line.match(

            /(\d+[.,]?\d*)/

        );

        if(!n){

            return;

        }

        const value=number(n[1]);

        const l=normalize(line);

        if(

            l.includes("kcal")||

            l.includes("energia")||

            l.includes("energía")

        ){

            food.kcal=value;

        }

        else if(

            l.includes("prote")

        ){

            food.protein=value;

        }

        else if(

            l.includes("hidr")||

            l.includes("carbo")

        ){

            food.carbs=value;

        }

        else if(

            l.includes("gras")

        ){

            food.fat=value;

        }

    });

    return food;

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V6.0
   PARTE 3/12
   Dashboard + Resumen ChatGPT
========================================================== */

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

    Object.values(state.meals)

    .forEach(meal=>{

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
   SALUDO
========================================================== */

function updateGreeting(){

    const hour=new Date().getHours();

    let greeting="Buenas noches";

    if(hour>=6 && hour<14){

        greeting="Buenos días";

    }

    else if(hour<21){

        greeting="Buenas tardes";

    }

    ui.greeting.textContent=greeting;

    ui.date.textContent=

        formatDate(

            new Date(state.currentDate)

        );

}

/* ==========================================================
   ANILLO
========================================================== */

function updateRing(){

    const totals=

        calculateTotals();

    const goal=

        state.settings.kcalGoal||2200;

    const percent=Math.min(

        totals.kcal/goal,

        1

    );

    ui.ring.style.setProperty(

        "--progress",

        `${percent*360}deg`

    );

    ui.ring.className=

        "ring-progress";

    if(percent<0.8){

        ui.ring.classList.add(

            "green"

        );

    }

    else if(percent<1){

        ui.ring.classList.add(

            "yellow"

        );

    }

    else{

        ui.ring.classList.add(

            "red"

        );

    }

}

/* ==========================================================
   DASHBOARD
========================================================== */

function refreshDashboard(){

    const t=

        calculateTotals();

    updateGreeting();

    updateRing();

    ui.totalKcal.textContent=

        Math.round(t.kcal);

    ui.protein.textContent=

        `${t.protein.toFixed(1)} g`;

    ui.carbs.textContent=

        `${t.carbs.toFixed(1)} g`;

    ui.fat.textContent=

        `${t.fat.toFixed(1)} g`;

    const label=

        ui.ring.querySelector("small");

    if(label){

        label.textContent=

        `de ${state.settings.kcalGoal} kcal`;

    }

}

/* ==========================================================
   INFORME CHATGPT
========================================================== */

function buildSummary(){

    const t=

        calculateTotals();

    let text=

`${formatDate(new Date(state.currentDate))}

Calorías: ${Math.round(t.kcal)} / ${state.settings.kcalGoal} kcal

Proteínas: ${t.protein.toFixed(1)} g
Hidratos: ${t.carbs.toFixed(1)} g
Grasas: ${t.fat.toFixed(1)} g`;

    [

        "desayuno",

        "comida",

        "merienda",

        "cena"

    ].forEach(meal=>{

        const foods=

            state.meals[meal];

        if(!foods.length){

            return;

        }

        text+=`\n\n${meal.toUpperCase()}\n`;

        foods.forEach(food=>{

            text+=

`• ${food.name}
  ${food.grams}${food.unit} · ${food.kcal} kcal
`;

        });

    });

    return text.trim();

}

/* ==========================================================
   COPIAR
========================================================== */

async function copySummary(){

    try{

        await navigator.clipboard.writeText(

            buildSummary()

        );

        toast(

            "📋 Informe copiado"

        );

    }

    catch{

        toast(

            "No se pudo copiar"

        );

    }

}

/* ==========================================================
   REFRESCO
========================================================== */

function refresh(){

    refreshDashboard();

    renderMeals();

    renderFoods(

        ui.search.value

    );

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V6.0
   PARTE 4/12
   Biblioteca V6
========================================================== */

/* ==========================================================
   ABRIR / CERRAR
========================================================== */

function openLibrary(meal){

    state.currentMeal=meal;

    ui.sheetTitle.textContent={

        desayuno:"🍳 Desayuno",

        comida:"🍝 Comida",

        merienda:"🥪 Merienda",

        cena:"🌙 Cena"

    }[meal];

    ui.search.value="";

    renderFoods();

    lockScroll();

    ui.library.classList.add("show");

}

function closeLibrary(){

    ui.library.classList.remove("show");

    unlockScroll();

}

/* ==========================================================
   RENDER
========================================================== */

function renderFoods(filter=""){

    const text=

        normalize(filter);

    ui.results.innerHTML="";

    const foods=

        state.foods

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

        ui.results.innerHTML=

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

        card.innerHTML=

`
<div class="food-left">

<div class="food-name">

${food.emoji||"🍽️"} ${food.name}

</div>

<div class="food-brand">

${food.brand||""}

</div>

</div>

<div class="food-right">

<div class="food-kcal">

${food.kcal} kcal

</div>

<div class="food-base">

${food.base} ${food.unit}

</div>

</div>
`;

        /* ---------- Toque normal ---------- */

        card.addEventListener(

            "pointerup",

            e=>{

                if(state.touch){

                    state.touch=false;

                    return;

                }

                openGrams(food);

            }

        );

        /* ---------- Pulsación larga ---------- */

        let timer;

        card.addEventListener(

            "pointerdown",

            ()=>{

                timer=setTimeout(()=>{

                    state.touch=true;

                    openFoodMenu(food);

                },550);

            }

        );

        [

            "pointerup",

            "pointerleave",

            "pointercancel"

        ].forEach(event=>{

            card.addEventListener(

                event,

                ()=>{

                    clearTimeout(timer);

                }

            );

        });

        ui.results.appendChild(card);

    });

}

/* ==========================================================
   MENÚ
========================================================== */

function openFoodMenu(food){

    const option=

        prompt(

`${food.name}

1 = Editar

2 = Eliminar`

        );

    if(option==="1"){

        editFood(food);

        return;

    }

    if(option==="2"){

        deleteFood(food.id);

    }

}

/* ==========================================================
   BUSCADOR
========================================================== */

ui.search.addEventListener(

    "input",

    ()=>{

        renderFoods(

            ui.search.value

        );

    }

);

/* ==========================================================
   EVENTOS
========================================================== */

ui.newFood.onclick=()=>{

    ui.library.classList.remove(

        "show"

    );

    ui.importModal.classList.add(

        "show"

    );

    ui.importInput.value="";

    setTimeout(()=>{

        ui.importInput.focus();

    },120);

};

ui.closeLibrary.onclick=

    closeLibrary;
    
/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V6.0
   PARTE 5/12
   Importador Inteligente
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
   IMPORTAR
========================================================== */

async function importFood(){

    const raw=

        ui.importInput.value.trim();

    const type=

        detectImport(raw);

    if(type==="empty"){

        toast("Pega primero un alimento.");

        return;

    }

    let food;

    if(type==="json"){

        food=JSON.parse(raw);

        if(!food.id){

            food.id=uid();

        }

    }

    else{

        food=parseChatGPTFood(raw);

    }

    if(!food.name){

        toast("No se pudo reconocer el alimento.");

        return;

    }

    const existing=

        existsFood(food.name);

    if(existing){

        Object.assign(

            existing,

            food

        );

        state.selectedFood=

            existing;

    }

    else{

        state.foods.push(food);

        state.selectedFood=

            food;

    }

    await saveFoods();

    renderFoods();

    ui.importInput.value="";

    ui.importModal.classList.remove("show");

    /* Abrir directamente cantidad */

    openGrams(

        state.selectedFood

    );

}

/* ==========================================================
   EVENTOS
========================================================== */

ui.importSave.onclick=

    importFood;

ui.importManual.onclick=()=>{

    ui.importModal.classList.remove("show");

    newFood();

};

ui.closeImport.onclick=()=>{

    ui.importModal.classList.remove("show");

    ui.library.classList.add("show");

};

ui.importModal.onclick=e=>{

    if(e.target===ui.importModal){

        ui.importModal.classList.remove("show");

        ui.library.classList.add("show");

    }

};

ui.importInput.addEventListener(

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
   PLANTILLAS SOPORTADAS
========================================================== */

/*

✔ Leche semidesnatada

Cantidad: 200 ml

94 kcal

Proteínas: 6,4 g

Hidratos: 9,6 g

Grasas: 3,2 g


✔ Tomate rallado

50 g

10 kcal

Proteínas 0,7 g

Carbohidratos 2 g

Grasas 0,1 g


✔ Yogur griego

Valores nutricionales

Por 100 g

59 kcal

Proteínas 10 g

Hidratos 3,6 g

Grasas 0,4 g


✔ Coca-Cola Zero

330 ml

1 kcal

Proteínas 0 g

Hidratos 0 g

Grasas 0 g

*/

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V6.0
   PARTE 6/12
   Gestión de comidas
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

    ui.library.classList.remove("show");

    ui.gramsModal.classList.add("show");

    lockScroll();

    requestAnimationFrame(()=>{

        ui.gramsInput.focus();

        ui.gramsInput.select();

    });

}

function closeGrams(){

    ui.gramsModal.classList.remove("show");

    ui.library.classList.add("show");

    unlockScroll();

}

/* ==========================================================
   CREAR ALIMENTO
========================================================== */

function buildMealFood(food,grams){

    const factor=

        grams/(food.base||100);

    return{

        id:uid(),

        foodId:food.id,

        emoji:food.emoji,

        name:food.name,

        grams,

        unit:food.unit,

        kcal:Math.round(

            food.kcal*factor

        ),

        protein:Number(

            (food.protein*factor)

            .toFixed(1)

        ),

        carbs:Number(

            (food.carbs*factor)

            .toFixed(1)

        ),

        fat:Number(

            (food.fat*factor)

            .toFixed(1)

        )

    };

}

/* ==========================================================
   AÑADIR
========================================================== */

async function addFoodToMeal(){

    const grams=

        number(ui.gramsInput.value);

    if(grams<=0){

        toast("Cantidad incorrecta");

        return;

    }

    state.meals

        [state.currentMeal]

        .push(

            buildMealFood(

                state.selectedFood,

                grams

            )

        );

    await saveMeals();

    closeGrams();

    refresh();

}

/* ==========================================================
   EDITAR
========================================================== */

function openMealEditor(meal,index){

    state.editingMeal={

        meal,

        index

    };

    const item=

        state.meals[meal][index];

    ui.editMealName.textContent=

        item.name;

    ui.editMealGrams.value=

        item.grams;

    lockScroll();

    ui.editMealModal.classList.add("show");

    requestAnimationFrame(()=>{

        ui.editMealGrams.focus();

        ui.editMealGrams.select();

    });

}

function closeMealEditor(){

    ui.editMealModal.classList.remove("show");

    unlockScroll();

}

/* ==========================================================
   GUARDAR
========================================================== */

async function saveMealEditor(){

    const grams=

        number(

            ui.editMealGrams.value

        );

    if(grams<=0){

        toast("Cantidad incorrecta");

        return;

    }

    const meal=

        state.editingMeal.meal;

    const index=

        state.editingMeal.index;

    const item=

        state.meals[meal][index];

    const food=

        foodById(item.foodId);

    Object.assign(

        item,

        buildMealFood(

            food,

            grams

        ),

        {

            id:item.id

        }

    );

    await saveMeals();

    closeMealEditor();

    refresh();

}

/* ==========================================================
   ELIMINAR
========================================================== */

async function deleteMealFood(){

    const{

        meal,

        index

    }=state.editingMeal;

    state.meals[meal]

        .splice(index,1);

    await saveMeals();

    closeMealEditor();

    refresh();

}

/* ==========================================================
   RENDER
========================================================== */

function renderMeals(){

    $$(".meal").forEach(card=>{

        const meal=

            card.dataset.meal;

        const foods=

            state.meals[meal];

        const preview=

            card.querySelector(

                ".meal-preview"

            );

        const empty=

            card.querySelector(

                ".emptyMeal"

            );

        const total=

            card.querySelector(

                ".meal-total"

            );

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

            const row=

                document.createElement("div");

            row.className=

                "preview-item";

            row.innerHTML=

`
<div>

<div class="food-name">

${food.emoji||"🍽️"} ${food.name}

</div>

<div class="food-brand">

${food.grams} ${food.unit}

</div>

</div>

<div class="food-kcal">

${food.kcal} kcal

</div>
`;

            row.addEventListener(

                "pointerup",

                e=>{

                    e.stopPropagation();

                    openMealEditor(

                        meal,

                        index

                    );

                }

            );

            preview.appendChild(

                row

            );

        });

        total.innerHTML=

`<strong>

${Math.round(kcal)} kcal

</strong>`;

    });

}

/* ==========================================================
   EVENTOS
========================================================== */

ui.acceptGrams.onclick=

    addFoodToMeal;

ui.cancelGrams.onclick=

    closeGrams;

ui.saveMeal.onclick=

    saveMealEditor;

ui.deleteMeal.onclick=

    deleteMealFood;

ui.closeMeal.onclick=

    closeMealEditor;
    
/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V6.0
   PARTE 7/12
   Editor de alimentos + Modales + Toast
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

    ui.importModal.classList.remove("show");

    ui.editFoodModal.classList.add("show");

    lockScroll();

}

/* ==========================================================
   EDITAR ALIMENTO
========================================================== */

function editFood(food){

    state.editingFood=food;

    ui.foodName.value=food.name;

    ui.foodBrand.value=food.brand||"";

    ui.foodCategory.value=food.category||"";

    ui.foodBase.value=food.base;

    ui.foodUnit.value=food.unit;

    ui.foodKcal.value=food.kcal;

    ui.foodProtein.value=food.protein;

    ui.foodCarbs.value=food.carbs;

    ui.foodFat.value=food.fat;

    ui.editFoodModal.classList.add("show");

    lockScroll();

}

/* ==========================================================
   CERRAR EDITOR
========================================================== */

function closeFoodEditor(){

    ui.editFoodModal.classList.remove("show");

    ui.library.classList.add("show");

    unlockScroll();

}

/* ==========================================================
   GUARDAR
========================================================== */

async function saveFoodEditor(){

    const food={

        id:state.editingFood

            ? state.editingFood.id

            : uid(),

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

        toast("Introduce un nombre.");

        return;

    }

    const index=

        state.foods.findIndex(

            f=>f.id===food.id

        );

    if(index===-1){

        state.foods.push(food);

    }

    else{

        state.foods[index]=food;

    }

    await saveFoods();

    closeFoodEditor();

    refresh();

    toast("Alimento guardado.");

}

/* ==========================================================
   ELIMINAR
========================================================== */

async function deleteFood(id){

    state.foods=

        state.foods.filter(

            f=>f.id!==id

        );

    await saveFoods();

    refresh();

    toast("Alimento eliminado.");

}

/* ==========================================================
   TOAST
========================================================== */

let toastTimer;

function toast(text){

    let box=$("toast");

    if(!box){

        box=document.createElement("div");

        box.id="toast";

        box.className="toast";

        document.body.appendChild(box);

    }

    box.textContent=text;

    box.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer=setTimeout(()=>{

        box.classList.remove("show");

    },1800);

}

/* ==========================================================
   EVENTOS
========================================================== */

ui.saveFoodEdit.onclick=

    saveFoodEditor;

ui.cancelFoodEdit.onclick=

    closeFoodEditor;

ui.editFoodModal.onclick=e=>{

    if(e.target===ui.editFoodModal){

        closeFoodEditor();

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

                saveFoodEditor();

            }

        }

    );

});

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V6.0
   PARTE 8/12
   Inicialización + Eventos Globales
========================================================== */

/* ==========================================================
   CERRAR TODOS LOS MODALES
========================================================== */

function closeAllModals(){

    ui.library.classList.remove("show");

    ui.importModal.classList.remove("show");

    ui.editFoodModal.classList.remove("show");

    ui.gramsModal.classList.remove("show");

    ui.editMealModal.classList.remove("show");

    unlockScroll();

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

/* ==========================================================
   CÍRCULO
========================================================== */

document

.querySelector(".ring")

.addEventListener(

    "pointerup",

    copySummary

);

/* ==========================================================
   TARJETAS DE COMIDA
========================================================== */

$$(".meal").forEach(card=>{

    card.addEventListener(

        "pointerup",

        e=>{

            if(

                e.target.closest(

                    ".preview-item"

                )

            ){

                return;

            }

            openLibrary(

                card.dataset.meal

            );

        }

    );

});

/* ==========================================================
   CIERRE MODALES
========================================================== */

[
    ui.library,
    ui.importModal,
    ui.gramsModal,
    ui.editFoodModal,
    ui.editMealModal

].forEach(modal=>{

    modal.addEventListener(

        "pointerdown",

        e=>{

            if(e.target===modal){

                closeAllModals();

            }

        }

    );

});

/* ==========================================================
   REFRESCO AUTOMÁTICO
========================================================== */

window.addEventListener(

    "focus",

    refresh

);

window.addEventListener(

    "storage",

    async()=>{

        await loadApp();

        refresh();

    }

);

setInterval(

    updateGreeting,

    60000

);

/* ==========================================================
   INICIALIZAR
========================================================== */

async function init(){

    await loadApp();

    refresh();

    console.log(

        "%cMi Nutrición NEXT V6.0",

        "color:#34c759;font-size:18px;font-weight:bold"

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
   app.js V6.0
   PARTE 9/12
   Menú contextual iPhone
========================================================== */

/* ==========================================================
   MENÚ CONTEXTUAL
========================================================== */

function showContextMenu(title,buttons){

    let modal=$("contextMenu");

    if(!modal){

        modal=document.createElement("div");

        modal.id="contextMenu";

        modal.className="modal show";

        modal.innerHTML=`

<div class="sheet sheet-small">

<h2 id="contextTitle"></h2>

<div id="contextButtons"></div>

</div>

`;

        document.body.appendChild(modal);

    }

    $("contextTitle").textContent=title;

    const list=$("contextButtons");

    list.innerHTML="";

    buttons.forEach(button=>{

        const b=document.createElement("button");

        b.className="sheet-button";

        b.textContent=button.text;

        b.onclick=()=>{

            closeContextMenu();

            button.action();

        };

        list.appendChild(b);

    });

    modal.classList.add("show");

    lockScroll();

}

function closeContextMenu(){

    const modal=$("contextMenu");

    if(!modal){

        return;

    }

    modal.classList.remove("show");

    unlockScroll();

}

/* ==========================================================
   MENÚ BIBLIOTECA
========================================================== */

function openFoodMenu(food){

    showContextMenu(

        food.name,

        [

            {

                text:"✏️ Editar",

                action:()=>{

                    editFood(food);

                }

            },

            {

                text:"🗑️ Eliminar",

                action:()=>{

                    deleteFood(food.id);

                }

            },

            {

                text:"Cancelar",

                action:()=>{}

            }

        ]

    );

}

/* ==========================================================
   MENÚ COMIDA
========================================================== */

function openMealMenu(meal,index){

    showContextMenu(

        state.meals[meal][index].name,

        [

            {

                text:"✏️ Editar cantidad",

                action:()=>{

                    openMealEditor(

                        meal,

                        index

                    );

                }

            },

            {

                text:"🗑️ Eliminar",

                action:()=>{

                    state.editingMeal={

                        meal,

                        index

                    };

                    deleteMealFood();

                }

            },

            {

                text:"Cancelar",

                action:()=>{}

            }

        ]

    );

}

/* ==========================================================
   CERRAR
========================================================== */

document.addEventListener(

    "pointerdown",

    e=>{

        const menu=$("contextMenu");

        if(

            menu &&

            e.target===menu

        ){

            closeContextMenu();

        }

    }

);

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V6.0
   PARTE 10/12
   Render iPhone + UX
========================================================== */

/* ==========================================================
   TARJETA DE COMIDA
========================================================== */

function createMealRow(food,meal,index){

    const row=document.createElement("div");

    row.className="preview-item fade-in";

    row.innerHTML=`

<div class="preview-left">

    <div class="preview-title">

        ${food.emoji||"🍽️"} ${food.name}

    </div>

    <div class="preview-subtitle">

        ${food.grams} ${food.unit}

    </div>

</div>

<div class="preview-right">

    ${Math.round(food.kcal)} kcal

</div>

`;

    /* ---------- Toque ---------- */

    row.addEventListener(

        "pointerup",

        e=>{

            e.stopPropagation();

            openMealEditor(

                meal,

                index

            );

        }

    );

    /* ---------- Pulsación larga ---------- */

    let timer;

    row.addEventListener(

        "pointerdown",

        ()=>{

            timer=setTimeout(()=>{

                openMealMenu(

                    meal,

                    index

                );

            },600);

        }

    );

    [

        "pointerup",

        "pointerleave",

        "pointercancel"

    ].forEach(event=>{

        row.addEventListener(

            event,

            ()=>clearTimeout(timer)

        );

    });

    return row;

}

/* ==========================================================
   RENDER
========================================================== */

function renderMeals(){

    $$(".meal").forEach(card=>{

        const meal=

            card.dataset.meal;

        const foods=

            state.meals[meal];

        const preview=

            card.querySelector(

                ".meal-preview"

            );

        const empty=

            card.querySelector(

                ".emptyMeal"

            );

        const total=

            card.querySelector(

                ".meal-total"

            );

        preview.innerHTML="";

        if(!foods.length){

            empty.style.display="block";

            total.innerHTML=

                "<strong>0 kcal</strong>";

            return;

        }

        empty.style.display="none";

        let kcal=0;

        foods.forEach((food,index)=>{

            kcal+=food.kcal;

            preview.appendChild(

                createMealRow(

                    food,

                    meal,

                    index

                )

            );

        });

        total.innerHTML=

`<strong>

${Math.round(kcal)} kcal

</strong>`;

    });

}

/* ==========================================================
   REFRESCO
========================================================== */

function refresh(){

    refreshDashboard();

    renderMeals();

    renderFoods(

        ui.search.value

    );

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V6.0
   PARTE 11/12
   Optimización + Limpieza
========================================================== */

/* ==========================================================
   CERRAR MODALES
========================================================== */

function closeModal(modal){

    if(!modal){

        return;

    }

    modal.classList.remove("show");

}

function openModal(modal){

    if(!modal){

        return;

    }

    lockScroll();

    modal.classList.add("show");

}

function closeAllModals(){

    [

        ui.library,

        ui.importModal,

        ui.gramsModal,

        ui.editFoodModal,

        ui.editMealModal,

        $("contextMenu")

    ].forEach(closeModal);

    unlockScroll();

}

/* ==========================================================
   REFRESCO DIFERIDO
========================================================== */

let refreshFrame=null;

function requestRefresh(){

    if(refreshFrame){

        cancelAnimationFrame(

            refreshFrame

        );

    }

    refreshFrame=

        requestAnimationFrame(

            ()=>{

                refresh();

            }

        );

}

/* ==========================================================
   RECALCULAR COMIDAS
========================================================== */

async function recalculateMeals(){

    Object.keys(state.meals)

    .forEach(meal=>{

        state.meals[meal]

        .forEach(item=>{

            const food=

                foodById(

                    item.foodId

                );

            if(!food){

                return;

            }

            const factor=

                item.grams/

                (food.base||100);

            item.name=food.name;

            item.emoji=food.emoji;

            item.unit=food.unit;

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

    requestRefresh();

}

/* ==========================================================
   SINCRONIZAR
========================================================== */

async function sync(){

    await loadApp();

    requestRefresh();

}

/* ==========================================================
   EVENTOS GLOBALES
========================================================== */

window.addEventListener(

    "storage",

    sync

);

window.addEventListener(

    "focus",

    sync

);

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(

            document.visibilityState===

            "visible"

        ){

            sync();

        }

    }

);

/* ==========================================================
   ATAJOS
========================================================== */

window.addEventListener(

    "keydown",

    e=>{

        if(

            e.ctrlKey &&

            e.key==="f"

        ){

            e.preventDefault();

            if(

                ui.library.classList.contains(

                    "show"

                )

            ){

                ui.search.focus();

            }

        }

    }

);

/* ==========================================================
   LIMPIEZA
========================================================== */

console.clear();

console.log(

    "%cMi Nutrición NEXT V6",

    "color:#34c759;font-size:18px;font-weight:bold"

);

console.log(

    "✔ Eventos unificados"

);

console.log(

    "✔ Pointer Events"

);

console.log(

    "✔ Parser V6"

);

console.log(

    "✔ Render optimizado"

);

console.log(

    "✔ UX mejorada"

);

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V6.0
   PARTE 12/12
   API pública + Inicio
========================================================== */

/* ==========================================================
   RECARGAR
========================================================== */

async function reload(){

    await loadApp();

    requestRefresh();

}

/* ==========================================================
   REINICIAR
========================================================== */

async function resetApp(){

    if(!confirm(

        "¿Reiniciar la aplicación?"

    )){

        return;

    }

    await DB.resetDatabase();

    await loadApp();

    requestRefresh();

    toast(

        "Aplicación reiniciada"

    );

}

/* ==========================================================
   EXPORTAR INFORME
========================================================== */

function downloadSummary(){

    const blob=new Blob(

        [

            buildSummary()

        ],

        {

            type:"text/plain"

        }

    );

    const url=

        URL.createObjectURL(blob);

    const link=

        document.createElement("a");

    link.href=url;

    link.download=

        `MiNutricion-${state.currentDate}.txt`;

    link.click();

    URL.revokeObjectURL(url);

}

/* ==========================================================
   API PÚBLICA
========================================================== */

window.miNutricion={

    version:"6.0",

    state,

    reload,

    refresh,

    sync,

    resetApp,

    loadApp,

    saveMeals,

    saveFoods,

    buildSummary,

    copySummary,

    downloadSummary,

    recalculateMeals,

    openLibrary,

    closeLibrary,

    openGrams,

    openMealEditor,

    editFood,

    newFood

};

/* ==========================================================
   INFORMACIÓN
========================================================== */

console.table({

    Aplicacion:"Mi Nutrición NEXT",

    Version:"6.0",

    Fecha:state.currentDate,

    Alimentos:state.foods.length,

    Objetivo:state.settings.kcalGoal

});

console.log(

    "%cMi Nutrición NEXT V6 lista",

    "color:#34c759;font-size:18px;font-weight:bold"

);

/* ==========================================================
   INICIO
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    async()=>{

        await loadApp();

        refresh();

    }

);

/* ==========================================================
   FIN DEL ARCHIVO
========================================================== */