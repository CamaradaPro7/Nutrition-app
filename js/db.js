"use strict";

/* ==========================================================
   MI NUTRICIÓN NEXT V7
   db.js
========================================================== */

const DB = {

    db: null,

    name: "MiNutricionNEXT",

    version: 1,

    stores: {
        foods: "foods",
        days: "days",
        settings: "settings",
        backup: "backup"
    },

    async open() {

        if (this.db) return this.db;

        return new Promise((resolve, reject) => {

            const request = indexedDB.open(this.name, this.version);

            request.onupgradeneeded = (event) => {

                const db = event.target.result;

                Object.values(this.stores).forEach(store => {

                    if (!db.objectStoreNames.contains(store)) {

                        db.createObjectStore(store, {
                            keyPath: "id"
                        });

                    }

                });

            };

            request.onsuccess = (event) => {

                this.db = event.target.result;

                console.log("✅ IndexedDB iniciada");

                resolve(this.db);

            };

            request.onerror = () => {

                reject(request.error);

            };

        });

    },

    today() {

        return new Date().toISOString().slice(0, 10);

    },

    emptyDay() {

        return {

            id: this.today(),

            desayuno: [],

            comida: [],

            merienda: [],

            cena: []

        };

    }

};