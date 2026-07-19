"use strict";

/* ==========================================================
   MI NUTRICIÓN NEXT
   app.js
   ========================================================== */

const App = {
    state: {
        today: "",
        day: null,
        settings: {
            objetivoKcal: 2200,
            macros: {
                proteinas: 150,
                hidratos: 220,
                grasas: 70
            }
        }
    },

    async init() {
        try {
            DB.open();

this.state.today = DB.today();

let day = DB.getDay(this.state.today);

if (!day) {
    day = DB.emptyDay();
    DB.saveDay(day);
}

this.state.day = day;

const settings = DB.getSettings();

if (settings) {
    this.state.settings = settings;
}
            this.render();
            this.bindEvents();
            this.updateUI();
            console.log("✅ Mi Nutrición NEXT iniciada");
        } catch (error) {
            console.error(error);
            document.body.innerHTML = `
                <div style="
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    height:100vh;
                    font-size:22px;
                    font-family:-apple-system,BlinkMacSystemFont,sans-serif;
                ">
                    Error al iniciar la aplicación
                </div>
            `;
        }
    },

render() {

    const app = document.getElementById("app");

    app.innerHTML = `
        <section class="card dashboard">
        <div class="dashboard-top">
            <div class="dashboard-copy">
                <h1 class="title">${this.getGreeting()}</h1>
                <p class="date">${this.formatDate()}</p>
            </div>
        </div>

        <div class="progress-wrap">
            <button class="progress" type="button" onclick="App.openReport()">
                <svg viewBox="0 0 220 220">
                    <circle class="progress-track" cx="110" cy="110" r="96"></circle>
                    <circle class="progress-ring" cx="110" cy="110" r="96"></circle>
                </svg>

                <div class="progress-center">
                    <div class="progress-value" id="kcalValue">0</div>
                    <div class="progress-label" id="kcalLabel">
                        de ${this.state.settings.objetivoKcal} kcal
                    </div>
                </div>
            </button>
        </div>

        <div class="macros">
            ${this.renderMacro("Proteínas","🥩","proteinas",this.state.settings.macros.proteinas,"g")}
            ${this.renderMacro("Hidratos","🍚","hidratos",this.state.settings.macros.hidratos,"g")}
            ${this.renderMacro("Grasas","🥑","grasas",this.state.settings.macros.grasas,"g")}
        </div>
    </section>

    <section class="meals">
        ${this.mealCard("🍳","Desayuno","desayuno")}
        ${this.mealCard("🍝","Comida","comida")}
        ${this.mealCard("🍓","Merienda","merienda")}
        ${this.mealCard("🥗","Cena","cena")}
    </section>
`;

},

    renderMacro(label, emoji, key, target, unit) {

    const current = this.getMacroValue(key);

    return `
        <article class="macro">

            <div class="macro-head">

                <div class="macro-emoji">
                    ${emoji}
                </div>

                <div class="macro-label">
                    ${label}
                </div>

                <div class="macro-value">
                    ${Math.round(current)} ${unit}
                </div>

            </div>

        </article>
    `;
},

    mealCard(icono, nombre, id) {
        return `
            <section class="card meal" onclick="App.openMeal('${id}')">
                <div class="meal-row">
                    <div class="meal-title">
                        <span class="meal-icon">${icono}</span>
                        <span>${nombre}</span>
                    </div>
                    <div class="meal-arrow">›</div>
                </div>
                <p class="meal-empty">${this.getMealSummary(id)}</p>
                <div class="meal-total">${this.getMealCalories(id)} kcal</div>
            </section>
        `;
    },

    bindEvents() {
        window.addEventListener("resize", () => this.updateUI());
    },

    updateUI() {
        const total = this.getCalories();
        const target = this.state.settings.objetivoKcal;
        const pct = target > 0 ? Math.min(total / target, 1) : 0;
        const ring = document.querySelector(".progress-ring");
        const circumference = 2 * Math.PI * 96;

        if (ring) {
            ring.style.strokeDasharray = `${circumference * pct} ${circumference}`;
        }

        const kcalValue = document.getElementById("kcalValue");
        const kcalLabel = document.getElementById("kcalLabel");
        if (kcalValue) kcalValue.textContent = Math.round(total);
        if (kcalLabel) kcalLabel.textContent = `de ${target} kcal`;
    },

    getCalories() {
        return this.getMealCalories("desayuno") + this.getMealCalories("comida") + this.getMealCalories("merienda") + this.getMealCalories("cena");
    },

    getMacroValue(key){

    let total=0;

    ["desayuno","comida","merienda","cena"].forEach(meal=>{

        this.state.day[meal].forEach(food=>{

            total+=Number(food[key]||0);

        });

    });

    return total;

},

    getMealCalories(meal) {
        const items = this.state.day?.[meal] || [];
        return items.reduce((sum, item) => sum + Number(item.kcal || 0), 0);
    },

    getMealSummary(meal) {
        const items = this.state.day?.[meal] || [];
        if (!items.length) return "Sin alimentos";
        return `${items.length} alimento${items.length > 1 ? "s" : ""}`;
    },

    formatDate() {
        return new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    },
    
    getGreeting() {

    const h = new Date().getHours();

    if (h < 12) return "Buenos días";
    if (h < 20) return "Buenas tardes";

    return "Buenas noches";
},

    openMeal(meal) {

    const modal = document.getElementById("modal");

    const titulo = meal.charAt(0).toUpperCase() + meal.slice(1);

    modal.classList.remove("hidden");

    modal.innerHTML = `

<div class="sheet">

    <h2 class="text-center">${titulo}</h2>

    <div class="mt-20">

        <button class="action-btn"
            onclick="App.pasteFood('${meal}')">

            📋 Pegar desde ChatGPT

        </button>
        
        <button class="action-btn"
    onclick="App.showLibrary('${meal}')">

    📚 Biblioteca

</button>

        <button class="action-btn"
            onclick="App.showFoods('${meal}')">

            📄 Ver alimentos

        </button>

        <button class="action-btn danger"
            onclick="App.clearMeal('${meal}')">

            🗑 Vaciar comida

        </button>

    </div>

    <div class="mt-20 center">

        <button onclick="App.closeModal()">

            Cerrar

        </button>

    </div>

</div>

`;

},

pasteFood(meal){

    const modal=document.getElementById("modal");

    const titulo=meal.charAt(0).toUpperCase()+meal.slice(1);

    modal.innerHTML=`

<div class="sheet">

<h2>${titulo}</h2>

<textarea id="foodText"
placeholder="Pega aquí uno o varios alimentos copiados desde ChatGPT..."
style="
width:100%;
height:260px;
padding:16px;
border:1px solid #ddd;
border-radius:18px;
font-size:16px;
resize:none;
"></textarea>

<div class="mt-20">

<button class="action-btn"
onclick="App.savePastedFood('${meal}')">

Guardar alimentos

</button>

<button class="action-btn danger"
onclick="App.openMeal('${meal}')">

Cancelar

</button>

</div>

</div>

`;

},

savePastedFood(meal){

    const texto = document.getElementById("foodText").value.trim();

    if(!texto) return;

    const bloques = texto.split(/\n\s*\n/);

    const ahora = new Date();
    
    let biblioteca = DB.getLibrary();

    const fecha = ahora.toISOString().slice(0,10);

    const hora = ahora.toLocaleTimeString("es-ES",{
        hour:"2-digit",
        minute:"2-digit"
    });

    bloques.forEach(bloque=>{

        const lineas = bloque.trim().split("\n");

        const nombre = lineas[0].trim();

        const kcal = parseFloat((((bloque.match(/Calor[ií]as:\s*([\d.,]+)/i)||[])[1])||0).replace(",","."));

        const proteinas = parseFloat((((bloque.match(/Prote[ií]nas:\s*([\d.,]+)/i)||[])[1])||0).replace(",","."));

        let hidratos = 0;

        const carbo = bloque.match(/Carbohidratos:\s*([\d.,]+)/i);
        const hidra = bloque.match(/Hidratos:\s*([\d.,]+)/i);

        if(carbo){
            hidratos = parseFloat(carbo[1].replace(",","."));
        }else if(hidra){
            hidratos = parseFloat(hidra[1].replace(",","."));
        }

        const grasas = parseFloat((((bloque.match(/Grasas:\s*([\d.,]+)/i)||[])[1])||0).replace(",","."));
        
        const existe = biblioteca.some(
    food => food.nombre.toLowerCase() === nombre.toLowerCase()
);

if (!existe) {
    biblioteca.push({
        nombre,
        kcal,
        proteinas,
        hidratos,
        grasas
    });
}

        this.state.day[meal].push({

            nombre,

            kcal,

            proteinas,

            hidratos,

            grasas,

            fecha,

            hora,

            comida: meal,

            origen: bloque.trim()

        });

    });
    
    DB.saveLibrary(biblioteca);

    DB.saveDay(this.state.day);

    this.closeModal();

    this.render();

    this.updateUI();

},

showLibrary(meal){
    
    const biblioteca = [...DB.getLibrary()].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
);

    const modal = document.getElementById("modal");

    const titulo = meal.charAt(0).toUpperCase() + meal.slice(1);

    modal.classList.remove("hidden");

    modal.innerHTML = `

<div class="sheet">

<h2>📚 Biblioteca</h2>

<input
    id="librarySearch"
    type="text"
    placeholder="🔍 Buscar alimento..."
    oninput="App.filterLibrary()"
    style="
        width:100%;
        padding:12px;
        margin:15px 0;
        border:1px solid #ddd;
        border-radius:12px;
        font-size:16px;
    ">

<div class="food-list">

${
biblioteca.length
?
biblioteca.map((food,index)=>`

<div class="food-item"
     onclick="App.addLibraryFood('${meal}','${food.nombre}', this)"
     style="cursor:pointer;">

<div>

<div class="food-name">${food.nombre}</div>

<div class="food-kcal">

${food.kcal} kcal ·
P ${food.proteinas} g ·
C ${food.hidratos} g ·
G ${food.grasas} g

</div>

</div>

</div>

`).join("")
:
"<p class='text-center'>Biblioteca vacía</p>"
}

</div>

<div class="mt-20">

<button class="action-btn" onclick="App.closeModal()">
    ✅ Listo
</button>

Volver

</button>

</div>

</div>

`;

},

filterLibrary() {
    const search = document.getElementById('librarySearch').value.toLowerCase();

    document.querySelectorAll('.food-item').forEach(item => {
        const text = item.textContent.toLowerCase();

        if (text.includes(search)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
},

addLibraryFood(meal, nombre, element){

    const biblioteca = DB.getLibrary();
const food = biblioteca.find(f => f.nombre === nombre);

    element.style.background = "#e8f6ea";
element.style.transition = "0.2s";

setTimeout(() => {
    element.style.background = "";
}, 200);

    if (!food) return;

    const ahora = new Date();

    this.state.day[meal].push({

        ...food,

        fecha: ahora.toISOString().slice(0,10),

        hora: ahora.toLocaleTimeString("es-ES",{
            hour:"2-digit",
            minute:"2-digit"
        }),

        comida: meal

    });

    DB.saveDay(this.state.day);

    this.render();

    this.updateUI();

},

showFoods(meal){

    const modal=document.getElementById("modal");

    const foods=this.state.day[meal]||[];

    const titulo=meal.charAt(0).toUpperCase()+meal.slice(1);

    modal.classList.remove("hidden");

    modal.innerHTML=`

<div class="sheet">

<h2>${titulo}</h2>

<div class="food-list">

${
foods.length
?
foods.map((food,index)=>`

<div class="food-item">

<div>

<div class="food-name">${food.nombre}</div>

<div class="food-kcal">

🕒 ${food.hora || "--:--"}

<br>

${food.kcal} kcal ·
P ${food.proteinas} g ·
C ${food.hidratos} g ·
G ${food.grasas} g

</div>

</div>

<button class="delete-btn"

onclick="App.deleteFood('${meal}',${index})">

✕
</button>

</div>

`).join("")
:
"<p class='text-center'>Sin alimentos</p>"
}

</div>

<div class="mt-20">

<button class="action-btn"

onclick="App.pasteFood('${meal}')">

📋 Añadir alimentos

</button>

<button class="action-btn danger"

onclick="App.closeModal()">

Cerrar

</button>

</div>

</div>

`;

},

deleteFood(meal,index){

    this.state.day[meal].splice(index,1);

    DB.saveDay(this.state.day);

    this.showFoods(meal);

    this.render();

    this.updateUI();

},

clearMeal(meal){

    if(!confirm("¿Vaciar esta comida?")) return;

    this.state.day[meal]=[];

    DB.saveDay(this.state.day);

    this.render();

    this.updateUI();

    this.closeModal();

},

closeModal(){

    const modal=document.getElementById("modal");

    modal.classList.add("hidden");

    modal.innerHTML="";

},

openReport(){

    const total=this.getCalories();

    const objetivo=this.state.settings.objetivoKcal;

    const proteinas=this.getMacroValue("proteinas");
    const hidratos=this.getMacroValue("hidratos");
    const grasas=this.getMacroValue("grasas");

    const comidas=[
        {icono:"🍳",titulo:"Desayuno",key:"desayuno"},
        {icono:"🍝",titulo:"Comida",key:"comida"},
        {icono:"🍓",titulo:"Merienda",key:"merienda"},
        {icono:"🥗",titulo:"Cena",key:"cena"}
    ];

    let html=`

<div class="sheet">

<h2 class="text-center">

Resumen diario

</h2>

<div class="report-date">

📅 ${this.formatDate()}

</div>

<div class="report-calories">

🔥 <strong>${total}</strong>

<span>/ ${objetivo} kcal</span>

</div>

<div class="report-macros">

<div class="report-macro">

<span>🥩 Proteínas</span>

<strong>${proteinas} / ${this.state.settings.macros.proteinas} g</strong>

</div>

<div class="report-macro">

<span>🍚 Hidratos</span>

<strong>${hidratos} / ${this.state.settings.macros.hidratos} g</strong>

</div>

<div class="report-macro">

<span>🥑 Grasas</span>

<strong>${grasas} / ${this.state.settings.macros.grasas} g</strong>

</div>

</div>

`;

    comidas.forEach(comida=>{

        const foods=this.state.day[comida.key]||[];

        let totalMeal=0;

        html+=`

<div class="report-meal">

<div class="report-meal-title">

${comida.icono} ${comida.titulo}

</div>

`;

        if(!foods.length){

            html+=`

<div class="report-empty">

Sin alimentos

</div>

`;

        }else{

            foods.forEach(food=>{

                totalMeal+=Number(food.kcal||0);

                html+=`
                <div class="report-food">

    <div class="report-food-header">

        <span class="report-food-time">

            ${food.hora || "--:--"}

        </span>

        <span class="report-food-name">

            ${food.nombre}

        </span>

    </div>

    <div class="report-food-kcal">

        ${food.kcal} kcal

    </div>

</div>

`;

            });

            html+=`

<div class="report-meal-total">

<span>Total ${comida.titulo}</span>

<strong>${totalMeal} kcal</strong>

</div>

`;

        }

        html+=`

</div>

`;

    });

    html+=`

<div class="mt-20">

<button
class="action-btn"
onclick="App.copyReport()">

📋 Copiar para ChatGPT

</button>

<button
class="action-btn danger"
onclick="App.closeModal()">

Cerrar

</button>

</div>

</div>

`;

    const modal=document.getElementById("modal");

    modal.classList.remove("hidden");

    modal.innerHTML=html;

},

copyReport(){

    const comidas=[
        ["DESAYUNO","desayuno"],
        ["COMIDA","comida"],
        ["MERIENDA","merienda"],
        ["CENA","cena"]
    ];

    let texto="";

    texto+="RESUMEN DIARIO\n\n";

    texto+=this.formatDate()+"\n\n";

    texto+=`Objetivo: ${this.state.settings.objetivoKcal} kcal\n`;
    texto+=`Consumido: ${this.getCalories()} kcal\n`;
    texto+=`Restante: ${Math.max(0,this.state.settings.objetivoKcal-this.getCalories())} kcal\n\n`;

    texto+=`Proteínas: ${this.getMacroValue("proteinas").toFixed(1)} g\n`;
    texto+=`Hidratos: ${this.getMacroValue("hidratos").toFixed(1)} g\n`;
    texto+=`Grasas: ${this.getMacroValue("grasas").toFixed(1)} g\n\n`;

    comidas.forEach(([titulo,key])=>{

        texto+=titulo+"\n";

        const foods=this.state.day[key]||[];

        if(!foods.length){

            texto+="Sin alimentos\n\n";
            return;

        }

        let total=0;

        foods.forEach(food=>{

            texto+=`• ${food.hora || "--:--"} - ${food.nombre} (${food.kcal} kcal)\n`;

            total+=Number(food.kcal);

        });

        texto+=`Total ${titulo.toLowerCase()}: ${total} kcal\n\n`;

    });

    navigator.clipboard.writeText(texto);

    alert("✅ Informe copiado");

},

};

document.addEventListener("DOMContentLoaded", () => App.init());