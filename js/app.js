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
            await DB.open();
            this.state.today = DB.today();
            this.state.day = await DB.getDay(this.state.today) || DB.emptyDay();
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
                <h1 class="title">Buenos días</h1>
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

    DB.saveDay(this.state.day);

    this.closeModal();

    this.render();

    this.updateUI();

}

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

openReport() {

    const total = this.getCalories();

    const p = this.getMacroValue("proteinas");
    const c = this.getMacroValue("hidratos");
    const g = this.getMacroValue("grasas");

    const comidas = [
        ["DESAYUNO","desayuno"],
        ["COMIDA","comida"],
        ["MERIENDA","merienda"],
        ["CENA","cena"]
    ];

    let informe = `RESUMEN DIARIO

${this.formatDate()}

🔥 Calorías
${total} / ${this.state.settings.objetivoKcal} kcal

🥩 Proteínas
${p} / ${this.state.settings.macros.proteinas} g

🍚 Hidratos
${c} / ${this.state.settings.macros.hidratos} g

🥑 Grasas
${g} / ${this.state.settings.macros.grasas} g

`;

    comidas.forEach(([titulo,id])=>{

        informe += `\n${titulo}\n`;

        const foods=this.state.day[id]||[];

        if(!foods.length){

            informe+="Sin alimentos\n";

        }else{

            foods.forEach(food=>{

                informe+=`• ${food.nombre}\n`;

            });

        }

    });

    const modal=document.getElementById("modal");

    modal.classList.remove("hidden");

    modal.innerHTML=`

<div class="sheet">

<h2 class="text-center mb-20">
Resumen diario
</h2>

<textarea
id="dailyReport"
readonly
style="
width:100%;
height:340px;
padding:16px;
border:1px solid #e5e7eb;
border-radius:18px;
font-size:15px;
line-height:1.6;
resize:none;
background:#f8fafc;
">${informe}</textarea>

<div class="mt-20">

<button class="action-btn"
onclick="App.copyReport()">
📋 Copiar informe
</button>

<button class="action-btn danger"
onclick="App.closeModal()">
Cerrar
</button>

</div>

</div>

`;

},

copyReport(){

    const texto=document.getElementById("dailyReport").value;

    navigator.clipboard.writeText(texto);

    alert("Informe copiado.");

},

};

document.addEventListener("DOMContentLoaded", () => App.init());