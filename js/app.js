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

    const texto = prompt(`Pega aquí el texto de ChatGPT para ${meal}`);

    if(!texto) return;

    const kcal = Number((texto.match(/kcal[: ]*(\d+)/i)||[])[1]||0);
    const proteinas = Number((texto.match(/prote[ií]nas[: ]*(\d+)/i)||[])[1]||0);
    const hidratos = Number((texto.match(/hidratos[: ]*(\d+)/i)||[])[1]||0);
    const grasas = Number((texto.match(/grasas[: ]*(\d+)/i)||[])[1]||0);

    this.state.day[meal].push({

        nombre:"Comida ChatGPT",

        kcal,

        proteinas,

        hidratos,

        grasas

    });

    DB.saveDay(this.state.day);

    this.closeModal();

    this.render();

    this.updateUI();

},

showFoods(meal){

    alert("Listado de alimentos");

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
        alert("Resumen diario");
    },

};

document.addEventListener("DOMContentLoaded", () => App.init());