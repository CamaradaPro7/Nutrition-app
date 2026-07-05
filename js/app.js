"use strict";

/* ==========================================================
   MI NUTRICIÓN NEXT V7
   app.js
========================================================== */

const App={

    version:"7.0",

    state:{

        currentDate:DB.todayKey(),

        settings:{
            kcalGoal:2200
        },

        foods:[],

        meals:DB.emptyDay()

    },

    async init(){

        console.log(

            "🚀 Iniciando Mi Nutrición NEXT V7..."

        );

        await DB.open();

        console.log(

            "✅ Base de datos preparada"

        );

        Dashboard.render();

    }

};

document.addEventListener(

    "DOMContentLoaded",

    ()=>App.init()

);