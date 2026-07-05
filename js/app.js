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

    async init() {

        try {

            await DB.open();

            this.state.today = DB.today();

            this.state.day = DB.emptyDay();

            this.render();

            console.log("✅ Mi Nutrición NEXT V7 iniciada");

        } catch (error) {

            console.error(error);

            document.body.innerHTML = `
                <div style="
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    height:100vh;
                    text-align:center;
                    padding:30px;
                    font-size:20px;">
                    Error al iniciar la aplicación
                </div>
            `;

        }

    },

    render() {

        const app = document.getElementById("app");

        app.innerHTML = `

        <div class="card">

            <h1>Mi Nutrición NEXT</h1>

            <p>Versión 7</p>

        </div>

        <div class="card">

            <h2>Dashboard</h2>

            <p>En construcción...</p>

        </div>

        <div class="card">

            <h2>Biblioteca</h2>

            <p>En construcción...</p>

        </div>

        <div class="card">

            <h2>Comidas</h2>

            <p>En construcción...</p>

        </div>

        `;

    }

};

document.addEventListener("DOMContentLoaded", () => App.init());