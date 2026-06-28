/* =====================================================
   MI NUTRICIÓN V2.2
   PARTE 1/6
   Núcleo de la aplicación
===================================================== */

/* ===========================
   ALMACENAMIENTO
=========================== */

const STORAGE_FOODS = "foodLibrary";
const STORAGE_MEALS = "miNutricion";

/* ===========================
   BIBLIOTECA
=========================== */

let foods = JSON.parse(
    localStorage.getItem(STORAGE_FOODS)
) || [];

/* ===========================
   COMIDAS
=========================== */

let meals = JSON.parse(
    localStorage.getItem(STORAGE_MEALS)
) || {

    desayuno: [],
    comida: [],
    merienda: [],
    cena: []

};

/* ===========================
   ESTADO
=========================== */

let currentMeal = null;
let selectedFood = null;

let editingMeal = null;
let editingIndex = null;
let editingFood = null;

/* ===========================
   ELEMENTOS
=========================== */

const modal =
document.getElementById("modal");

const gramsModal =
document.getElementById("gramsModal");

const newFoodModal =
document.getElementById("newFoodModal");

const search =
document.getElementById("searchFood");

const foodResults =
document.getElementById("foodResults");

const gramsInput =
document.getElementById("gramsInput");

const selectedFoodLabel =
document.getElementById("selectedFood");

const acceptGrams =
document.getElementById("acceptGrams");

const cancelGrams =
document.getElementById("cancelGrams");

const jsonInput =
document.getElementById("jsonInput");

const jsonStatus =
document.getElementById("jsonStatus");

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

/* ===========================
   GUARDAR
=========================== */

function saveFoods(){

    localStorage.setItem(

        STORAGE_FOODS,

        JSON.stringify(foods)

    );

}

function saveMeals(){

    localStorage.setItem(

        STORAGE_MEALS,

        JSON.stringify(meals)

    );

}

/* ===========================
   UTILIDADES
=========================== */

function normalize(text){

    return text
        .toLowerCase()
        .trim();

}

function number(value){

    return Number(
        String(value)
        .replace(",",".")
    ) || 0;

}

function createId(){

    return Date.now() +
    Math.floor(Math.random()*100000);

}

function existsFood(name){

    return foods.find(f=>

        normalize(f.name)===normalize(name)

    );

}

/* =====================================================
   MI NUTRICIÓN V2.2
   PARTE 2/6
   Biblioteca
===================================================== */

/* ===========================
   MODALES
=========================== */

function openMeal(meal){

    currentMeal = meal;

    search.value = "";

    renderFoods();

    lastScroll = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${lastScroll}px`;
    document.body.style.width = "100%";

    modal.classList.add("show");

    // search.focus();

}

function closeMeal(){

    modal.classList.remove("show");
    
    document.body.style.position = "";
document.body.style.top = "";
document.body.style.width = "";

window.scrollTo(0, lastScroll);

}

function openNewFood(){

    jsonInput.value = "";

    jsonStatus.textContent = "";

    foodName.value = "";
    foodBrand.value = "";
    foodUnit.value = "g";

    foodKcal.value = "";
    foodProtein.value = "";
    foodCarbs.value = "";
    foodFat.value = "";

    newFoodModal.classList.add("show");
    
    lastScroll = window.scrollY;

document.body.style.position = "fixed";
document.body.style.top = `-${lastScroll}px`;
document.body.style.width = "100%";

}

function closeNewFood(){

    newFoodModal.classList.remove("show");
    
    document.body.style.position = "";
document.body.style.top = "";
document.body.style.width = "";

window.scrollTo(0, lastScroll);

}

function openGrams(food){

    selectedFood = food;

    selectedFoodLabel.textContent =
        `${food.emoji || "🍽️"} ${food.name}`;

    gramsInput.value = food.base || 100;

    gramsModal.classList.add("show");

    gramsInput.focus();

}

function closeGrams(){

    gramsModal.classList.remove("show");

}

/* ===========================
   RENDER BIBLIOTECA
=========================== */

function renderFoods(filter=""){

    foodResults.innerHTML = "";

    let list = foods.filter(food=>

        normalize(food.name)
        .includes(normalize(filter))

    );

    list.sort((a,b)=>

        a.name.localeCompare(
            b.name,
            "es"
        )

    );

    if(list.length===0){

        foodResults.innerHTML = `

        <div style="
            padding:40px;
            text-align:center;
            color:#8d97a6;
        ">

            📚<br><br>

            No hay alimentos.

        </div>

        `;

        return;

    }

    list.forEach(food=>{

        const item =
        document.createElement("div");

        item.className =
        "food-item";

        item.innerHTML = `

<div style="flex:1;">

    <div class="food-name">
        ${food.emoji || "🍽️"} ${food.name}
    </div>

    <div class="food-brand">
        ${food.brand || ""}
    </div>

    <div class="food-kcal">
        ${food.category || "Otros"} · ${food.kcal} kcal / ${food.base || 100} ${food.unit}
    </div>

</div>

<div class="food-actions">

<button
class="icon-btn"
onclick="
event.stopPropagation();
editFood(${food.id});
">
✏️
</button>

    <button
        class="icon-btn delete"
        onclick="event.stopPropagation();deleteFood(${food.id})">

        🗑️

    </button>

</div>

`;

        item.onclick = ()=>{

            editingMeal = null;
            editingIndex = null;

            openGrams(food);

        };

        foodResults.appendChild(item);

    });

}

function deleteFood(id){

    const food = foods.find(f => f.id === id);

    if(!food) return;

    if(!confirm(`¿Eliminar "${food.name}" de la biblioteca?`)){
        return;
    }

    foods = foods.filter(f => f.id !== id);

    saveFoods();

    renderFoods(search.value);

}

function editFood(id){
    

    const food = foods.find(f => f.id === id);

    if(!food) return;

    editingFood = food;

    foodName.value = food.name;
    foodBrand.value = food.brand || "";
    foodUnit.value = food.unit || "g";

    foodKcal.value = food.kcal;
    foodProtein.value = food.protein;
    foodCarbs.value = food.carbs;
    foodFat.value = food.fat;

    jsonInput.value = "";

    newFoodModal.classList.add("show");

}

/* ===========================
   BUSCADOR
=========================== */

search.oninput = ()=>{

    renderFoods(search.value);

};

/* ===========================
   MODALES
=========================== */

document
.getElementById("closeFoodModal")
.onclick = closeMeal;

newFoodBtn.onclick =
openNewFood;

cancelFood.onclick =
closeNewFood;

cancelGrams.onclick =
closeGrams;

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

    const ids = [

        "desayuno",
        "comida",
        "merienda",
        "cena"

    ];

    btn.onclick = ()=>{

        openMeal(ids[index]);

    };

});

/* =====================================================
   MI NUTRICIÓN V2.2
   PARTE 3/6
   Importación
===================================================== */

/* ===========================
   IMPORTACIÓN
=========================== */

jsonInput.addEventListener("input",()=>{

    let text = jsonInput.value.trim();

    text = text
        .replace(/[“”]/g,'"')
        .replace(/[‘’]/g,"'")
        .replace(/```json/g,"")
        .replace(/```/g,"")
        .trim();

    if(text===""){

        jsonStatus.textContent="";
        return;

    }

    try{

        const data = JSON.parse(text);

        foodName.value = data.nombre || "";
        foodBrand.value = data.marca || "";
        foodUnit.value = data.unidad || "g";

        foodKcal.value = data.kcal || 0;
        foodProtein.value = data.proteinas || 0;
        foodCarbs.value = data.hidratos || 0;
        foodFat.value = data.grasas || 0;

        jsonStatus.textContent =
        "✅ JSON detectado";

        jsonStatus.style.color =
        "#39d96c";

        return;

    }catch(e){}

    if(text.includes("kcal")){

        jsonStatus.textContent =
        "📋 Lista de alimentos detectada";

        jsonStatus.style.color =
        "#39d96c";

        return;

    }

    jsonStatus.textContent =
    "❌ Formato no reconocido";

    jsonStatus.style.color =
    "#ff5b67";

});

/* ===========================
   IMPORTAR LISTA
=========================== */

function importFoodList(text){

    const lines = text
        .split("\n")
        .map(l => l.trim())
        .filter(l => l);

    let imported = 0;
    let updated = 0;

    for(let i=0;i<lines.length;i++){

        const name = lines[i];

        if(
            name.toUpperCase().includes("ALIMENTOS") ||
            name.includes("Macros") ||
            name.includes("kcal")
        ){
            continue;
        }

        if(i+1 >= lines.length) continue;

        const info = lines[i+1];

        if(!info.includes("kcal")) continue;

        const unit =
            info.includes("ml") ? "ml" :
            info.includes("huevo") ? "huevo" :
            "g";

        const base =
            parseFloat(
                (info.match(/^([\d.,]+)/)?.[1] || "100")
                .replace(",",".")
            );

        const kcal =
            parseFloat(
                (info.match(/=\s*([\d.,]+)\s*kcal/i)?.[1] || "0")
                .replace(",",".")
            );

        const protein =
            parseFloat(
                (info.match(/P\s*([\d.,]+)/i)?.[1] || "0")
                .replace(",",".")
            );

        const carbs =
            parseFloat(
                (info.match(/HC\s*([\d.,]+)/i)?.[1] || "0")
                .replace(",",".")
            );

        const fat =
            parseFloat(
                (info.match(/G\s*([\d.,]+)/i)?.[1] || "0")
                .replace(",",".")
            );

        const food = {

            id:createId(),

            type:"alimento",

            name,

            brand:"",

            category:"Otros",

            emoji:"🍽️",

            unit,

            base,

            kcal,

            protein,

            carbs,

            fat

        };

        const existing = existsFood(name);

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
        `✅ ${imported} alimentos importados\n🔄 ${updated} actualizados`
    );

}

/* ===========================
   GUARDAR
=========================== */

saveFood.onclick = ()=>{
    
if(editingFood){

    editingFood.name = foodName.value.trim();
    editingFood.brand = foodBrand.value.trim();
    editingFood.unit = foodUnit.value.trim();

    editingFood.kcal = Number(foodKcal.value);
    editingFood.protein = Number(foodProtein.value);
    editingFood.carbs = Number(foodCarbs.value);
    editingFood.fat = Number(foodFat.value);

    saveFoods();

    editingFood = null;

    closeNewFood();

    renderFoods(search.value);

    return;
}

    let text = jsonInput.value.trim();

    text = text
        .replace(/[“”]/g,'"')
        .replace(/[‘’]/g,"'")
        .replace(/```json/g,"")
        .replace(/```/g,"")
        .trim();

    if(text.includes("kcal") && !text.startsWith("{")){

        importFoodList(text);

        closeNewFood();

        return;

    }

    let data;

    try{

        data = JSON.parse(text);

    }catch{

        alert("JSON no válido");

        return;

    }

    const food = {

        id:createId(),

        type:data.tipo || "alimento",

        name:data.nombre || "",

        brand:data.marca || "",

        category:data.categoria || "Otros",

        emoji:data.emoji || "🍽️",

        unit:(data.unidad || "g")
            .replace(/^100\s*/i,""),

        base:Number(data.base || 100),

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

    closeNewFood();

    alert("✅ Alimento guardado");

};

/* =====================================================
   MI NUTRICIÓN V2.2
   PARTE 4/6
   Comidas
===================================================== */

/* ===========================
   AÑADIR A COMIDA
=========================== */

acceptGrams.onclick = ()=>{

    const amount = number(gramsInput.value);

    if(amount<=0){

        alert("Cantidad no válida");

        return;

    }

    const factor =
        amount / (selectedFood.base || 100);

    const item = {

        id:createId(),

        name:selectedFood.name,

        brand:selectedFood.brand,

        emoji:selectedFood.emoji,

        category:selectedFood.category,

        unit:selectedFood.unit,

        base:selectedFood.base,

        grams:amount,

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

    updateTotals();

    closeGrams();

};

/* ===========================
   EDITAR
=========================== */

function editFood(meal,index){

    const item =
        meals[meal][index];

    const original =
        existsFood(item.name);

    if(!original){

        alert("El alimento ya no existe.");

        return;

    }

    editingMeal=meal;
    editingIndex=index;

    openGrams(original);

}

/* ===========================
   ELIMINAR
=========================== */

function removeFood(meal,index){

    if(!confirm("¿Eliminar alimento?")){

        return;

    }

    meals[meal].splice(index,1);

    saveMeals();

    renderMeals();

    updateTotals();

}

/* ===========================
   RENDER COMIDAS
=========================== */

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

        let total=0;

        meals[meal].forEach((food,index)=>{

            total+=food.kcal;

            const row =
            document.createElement("div");

            row.className="food-item fade-in";

            row.innerHTML=`

<div
style="flex:1;cursor:pointer;"
onclick="editFood('${meal}',${index})">

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

<span>${total} kcal</span>

`;

        list.appendChild(footer);

    });

}

/* =====================================================
   MI NUTRICIÓN V2.2
   PARTE 5/6
   Dashboard + Resumen
===================================================== */

/* ===========================
   DASHBOARD
=========================== */

function updateTotals(){

    let kcal = 0;
    let prot = 0;
    let hc = 0;
    let grasas = 0;

    Object.values(meals)
        .flat()
        .forEach(food=>{

            kcal += food.kcal;
            prot += food.protein;
            hc += food.carbs;
            grasas += food.fat;

        });

    totalKcal.textContent =
        Math.round(kcal);

    protein.textContent =
        prot.toFixed(1)+" g";

    carbs.textContent =
        hc.toFixed(1)+" g";

    fat.textContent =
        grasas.toFixed(1)+" g";

}

/* ===========================
   RESUMEN CHATGPT
=========================== */

function buildSummary(){

    let text = "";

    const nombres = {

        desayuno:"🍳 DESAYUNO",
        comida:"🍝 COMIDA",
        merienda:"🥪 MERIENDA",
        cena:"🌙 CENA"

    };

    Object.keys(meals).forEach(meal=>{

        if(meals[meal].length===0)
            return;

        text += nombres[meal]+"\n\n";

        meals[meal].forEach(food=>{

            text +=
`• ${food.name}
${food.grams} ${food.unit}
${food.kcal} kcal | P ${food.protein} g | HC ${food.carbs} g | G ${food.fat} g

`;

        });

    });

    text +=
`TOTAL DEL DÍA

🔥 ${totalKcal.textContent} kcal
🥩 ${protein.textContent}
🍚 ${carbs.textContent}
🥑 ${fat.textContent}
`;

    return text;

}

/* ===========================
   COPIAR RESUMEN
=========================== */

function copySummary(){

    navigator.clipboard
    .writeText(buildSummary())
    .then(()=>{

        alert("📋 Resumen copiado");

    })
    .catch(()=>{

        alert("No se pudo copiar.");

    });

}

/* =====================================================
   MI NUTRICIÓN V2.2
   PARTE 6/6
   Inicialización
===================================================== */

/* ===========================
   INICIALIZAR
=========================== */

renderFoods();
renderMeals();
updateTotals();

/* ===========================
   ATAJOS
=========================== */

gramsInput.addEventListener("keydown",e=>{

    if(e.key==="Enter"){

        acceptGrams.click();

    }

});

search.addEventListener("input",()=>{

    renderFoods(search.value);

});

jsonInput.addEventListener("keydown",e=>{

    if(e.key==="Escape"){

        closeNewFood();

    }

});

window.addEventListener("keydown",e=>{

    if(e.key!=="Escape") return;

    closeMeal();
    closeGrams();
    closeNewFood();

});

/* ===========================
   API V2.2
=========================== */

window.miNutricion = {

    foods,

    meals,

    renderFoods,

    renderMeals,

    updateTotals,

    buildSummary,

    copySummary,

    saveFoods,

    saveMeals

};

/* ===========================
   INFORMACIÓN
=========================== */

console.clear();

console.log(
    "%c🍎 Mi Nutrición V2.2",
    "color:#38d46a;font-size:18px;font-weight:bold;"
);

console.table({

    Biblioteca: foods.length,

    Desayuno: meals.desayuno.length,

    Comida: meals.comida.length,

    Merienda: meals.merienda.length,

    Cena: meals.cena.length

});

console.log("✅ Aplicación iniciada correctamente");