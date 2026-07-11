"use strict";

/* ==========================================================
   MI NUTRICIÓN NEXT V7
   app.js
========================================================== */

const App = {

    state: {

        today: "",
        foods: [],
        day: null,

        settings: {
            objetivoKcal: 2200
        }

    },

    async init(){

        try{

            await DB.open();

            this.state.today = DB.today();
            this.state.day = DB.emptyDay();

            this.render();

            console.log("✅ Mi Nutrición NEXT iniciada");

        }

        catch(error){

            console.error(error);

            document.body.innerHTML=`
                <div style="
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    height:100vh;
                    font-size:22px;
                ">
                    Error al iniciar la aplicación
                </div>
            `;

        }

    },

    render(){

        const app = document.getElementById("app");

        app.innerHTML = `

<section class="card dashboard">

    <h1 class="title">Buenos días</h1>

    <p class="date">${this.formatDate()}</p>

    <div class="progress" onclick="App.openReport()">

        <div class="progress-circle">

            <div class="progress-value">0</div>

            <div class="progress-label">
                de ${this.state.settings.objetivoKcal} kcal
            </div>

        </div>

    </div>

    <div class="macros">

        <div class="macro">
            <span>🥩 Proteínas</span>
            <strong>0 g</strong>
        </div>

        <div class="macro">
            <span>🍚 Hidratos</span>
            <strong>0 g</strong>
        </div>

        <div class="macro">
            <span>🥑 Grasas</span>
            <strong>0 g</strong>
        </div>

    </div>

</section>

${this.mealCard("🍳","Desayuno","desayuno")}
${this.mealCard("🍝","Comida","comida")}
${this.mealCard("🍓","Merienda","merienda")}
${this.mealCard("🥗","Cena","cena")}

`;

    },

    mealCard(icono, nombre, id){

        return `

<section class="card meal" onclick="App.openMeal('${id}')">

    <div class="meal-row">

        <div class="meal-title">

            <span class="meal-icon">${icono}</span>
            <span>${nombre}</span>

        </div>

        <div class="meal-arrow">›</div>

    </div>

    <p class="meal-empty">Sin alimentos</p>

    <div class="meal-total">0 kcal</div>

</section>

`;

    },

    formatDate(){

        return new Date().toLocaleDateString("es-ES",{

            weekday:"long",
            day:"numeric",
            month:"long",
            year:"numeric"

        });

    },

    openMeal(meal){

        alert("Abrir biblioteca: " + meal);

    },

    openReport(){

        alert("Informe diario");

    }

};

document.addEventListener("DOMContentLoaded",()=>App.init());