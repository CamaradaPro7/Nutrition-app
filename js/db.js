"use strict";

/* ==========================================================
   MI NUTRICIÓN NEXT
   db.js (localStorage)
   ========================================================== */

const DB = {

    open() {
        return true;
    },

    today() {
        const d = new Date();

        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${y}-${m}-${day}`;
    },

    emptyDay() {
        return {
            id: this.today(),
            desayuno: [],
            comida: [],
            merienda: [],
            cena: []
        };
    },

    getDay(id) {
        try {
            const data = localStorage.getItem(`day_${id}`);

            if (!data) return null;

            return JSON.parse(data);

        } catch (e) {

            console.error("Error leyendo día", e);

            return null;

        }
    },

    saveDay(day) {
        try {

            if (!day.id) {
                day.id = this.today();
            }

            localStorage.setItem(
                `day_${day.id}`,
                JSON.stringify(day)
            );

            console.log("✅ Día guardado");

            return true;

        } catch (e) {

            console.error("Error guardando día", e);

            return false;

        }
    },

    getSettings() {

        try {

            const data = localStorage.getItem("settings");

            return data ? JSON.parse(data) : null;

        } catch (e) {

            console.error(e);

            return null;

        }

    },

    saveSettings(settings) {

        try {

            localStorage.setItem(
                "settings",
                JSON.stringify(settings)
            );

            return true;

        } catch (e) {

            console.error(e);

            return false;

        }

    },

    clearDay(id) {

        localStorage.removeItem(`day_${id}`);

    },

    clearAllDays() {

    Object.keys(localStorage).forEach(key => {

        if (key.startsWith("day_")) {
            localStorage.removeItem(key);
        }

    });

},

getLibrary() {
    return JSON.parse(localStorage.getItem("nutrition_library") || "[]");
},

saveLibrary(library) {
    localStorage.setItem("nutrition_library", JSON.stringify(library));
}

};