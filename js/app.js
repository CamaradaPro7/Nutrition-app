/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.2
   PARTE 1/8
========================================================== */

"use strict";

/* ==========================================================
   ESTADO GLOBAL
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

    lastScroll:0

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

    totalKcal:$("totalKcal"),

    protein:$("protein"),

    carbs:$("carbs"),

    fat:$("fat"),

    ring:$("ringProgress"),

    meals:$("meals"),

    library:$("modal"),

    sheetTitle:$("sheetTitle"),

    search:$("searchFood"),

    results:$("foodResults"),

    newFood:$("newFoodBtn"),

    closeLibrary:$("closeFoodModal"),

    gramsModal:$("gramsModal"),

    gramsInput:$("gramsInput"),

    selectedFood:$("selectedFood"),

    acceptGrams:$("acceptGrams"),

    cancelGrams:$("cancelGrams"),

    importModal:$("newFoodModal"),

    importInput:$("jsonInput"),

    importSave:$("saveFood"),

    importManual:$("manualFoodBtn"),

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

    closeImport:$("closeNewFood"),

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
   MODALES
========================================================== */

function closeAllModals(){

    ui.library.classList.remove("show");

    ui.gramsModal.classList.remove("show");

    ui.importModal.classList.remove("show");

    ui.editFoodModal.classList.remove("show");

    if(ui.editMealModal){

        ui.editMealModal.classList.remove("show");

    }

    unlockScroll();

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.2
   PARTE 2/8
   Dashboard + Informe ChatGPT
========================================================== */

/* ==========================================================
   FECHA
========================================================== */

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

            totals.kcal+=food.kcal;

            totals.protein+=food.protein;

            totals.carbs+=food.carbs;

            totals.fat+=food.fat;

        });

    });

    return totals;

}

/* ==========================================================
   DASHBOARD
========================================================== */

function refreshDashboard(){

    const t=

        calculateTotals();

    ui.totalKcal.textContent=

        Math.round(t.kcal);

    ui.protein.textContent=

        `${t.protein.toFixed(1)} g`;

    ui.carbs.textContent=

        `${t.carbs.toFixed(1)} g`;

    ui.fat.textContent=

        `${t.fat.toFixed(1)} g`;

    const percent=Math.min(

        t.kcal/

        state.settings.kcalGoal,

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

    const meals=[

        "desayuno",

        "comida",

        "merienda",

        "cena"

    ];

    meals.forEach(meal=>{

        if(!state.meals[meal].length){

            return;

        }

        text+=`\n\n${meal.toUpperCase()}\n`;

        state.meals[meal].forEach(food=>{

            text+=

`• ${food.name} (${food.grams}${food.unit}) - ${food.kcal} kcal\n`;

        });

    });

    return text;

}

/* ==========================================================
   COPIAR INFORME
========================================================== */

async function copySummary(){

    try{

        await navigator.clipboard.writeText(

            buildSummary()

        );

    }

    catch{

        const area=

            document.createElement(

                "textarea"

            );

        area.value=

            buildSummary();

        document.body.appendChild(

            area

        );

        area.select();

        document.execCommand(

            "copy"

        );

        area.remove();

    }

    toast(

        "📋 Informe copiado"

    );

}

/* ==========================================================
   TOAST
========================================================== */

let toastTimer=null;

function toast(text){

    let el=

        $("toast");

    if(!el){

        el=document.createElement(

            "div"

        );

        el.id="toast";

        el.style.cssText=`

position:fixed;
left:50%;
bottom:30px;
transform:translateX(-50%);
background:#222;
color:#fff;
padding:14px 22px;
border-radius:16px;
font-weight:700;
z-index:9999;
opacity:0;
transition:.25s;
`;

        document.body.appendChild(

            el

        );

    }

    el.textContent=text;

    el.style.opacity=1;

    clearTimeout(

        toastTimer

    );

    toastTimer=setTimeout(()=>{

        el.style.opacity=0;

    },1800);

}

/* ==========================================================
   REFRESCO GENERAL
========================================================== */

function refresh(){

    updateGreeting();

    refreshDashboard();

    renderMeals();

    renderFoods(

        ui.search.value

    );

}

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.2
   PARTE 3/8
   Biblioteca
========================================================== */

/* ==========================================================
   ABRIR / CERRAR
========================================================== */

function openLibrary(meal){

    state.currentMeal=meal;

    const titles={

        desayuno:"🍳 Desayuno",

        comida:"🍝 Comida",

        merienda:"🥪 Merienda",

        cena:"🌙 Cena"

    };

    ui.sheetTitle.textContent=titles[meal];

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

    ui.results.innerHTML="";

    const text=normalize(filter);

    const foods=state.foods

        .filter(food=>

            normalize(food.name).includes(text)

            ||

            normalize(food.brand||"").includes(text)

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

        const card=document.createElement("div");

        card.className="food-item fade-in";

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

        /* Pulsación normal */

        card.onclick=()=>{

            openGrams(food);

        };

        /* Pulsación larga */

        let timer=null;

        const start=()=>{

            timer=setTimeout(()=>{

                openFoodMenu(food);

            },600);

        };

        const stop=()=>{

            clearTimeout(timer);

        };

        card.addEventListener(

            "mousedown",

            start

        );

        card.addEventListener(

            "touchstart",

            start,

            {passive:true}

        );

        [

            "mouseup",

            "mouseleave",

            "touchend",

            "touchcancel"

        ].forEach(evt=>

            card.addEventListener(

                evt,

                stop

            )

        );

        ui.results.appendChild(card);

    });

}

/* ==========================================================
   MENÚ CONTEXTUAL
========================================================== */

function openFoodMenu(food){

    const action=prompt(

`"${food.name}"

1 = Editar

2 = Eliminar`

    );

    if(action==="1"){

        editFood(food);

        return;

    }

    if(action==="2"){

        deleteFood(food.id);

    }

}

/* ==========================================================
   ELIMINAR
========================================================== */

async function deleteFood(id){

    if(!confirm(

        "¿Eliminar este alimento de la biblioteca?"

    )){

        return;

    }

    state.foods=

        state.foods.filter(

            f=>f.id!==id

        );

    await saveFoods();

    renderFoods(

        ui.search.value

    );

}

/* ==========================================================
   BUSCADOR
========================================================== */

ui.search.oninput=()=>{

    renderFoods(

        ui.search.value

    );

};

/* ==========================================================
   EVENTOS
========================================================== */

ui.newFood.onclick=()=>{

    ui.library.classList.remove("show");

    ui.importModal.classList.add("show");

    ui.importInput.value="";

    setTimeout(()=>{

        ui.importInput.focus();

    },120);

};

ui.closeLibrary.onclick=

    closeLibrary;

ui.library.onclick=e=>{

    if(e.target===ui.library){

        closeLibrary();

    }

};

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.2
   PARTE 4/8
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

    if(lines.length){

        food.name=lines[0];

    }

    lines.forEach(line=>{

        const m=line.match(

            /(\d+[.,]?\d*)/

        );

        if(!m){

            return;

        }

        const value=number(m[1]);

        if(/100\s*ml/i.test(line)){

            food.base=100;

            food.unit="ml";

        }

        if(/100\s*g/i.test(line)){

            food.base=100;

            food.unit="g";

        }

        if(/kcal|energ|calor/i.test(line)){

            food.kcal=value;

        }

        if(/prote/i.test(line)){

            food.protein=value;

        }

        if(/hidr|carbo/i.test(line)){

            food.carbs=value;

        }

        if(/gras/i.test(line)){

            food.fat=value;

        }

    });

    return food;

}

/* ==========================================================
   IMPORTAR
========================================================== */

async function importFood(){

    const text=

        ui.importInput.value.trim();

    const type=

        detectImport(text);

    if(type==="empty"){

        toast(

            "Pega primero el texto."

        );

        return;

    }

    let food;

    if(type==="json"){

        food=

            JSON.parse(text);

        if(!food.id){

            food.id=uid();

        }

    }

    else{

        food=

            parseChatGPTFood(text);

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

    ui.importInput.value="";

    ui.importModal.classList.remove(

        "show"

    );

    renderFoods();

    toast(

        "Alimento guardado"

    );

    /* Abrir directamente la cantidad */

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

    ui.importModal.classList.remove(

        "show"

    );

    newFood();

};

ui.closeImport.onclick=()=>{

    ui.importModal.classList.remove(

        "show"

    );

    ui.library.classList.add(

        "show"

    );

};

ui.importModal.onclick=e=>{

    if(e.target===ui.importModal){

        ui.importModal.classList.remove(

            "show"

        );

        ui.library.classList.add(

            "show"

        );

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
   MI NUTRICIÓN NEXT
   app.js V5.2
   PARTE 5/8
   Editor manual
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
   EDITAR
========================================================== */

function editFood(food){

    state.editingFood=food;

    ui.foodName.value=food.name;

    ui.foodBrand.value=food.brand||"";

    ui.foodCategory.value=food.category||"";

    ui.foodBase.value=food.base||100;

    ui.foodUnit.value=food.unit||"g";

    ui.foodKcal.value=food.kcal;

    ui.foodProtein.value=food.protein;

    ui.foodCarbs.value=food.carbs;

    ui.foodFat.value=food.fat;

    lockScroll();

    ui.editFoodModal.classList.add("show");

}

/* ==========================================================
   CERRAR
========================================================== */

function closeFoodEditor(){

    ui.editFoodModal.classList.remove("show");

    ui.library.classList.add("show");

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

    renderFoods(ui.search.value);

    closeFoodEditor();

    toast("Alimento guardado.");

}

/* ==========================================================
   ELIMINAR
========================================================== */

async function removeEditingFood(){

    if(!state.editingFood){

        return;

    }

    state.foods=

        state.foods.filter(

            food=>

            food.id!==state.editingFood.id

        );

    await saveFoods();

    state.editingFood=null;

    renderFoods(ui.search.value);

    closeFoodEditor();

    toast("Alimento eliminado.");

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
   app.js V5.2
   PARTE 6/8
   Gestión de comidas
========================================================== */

/* ==========================================================
   ABRIR CANTIDAD
========================================================== */

function openGrams(food){

    state.selectedFood=food;

    state.editingMeal=null;

    ui.selectedFood.textContent=

        `${food.emoji||"🍽️"} ${food.name}`;

    ui.gramsInput.value=

        food.base||100;

    ui.library.classList.remove("show");

    ui.gramsModal.classList.add("show");

    lockScroll();

    setTimeout(()=>{

        ui.gramsInput.focus();

        ui.gramsInput.select();

    },120);

}

/* ==========================================================
   EDITAR ALIMENTO DEL DÍA
========================================================== */

function openMealEditor(meal,index){

    const item=

        state.meals[meal][index];

    if(!item){

        return;

    }

    state.editingMeal={

        meal,

        index

    };

    ui.editMealName.textContent=

        `${item.emoji||"🍽️"} ${item.name}`;

    ui.editMealGrams.value=

        item.grams;

    lockScroll();

    ui.editMealModal.classList.add("show");

    setTimeout(()=>{

        ui.editMealGrams.focus();

        ui.editMealGrams.select();

    },120);

}

function closeMealEditor(){

    ui.editMealModal.classList.remove("show");

    unlockScroll();

}

/* ==========================================================
   AÑADIR ALIMENTO
========================================================== */

async function addFoodToMeal(){

    const grams=

        number(ui.gramsInput.value);

    if(grams<=0){

        toast("Cantidad no válida.");

        return;

    }

    const factor=

        grams/(state.selectedFood.base||100);

    state.meals

        [state.currentMeal]

        .push({

            id:uid(),

            foodId:state.selectedFood.id,

            emoji:state.selectedFood.emoji,

            name:state.selectedFood.name,

            grams,

            unit:state.selectedFood.unit,

            kcal:Math.round(

                state.selectedFood.kcal*factor

            ),

            protein:Number(

                (state.selectedFood.protein*factor)

                .toFixed(1)

            ),

            carbs:Number(

                (state.selectedFood.carbs*factor)

                .toFixed(1)

            ),

            fat:Number(

                (state.selectedFood.fat*factor)

                .toFixed(1)

            )

        });

    await saveMeals();

    ui.gramsModal.classList.remove("show");

    unlockScroll();

    refresh();

}

/* ==========================================================
   GUARDAR EDICIÓN
========================================================== */

async function saveMealEditor(){

    const grams=

        number(ui.editMealGrams.value);

    if(grams<=0){

        toast("Cantidad no válida.");

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

    if(!food){

        toast("No existe el alimento.");

        return;

    }

    const factor=

        grams/(food.base||100);

    item.grams=grams;

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

    await saveMeals();

    closeMealEditor();

    refresh();

}

/* ==========================================================
   BORRAR DEL DÍA
========================================================== */

async function deleteMealFood(){

    const meal=

        state.editingMeal.meal;

    const index=

        state.editingMeal.index;

    state.meals[meal].splice(

        index,

        1

    );

    await saveMeals();

    closeMealEditor();

    refresh();

}

/* ==========================================================
   RENDER COMIDAS
========================================================== */

function renderMeals(){

    $$(".meal").forEach(card=>{

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

            const row=

                document.createElement("div");

            row.className="preview-item";

            row.style.cursor="pointer";

            row.innerHTML=`

<span>

${food.name}

</span>

<span>

${food.grams}${food.unit}

·

${food.kcal} kcal

</span>

`;

            row.onclick=e=>{

                e.stopPropagation();

                openMealEditor(

                    meal,

                    index

                );

            };

            preview.appendChild(row);

        });

        total.innerHTML=

        `<strong>${Math.round(kcal)} kcal</strong>`;

    });

}

/* ==========================================================
   EVENTOS
========================================================== */

ui.acceptGrams.onclick=

    addFoodToMeal;

ui.cancelGrams.onclick=()=>{

    ui.gramsModal.classList.remove("show");

    ui.library.classList.add("show");

};

ui.saveMeal.onclick=

    saveMealEditor;

ui.deleteMeal.onclick=

    deleteMealFood;

ui.closeMeal.onclick=

    closeMealEditor;
    
    /* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.2
   PARTE 7/8
   Inicialización + Eventos globales
========================================================== */

/* ==========================================================
   EVENTOS TARJETAS
========================================================== */

function bindMealCards(){

    $$(".meal").forEach(card=>{

        card.onclick=()=>{

            openLibrary(

                card.dataset.meal

            );

        };

    });

}

/* ==========================================================
   CERRAR MODALES
========================================================== */

window.addEventListener(

    "keydown",

    e=>{

        if(e.key==="Escape"){

            closeAllModals();

        }

    }

);

ui.library.onclick=e=>{

    if(e.target===ui.library){

        closeLibrary();

    }

};

ui.importModal.onclick=e=>{

    if(e.target===ui.importModal){

        ui.importModal.classList.remove("show");

        ui.library.classList.add("show");

    }

};

ui.gramsModal.onclick=e=>{

    if(e.target===ui.gramsModal){

        ui.gramsModal.classList.remove("show");

        ui.library.classList.add("show");

    }

};

ui.editMealModal.onclick=e=>{

    if(e.target===ui.editMealModal){

        closeMealEditor();

    }

};

ui.editFoodModal.onclick=e=>{

    if(e.target===ui.editFoodModal){

        closeFoodEditor();

    }

};

/* ==========================================================
   CÍRCULO
========================================================== */

document

.querySelector(".ring")

.onclick=

    copySummary;

/* ==========================================================
   REFRESCO
========================================================== */

setInterval(

    updateGreeting,

    60000

);

/* ==========================================================
   INICIALIZACIÓN
========================================================== */

async function init(){

    await loadApp();

    bindMealCards();

    refresh();

    console.log(

        "%cMi Nutrición NEXT V5.2",

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
   SINCRONIZACIÓN
========================================================== */

window.addEventListener(

    "storage",

    async()=>{

        await loadApp();

        refresh();

    }

);

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js V5.2
   PARTE 8/8
   Final del archivo
========================================================== */

/* ==========================================================
   RECARGAR
========================================================== */

async function reload(){

    await loadApp();

    refresh();

}

/* ==========================================================
   REINICIAR
========================================================== */

async function resetApp(){

    if(!confirm(

        "¿Reiniciar toda la aplicación?"

    )){

        return;

    }

    await DB.resetDatabase();

    await reload();

    toast(

        "Aplicación reiniciada."

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

    const a=

        document.createElement("a");

    a.href=url;

    a.download=

        `Informe-${state.currentDate}.txt`;

    a.click();

    URL.revokeObjectURL(url);

}

/* ==========================================================
   API PÚBLICA
========================================================== */

window.miNutricion={

    state,

    reload,

    resetApp,

    buildSummary,

    copySummary,

    downloadSummary,

    loadApp,

    refresh,

    openLibrary,

    closeLibrary,

    openGrams,

    openMealEditor,

    editFood,

    newFood

};

/* ==========================================================
   DEBUG
========================================================== */

console.table({

    Aplicacion:"Mi Nutrición NEXT",

    Version:"5.2",

    Fecha:state.currentDate,

    Alimentos:state.foods.length

});

console.log(

    "%cMi Nutrición NEXT V5.2 iniciada",

    "color:#34c759;font-weight:bold;font-size:16px"

);

/* ==========================================================
   FIN DEL ARCHIVO
========================================================== */