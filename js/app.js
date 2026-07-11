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

const app = document.getElementById("app");

    render() {
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
        const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
        return `
            <article class="macro">
                <div class="macro-head">
                    <div class="macro-label">
                        <span class="macro-emoji">${emoji}</span>
                        <span>${label}</span>
                    </div>
                    <div class="macro-value">${Math.round(current)} ${unit}</div>
                </div>
                <div class="macro-bar" aria-hidden="true">
                    <span class="macro-bar-fill" style="width:${progress}%;"></span>
                </div>
                <div class="macro-meta">
                    <span>${Math.round(current)} / ${target} ${unit}</span>
                    <span>${Math.round(progress)}%</span>
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

    getMacroValue(key) {
        const map = {
            proteinas: 0,
            hidratos: 0,
            grasas: 0
        };
        return map[key] || 0;
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
        alert("Abrir comida: " + meal);
    },

    openReport() {
        alert("Resumen diario");
    },

    openQuickAdd() {
        alert("Añadir alimento");
    },

    openSettings() {
        alert("Ajustes");
    }
};

document.addEventListener("DOMContentLoaded", () => App.init());