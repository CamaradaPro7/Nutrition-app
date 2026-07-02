/* =====================================================
   MI NUTRICIÓN V3
   app.js
   PARTE 1/10
   Estado + Configuración + Utilidades
===================================================== */

/* =====================================================
   CONFIGURACIÓN
===================================================== */

const APP_NAME = "Mi Nutrición V3";

const STORAGE = {

    FOODS : "foodLibrary",

    MEALS : "miNutricion",

    SETTINGS : "miNutricionSettings"

};

const DAILY_GOAL = 2200;

/* =====================================================
   ESTADO
===================================================== */

let foods = JSON.parse(

    localStorage.getItem(STORAGE.FOODS)

) || [];

let meals = JSON.parse(

    localStorage.getItem(STORAGE.MEALS)

) || {

    desayuno:[],
    comida:[],
    merienda:[],
    cena:[]

};

let settings = JSON.parse(

    localStorage.getItem(STORAGE.SETTINGS)

) || {

    kcalGoal:DAILY_GOAL

};

let currentMeal = null;

let selectedFood = null;

let editingFood = null;

let editingMeal = null;

let editingIndex = null;

let lastScroll = 0;

/* =====================================================
   ELEMENTOS
===================================================== */

const $ = id => document.getElementById(id);

/* Dashboard */

const greeting = $("greeting");

const fecha = $("fecha");

const totalKcal = $("totalKcal");

const protein = $("protein");

const carbs = $("carbs");

const fat = $("fat");

const ring = document.querySelector(".ring-center");

/* Biblioteca */

const modal = $("modal");

const search = $("searchFood");

const foodResults = $("foodResults");

/* Cantidad */

const gramsModal = $("gramsModal");

const gramsInput = $("gramsInput");

const selectedFoodLabel = $("selectedFood");

/* Importar */

const newFoodModal = $("newFoodModal");

const jsonInput = $("jsonInput");

const jsonStatus = $("jsonStatus");

/* Editar */

const editFoodModal = $("editFoodModal");

const foodName = $("foodName");

const foodBrand = $("foodBrand");

const foodCategory = $("foodCategory");

const foodBase = $("foodBase");

const foodUnit = $("foodUnit");

const foodKcal = $("foodKcal");

const foodProtein = $("foodProtein");

const foodCarbs = $("foodCarbs");

const foodFat = $("foodFat");

/* =====================================================
   GUARDAR
===================================================== */

function saveFoods(){

    localStorage.setItem(

        STORAGE.FOODS,

        JSON.stringify(foods)

    );

}

function saveMeals(){

    localStorage.setItem(

        STORAGE.MEALS,

        JSON.stringify(meals)

    );

}

function saveSettings(){

    localStorage.setItem(

        STORAGE.SETTINGS,

        JSON.stringify(settings)

    );

}

/* =====================================================
   UTILIDADES
===================================================== */

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

    return Date.now()

    +

    Math.floor(

        Math.random()*100000

    );

}

function existsFood(name){

    return foods.find(food=>

        normalize(food.name)

        ===

        normalize(name)

    );

}

function formatDate(date){

    return date.toLocaleDateString(

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
   MI NUTRICIÓN V3
   app.js
   PARTE 2/10
   Fecha + Saludo + Dashboard
===================================================== */

/* =====================================================
   SALUDO
===================================================== */

function updateGreeting(){

    const hour = new Date().getHours();

    let text = "Buenos días";

    if(hour >= 12 && hour < 21){

        text = "Buenas tardes";

    }else if(hour >= 21 || hour < 6){

        text = "Buenas noches";

    }

    if(greeting){

        greeting.textContent = text;

    }

}

/* =====================================================
   FECHA
===================================================== */

function updateDate(){

    if(!fecha) return;

    fecha.textContent = formatDate(

        new Date()

    );

}

/* =====================================================
   TOTALES
===================================================== */

function calculateTotals(){

    let kcal = 0;

    let prot = 0;

    let hc = 0;

    let grasas = 0;

    Object.values(meals)

    .flat()

    .forEach(food=>{

        kcal += Number(food.kcal || 0);

        prot += Number(food.protein || 0);

        hc += Number(food.carbs || 0);

        grasas += Number(food.fat || 0);

    });

    return{

        kcal,

        protein:prot,

        carbs:hc,

        fat:grasas

    };

}

/* =====================================================
   COLOR DEL CÍRCULO
===================================================== */

function updateRing(percent){

    if(!ring) return;

    ring.classList.remove(

        "green",

        "yellow",

        "orange",

        "red",

        "animate"

    );

    if(percent < 60){

        ring.classList.add("green");

    }

    else if(percent < 90){

        ring.classList.add("yellow");

    }

    else if(percent <= 100){

        ring.classList.add("orange");

    }

    else{

        ring.classList.add("red");

    }

    void ring.offsetWidth;

    ring.classList.add("animate");

}

/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard(){

    const totals = calculateTotals();

    totalKcal.textContent =

        Math.round(totals.kcal);

    protein.textContent =

        totals.protein.toFixed(1) + " g";

    carbs.textContent =

        totals.carbs.toFixed(1) + " g";

    fat.textContent =

        totals.fat.toFixed(1) + " g";

    const goal =

        settings.kcalGoal ||

        DAILY_GOAL;

    const percent =

        (totals.kcal / goal) * 100;

    updateRing(percent);

}

/* =====================================================
   REFRESCAR
===================================================== */

function refreshDashboard(){

    updateGreeting();

    updateDate();

    updateDashboard();

}

/* =====================================================
   MI NUTRICIÓN V3
   app.js
   PARTE 3/10
   Biblioteca
===================================================== */

/* =====================================================
   MODAL BIBLIOTECA
===================================================== */

function openLibrary(meal){

    currentMeal = meal;

    if(search){

        search.value = "";

    }

    renderFoods();

    lastScroll = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${lastScroll}px`;
    document.body.style.width = "100%";

    modal.classList.add("show");

}

function closeLibrary(){

    modal.classList.remove("show");

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    window.scrollTo(0,lastScroll);

}

/* =====================================================
   RENDER
===================================================== */

function renderFoods(filter=""){

    foodResults.innerHTML = "";

    const list = foods

    .filter(food=>

        normalize(food.name)

        .includes(

            normalize(filter)

        )

    )

    .sort((a,b)=>

        a.name.localeCompare(

            b.name,

            "es"

        )

    );

    if(list.length===0){

        foodResults.innerHTML=`

<div style="padding:40px;text-align:center;color:#8d97a6;">

📚

<br><br>

No hay alimentos

</div>

`;

        return;

    }

    list.forEach(food=>{

        const row =

        document.createElement("div");

        row.className =

        "food-item fade-in";

        row.innerHTML = `

<div style="flex:1;">

<div class="food-name">

${food.emoji || "🍽️"} ${food.name}

</div>

<div class="food-brand">

${food.brand || ""}

</div>

<div class="food-kcal">

${food.category || "Otros"}

·

${food.kcal} kcal

/

${food.base || 100}

${food.unit}

</div>

</div>

<div class="food-actions">

<button

class="icon-btn"

onclick="event.stopPropagation();editFood(${food.id});">

✏️

</button>

<button

class="icon-btn delete"

onclick="event.stopPropagation();deleteFood(${food.id});">

🗑️

</button>

</div>

`;

        row.onclick=()=>{

            editingMeal = null;

            editingIndex = null;

            openGrams(food);

        };

        foodResults.appendChild(row);

    });

}

/* =====================================================
   BORRAR
===================================================== */

function deleteFood(id){

    const food =

    foods.find(f=>f.id==id);

    if(!food) return;

    if(

        !confirm(

            `¿Eliminar "${food.name}"?`

        )

    ){

        return;

    }

    foods = foods.filter(

        f=>f.id!=id

    );

    saveFoods();

    renderFoods(

        search.value

    );

}

/* =====================================================
   EDITAR
===================================================== */

function editFood(id){

    const food =

    foods.find(f=>f.id==id);

    if(!food) return;

    editingFood = food;

    foodName.value = food.name || "";

    foodBrand.value = food.brand || "";

    foodCategory.value =

        food.category || "Otros";

    foodBase.value =

        food.base || 100;

    foodUnit.value =

        food.unit || "g";

    foodKcal.value =

        food.kcal || 0;

    foodProtein.value =

        food.protein || 0;

    foodCarbs.value =

        food.carbs || 0;

    foodFat.value =

        food.fat || 0;

    editFoodModal.classList.add("show");

}

/* =====================================================
   BUSCADOR
===================================================== */

search.addEventListener(

    "input",

    ()=>{

        renderFoods(

            search.value

        );

    }

);

/* =====================================================
   MI NUTRICIÓN V3
   app.js
   PARTE 4/10
   Importación inteligente
===================================================== */

/* =====================================================
   DETECTAR FORMATO
===================================================== */

function detectImport(text){

    text = text.trim();

    if(!text) return "empty";

    if(text.startsWith("{")){

        return "json";

    }

    if(

        text.includes("kcal") ||

        text.includes("Proteínas") ||

        text.includes("Hidratos") ||

        text.includes("Grasas") ||

        text.includes("HC ")

    ){

        return "chatgpt";

    }

    return "unknown";

}

/* =====================================================
   IMPORTAR CHATGPT
===================================================== */

function importChatGPT(text){

    const lines = text

    .split("\n")

    .map(l=>l.trim())

    .filter(Boolean);

    let imported = 0;

    let updated = 0;

    for(let i=0;i<lines.length;i++){

        const name = lines[i];

        if(

            name.includes("kcal") ||

            name.includes("Proteínas") ||

            name.includes("Hidratos") ||

            name.includes("Grasas")

        ){

            continue;

        }

        const info = lines[i+1];

        if(!info) continue;

        if(!info.includes("kcal")) continue;

        const food = {

            id:createId(),

            emoji:"🍽️",

            name:name,

            brand:"",

            category:"Otros",

            unit:

                info.includes("ml")

                ? "ml"

                : "g",

            base:number(

                info.match(/^([\d.,]+)/)?.[1]

                || 100

            ),

            kcal:number(

                info.match(/=\s*([\d.,]+)/i)?.[1]

            ),

            protein:number(

                info.match(/P\s*([\d.,]+)/i)?.[1]

            ),

            carbs:number(

                info.match(/HC\s*([\d.,]+)/i)?.[1]

            ),

            fat:number(

                info.match(/G\s*([\d.,]+)/i)?.[1]

            )

        };

        const existing =

        existsFood(food.name);

        if(existing){

            Object.assign(existing,food);

            updated++;

        }else{

            foods.push(food);

            imported++;

        }

        i++;

    }

    saveFoods();

    renderFoods();

    alert(

`✅ ${imported} importados

🔄 ${updated} actualizados`

    );

}

/* =====================================================
   IMPORTAR JSON
===================================================== */

function importJSON(text){

    let data;

    try{

        data = JSON.parse(text);

    }catch{

        alert("JSON no válido");

        return;

    }

    const food={

        id:createId(),

        emoji:data.emoji || "🍽️",

        name:data.nombre || "",

        brand:data.marca || "",

        category:data.categoria || "Otros",

        unit:

        (data.unidad || "g")

        .replace(/^100\s*/,""),

        base:number(data.base || 100),

        kcal:number(data.kcal),

        protein:number(data.proteinas),

        carbs:number(data.hidratos),

        fat:number(data.grasas)

    };

    const existing =

    existsFood(food.name);

    if(existing){

        Object.assign(existing,food);

    }else{

        foods.push(food);

    }

    saveFoods();

    renderFoods();

    alert("✅ Alimento guardado");

}

/* =====================================================
   IMPORTAR
===================================================== */

function importFood(){

    const text =

    jsonInput.value

    .replace(/```json/g,"")

    .replace(/```/g,"")

    .trim();

    switch(

        detectImport(text)

    ){

        case "json":

            importJSON(text);

            break;

        case "chatgpt":

            importChatGPT(text);

            break;

        case "empty":

            alert("No hay datos");

            return;

        default:

            alert("Formato no reconocido");

            return;

    }

    jsonInput.value="";

    jsonStatus.textContent="";

    newFoodModal.classList.remove("show");

}

/* =====================================================
   BOTÓN IMPORTAR
===================================================== */

document

.getElementById("saveFood")

.onclick = importFood;

/* =====================================================
   MI NUTRICIÓN V3
   app.js
   PARTE 5/10
   Editor de alimentos
===================================================== */

/* =====================================================
   ABRIR EDITOR
===================================================== */

function openEditFood(food){

    editingFood = food;

    foodName.value = food.name || "";

    foodBrand.value = food.brand || "";

    foodCategory.value = food.category || "Otros";

    foodBase.value = food.base || 100;

    foodUnit.value = food.unit || "g";

    foodKcal.value = food.kcal || 0;

    foodProtein.value = food.protein || 0;

    foodCarbs.value = food.carbs || 0;

    foodFat.value = food.fat || 0;

    lastScroll = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${lastScroll}px`;
    document.body.style.width = "100%";

    editFoodModal.classList.add("show");

}

/* =====================================================
   CERRAR EDITOR
===================================================== */

function closeEditFood(){

    editFoodModal.classList.remove("show");

    editingFood = null;

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    window.scrollTo(0,lastScroll);

}

/* =====================================================
   GUARDAR CAMBIOS
===================================================== */

function saveEditedFood(){

    if(!editingFood) return;

    editingFood.name = foodName.value.trim();

    editingFood.brand = foodBrand.value.trim();

    editingFood.category =

        foodCategory.value.trim() || "Otros";

    editingFood.base =

        number(foodBase.value) || 100;

    editingFood.unit =

        foodUnit.value.trim() || "g";

    editingFood.kcal =

        number(foodKcal.value);

    editingFood.protein =

        number(foodProtein.value);

    editingFood.carbs =

        number(foodCarbs.value);

    editingFood.fat =

        number(foodFat.value);

    /* ==========================================
       ACTUALIZAR TODAS LAS COMIDAS
    ========================================== */

    Object.keys(meals).forEach(meal=>{

        meals[meal].forEach(item=>{

            if(item.name!==editingFood.name) return;

            const factor =

                item.grams /

                editingFood.base;

            item.brand = editingFood.brand;

            item.category = editingFood.category;

            item.unit = editingFood.unit;

            item.base = editingFood.base;

            item.kcal = Math.round(

                editingFood.kcal * factor

            );

            item.protein = Number(

                (editingFood.protein*factor)

                .toFixed(1)

            );

            item.carbs = Number(

                (editingFood.carbs*factor)

                .toFixed(1)

            );

            item.fat = Number(

                (editingFood.fat*factor)

                .toFixed(1)

            );

        });

    });

    saveFoods();

    saveMeals();

    renderFoods(search.value);

    renderMeals();

    refreshDashboard();

    closeEditFood();

    alert("✅ Alimento actualizado");

}

/* =====================================================
   BOTONES
===================================================== */

$("saveEditFood").onclick =

saveEditedFood;

$("cancelEditFood").onclick =

closeEditFood;

editFoodModal.onclick = e=>{

    if(e.target===editFoodModal){

        closeEditFood();

    }

};

/* =====================================================
   EDITAR DESDE BIBLIOTECA
===================================================== */

function editFood(id){

    const food = foods.find(

        f=>f.id==id

    );

    if(!food) return;

    openEditFood(food);

}

/* =====================================================
   MI NUTRICIÓN V3
   app.js
   PARTE 6/10
   Comidas
===================================================== */

/* =====================================================
   ABRIR CANTIDAD
===================================================== */

function openGrams(food){

    selectedFood = food;

    selectedFoodLabel.textContent =
        `${food.emoji || "🍽️"} ${food.name}`;

    gramsInput.value = food.base || 100;

    lastScroll = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${lastScroll}px`;
    document.body.style.width = "100%";

    gramsModal.classList.add("show");

    setTimeout(() => {

    gramsInput.focus({
        preventScroll: true
    });

}, 250);

}

/* =====================================================
   CERRAR CANTIDAD
===================================================== */

function closeGrams(){

    gramsModal.classList.remove("show");

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    window.scrollTo(0,lastScroll);

}

/* =====================================================
   AÑADIR / EDITAR ALIMENTO
===================================================== */

function saveMealFood(){

    const grams = number(gramsInput.value);

    if(grams<=0){

        alert("Cantidad no válida");

        return;

    }

    const factor =

        grams /

        (selectedFood.base || 100);

    const item = {

        id:createId(),

        foodId:selectedFood.id,

        emoji:selectedFood.emoji,

        name:selectedFood.name,

        brand:selectedFood.brand,

        category:selectedFood.category,

        unit:selectedFood.unit,

        base:selectedFood.base,

        grams,

        kcal:Math.round(selectedFood.kcal*factor),

        protein:Number(
            (selectedFood.protein*factor).toFixed(1)
        ),

        carbs:Number(
            (selectedFood.carbs*factor).toFixed(1)
        ),

        fat:Number(
            (selectedFood.fat*factor).toFixed(1)
        )

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

    refreshDashboard();

    closeGrams();

}

/* =====================================================
   EDITAR ALIMENTO DE UNA COMIDA
===================================================== */

function editMealFood(meal,index){

    const item = meals[meal][index];

    const original =

        foods.find(f=>f.id===item.foodId)

        ||

        existsFood(item.name);

    if(!original){

        alert("Ese alimento ya no existe en la biblioteca.");

        return;

    }

    editingMeal = meal;

    editingIndex = index;

    openGrams(original);

}

/* =====================================================
   ELIMINAR ALIMENTO
===================================================== */

function removeFood(meal,index){

    if(!confirm("¿Eliminar alimento?")){

        return;

    }

    meals[meal].splice(index,1);

    saveMeals();

    renderMeals();

    refreshDashboard();

}

/* =====================================================
   RENDER COMIDAS
===================================================== */

function renderMeals(){

    Object.keys(meals).forEach(meal=>{

        const card =

        document.querySelector(

            `[data-meal="${meal}"]`

        );

        if(!card) return;

        const list =

        card.querySelector(".meal-list");

        const empty =

        card.querySelector(".emptyMeal");

        list.innerHTML="";

        if(meals[meal].length===0){

            empty.style.display="block";

            return;

        }

        empty.style.display="none";

        let total = 0;

        meals[meal].forEach((food,index)=>{

            total += food.kcal;

            const row =

            document.createElement("div");

            row.className="food-item fade-in";

            row.innerHTML=`

<div
style="flex:1;cursor:pointer;"
onclick="editMealFood('${meal}',${index})">

<div class="food-name">

${food.emoji || "🍽️"} ${food.name}

</div>

<div class="food-brand">

${food.grams} ${food.unit}

</div>

</div>

<div class="food-actions">

<div class="food-kcal">

${food.kcal} kcal

</div>

<button

class="icon-btn delete"

onclick="
event.stopPropagation();
removeFood('${meal}',${index});
">

🗑️

</button>

</div>

`;

            list.appendChild(row);

        });

        const footer =

        document.createElement("div");

        footer.style.cssText=`

margin-top:18px;
padding-top:18px;
border-top:1px solid #2b3442;
display:flex;
justify-content:space-between;
font-weight:700;

`;

        footer.innerHTML=`

<span>Total</span>

<span>${Math.round(total)} kcal</span>

`;

        list.appendChild(footer);

    });

}

/* =====================================================
   BOTÓN AÑADIR
===================================================== */

acceptGrams.onclick = saveMealFood;

/* =====================================================
   MI NUTRICIÓN V3
   app.js
   PARTE 7/10
   Resumen + Copiar + Exportar
===================================================== */

/* =====================================================
   RESUMEN DEL DÍA
===================================================== */

function buildSummary(){

    let text = "";

    const names = {

        desayuno:"🍳 DESAYUNO",
        comida:"🍝 COMIDA",
        merienda:"🥪 MERIENDA",
        cena:"🌙 CENA"

    };

    Object.keys(meals).forEach(meal=>{

        if(meals[meal].length===0) return;

        text += names[meal] + "\n\n";

        meals[meal].forEach(food=>{

            text +=

`• ${food.name}
${food.grams} ${food.unit}
${food.kcal} kcal | P ${food.protein} g | HC ${food.carbs} g | G ${food.fat} g

`;

        });

    });

    const totals = calculateTotals();

    text +=

`━━━━━━━━━━━━━━━━━━

TOTAL DEL DÍA

🔥 ${Math.round(totals.kcal)} kcal
🥩 ${totals.protein.toFixed(1)} g
🍚 ${totals.carbs.toFixed(1)} g
🥑 ${totals.fat.toFixed(1)} g

`;

    return text;

}

/* =====================================================
   COPIAR
===================================================== */

async function copySummary(){

    try{

        await navigator.clipboard.writeText(

            buildSummary()

        );

        alert("📋 Resumen copiado");

    }

    catch{

        alert("No se pudo copiar el resumen.");

    }

}

/* =====================================================
   EXPORTAR DATOS
===================================================== */

function exportData(){

    const backup = {

        version:3,

        date:new Date().toISOString(),

        foods,

        meals,

        settings

    };

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

    const url =

        URL.createObjectURL(blob);

    const a =

        document.createElement("a");

    a.href = url;

    a.download =

        "MiNutricionV3.json";

    a.click();

    URL.revokeObjectURL(url);

}

/* =====================================================
   API
===================================================== */

window.miNutricion = {

    foods,

    meals,

    settings,

    renderFoods,

    renderMeals,

    refreshDashboard,

    buildSummary,

    copySummary,

    exportData,

    saveFoods,

    saveMeals,

    saveSettings

};

/* =====================================================
   MI NUTRICIÓN V3
   app.js
   PARTE 8/10
   Eventos
===================================================== */

/* =====================================================
   BIBLIOTECA
===================================================== */

document
.getElementById("closeFoodModal")
.onclick = closeLibrary;

document
.getElementById("newFoodBtn")
.onclick = ()=>{

    jsonInput.value = "";

    jsonStatus.textContent = "";

    newFoodModal.classList.add("show");

};

search.addEventListener(

    "input",

    ()=>renderFoods(search.value)

);

/* =====================================================
   MODAL IMPORTAR
===================================================== */

document
.getElementById("cancelFood")
.onclick = ()=>{

    newFoodModal.classList.remove("show");

};

newFoodModal.onclick = e=>{

    if(e.target===newFoodModal){

        newFoodModal.classList.remove("show");

    }

};

/* =====================================================
   MODAL EDITAR
===================================================== */

editFoodModal.onclick = e=>{

    if(e.target===editFoodModal){

        closeEditFood();

    }

};

/* =====================================================
   MODAL GRAMOS
===================================================== */

document
.getElementById("cancelGrams")
.onclick = closeGrams;

gramsModal.onclick = e=>{

    if(e.target===gramsModal){

        closeGrams();

    }

};

/* =====================================================
   MODAL BIBLIOTECA
===================================================== */

modal.onclick = e=>{

    if(e.target===modal){

        closeLibrary();

    }

};

/* =====================================================
   BOTONES +
===================================================== */

document

.querySelectorAll(".add")

.forEach((button,index)=>{

    const mealsName=[

        "desayuno",

        "comida",

        "merienda",

        "cena"

    ];

    button.onclick=()=>{

        openLibrary(

            mealsName[index]

        );

    };

});

/* =====================================================
   ATAJOS
===================================================== */

gramsInput.addEventListener(

    "keydown",

    e=>{

        if(e.key==="Enter"){

            saveMealFood();

        }

    }

);

jsonInput.addEventListener(

    "keydown",

    e=>{

        if(e.key==="Escape"){

            newFoodModal.classList.remove("show");

        }

    }

);

window.addEventListener(

    "keydown",

    e=>{

        if(e.key!=="Escape") return;

        closeLibrary();

        closeGrams();

        closeEditFood();

        newFoodModal.classList.remove("show");

    }

);

/* =====================================================
   SCROLL IOS
===================================================== */

function lockScroll(){

    lastScroll = window.scrollY;

    document.body.style.position = "fixed";

    document.body.style.top = `-${lastScroll}px`;

    document.body.style.width = "100%";

}

function unlockScroll(){

    document.body.style.position = "";

    document.body.style.top = "";

    document.body.style.width = "";

    window.scrollTo(0,lastScroll);

}

/* =====================================================
   MI NUTRICIÓN V3
   app.js
   PARTE 9/10
   Inicialización
===================================================== */

/* =====================================================
   INICIALIZAR
===================================================== */

function init(){

    refreshDashboard();

    renderFoods();

    renderMeals();

    console.clear();

    console.log(

        "%c🍎 Mi Nutrición V3",

        "color:#38d46a;font-size:18px;font-weight:bold;"

    );

    console.table({

        Biblioteca:foods.length,

        Desayuno:meals.desayuno.length,

        Comida:meals.comida.length,

        Merienda:meals.merienda.length,

        Cena:meals.cena.length

    });

    console.log("✅ Aplicación iniciada");

}

/* =====================================================
   ACTUALIZAR INTERFAZ
===================================================== */

function refresh(){

    renderMeals();

    renderFoods(

        search ? search.value : ""

    );

    refreshDashboard();

}

/* =====================================================
   OBSERVAR CAMBIOS
===================================================== */

window.addEventListener(

    "storage",

    ()=>{

        foods = JSON.parse(

            localStorage.getItem(

                STORAGE.FOODS

            )

        ) || [];

        meals = JSON.parse(

            localStorage.getItem(

                STORAGE.MEALS

            )

        ) || {

            desayuno:[],

            comida:[],

            merienda:[],

            cena:[]

        };

        refresh();

    }

);

/* =====================================================
   ACTUALIZAR FECHA
===================================================== */

setInterval(

    ()=>{

        updateGreeting();

        updateDate();

    },

    60000

);

/* =====================================================
   CARGA
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    init

);

/* =====================================================
   VERSIÓN
===================================================== */

window.APP_VERSION = "3.0.0";

/* =====================================================
   MI NUTRICIÓN V3
   app.js
   PARTE 10/10
   Limpieza final + Utilidades
===================================================== */

/* =====================================================
   RECALCULAR COMIDAS
===================================================== */

function recalculateMeals(){

    Object.keys(meals).forEach(meal=>{

        meals[meal].forEach(item=>{

            const food =

                foods.find(f=>f.id===item.foodId)

                ||

                existsFood(item.name);

            if(!food) return;

            const factor =

                item.grams /

                (food.base || 100);

            item.foodId = food.id;

            item.name = food.name;

            item.brand = food.brand;

            item.category = food.category;

            item.emoji = food.emoji;

            item.unit = food.unit;

            item.base = food.base;

            item.kcal =

                Math.round(food.kcal*factor);

            item.protein = Number(

                (food.protein*factor)

                .toFixed(1)

            );

            item.carbs = Number(

                (food.carbs*factor)

                .toFixed(1)

            );

            item.fat = Number(

                (food.fat*factor)

                .toFixed(1)

            );

        });

    });

}

/* =====================================================
   SINCRONIZAR
===================================================== */

function sync(){

    recalculateMeals();

    saveMeals();

    saveFoods();

    refresh();

}

/* =====================================================
   REINICIAR
===================================================== */

function resetAll(){

    if(

        !confirm(

            "¿Eliminar todos los datos?"

        )

    ){

        return;

    }

    foods=[];

    meals={

        desayuno:[],

        comida:[],

        merienda:[],

        cena:[]

    };

    saveFoods();

    saveMeals();

    refresh();

}

/* =====================================================
   API
===================================================== */

window.miNutricion={

    version:"3.0.0",

    foods,

    meals,

    settings,

    refresh,

    sync,

    resetAll,

    renderFoods,

    renderMeals,

    refreshDashboard,

    buildSummary,

    copySummary,

    exportData,

    saveFoods,

    saveMeals,

    saveSettings

};

/* =====================================================
   INICIO
===================================================== */

recalculateMeals();

refreshDashboard();

renderFoods();

renderMeals();

console.clear();

console.log(

"%c🍎 Mi Nutrición V3",

"color:#38d46a;font-size:20px;font-weight:bold;"

);

console.log(

"✅ V3 iniciada correctamente"

);

console.table({

Version:"3.0.0",

Biblioteca:foods.length,

Desayuno:meals.desayuno.length,

Comida:meals.comida.length,

Merienda:meals.merienda.length,

Cena:meals.cena.length

});