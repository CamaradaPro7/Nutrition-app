"use strict";

/* ==========================================================
   MI NUTRICIÓN NEXT
   db.js
   ========================================================== */

const DB = {

    __diag(msg){
        try{
            let el=document.getElementById("db-debug");
            if(!el){
                el=document.createElement("pre");
                el.id="db-debug";
                el.style.cssText="position:fixed;left:0;right:0;bottom:0;max-height:40%;overflow:auto;background:#111;color:#0f0;padding:8px;font-size:12px;z-index:99999;white-space:pre-wrap;";
                document.body.appendChild(el);
            }
            el.textContent += msg + "\n";
        }catch(e){}
    },


    db: null,
    name: "MiNutricionNEXT",
    version: 2,
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

                Object.values(this.stores).forEach((store) => {
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
    },

    async getDay(id) {
        await this.open();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.stores.days, "readonly");
            const store = tx.objectStore(this.stores.days);
            const request = store.get(id);

            request.onsuccess = () => { this.__diag("DB abierta");

    console.log("📖 Día leído", request.result);

    resolve(request.result || null);

};
            request.onerror = () => reject(request.error);
        });
    },

    async saveDay(day) {
        await this.open();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.stores.days, "readwrite");
            const store = tx.objectStore(this.stores.days);
            const request = store.put(day);

            request.onsuccess = () => { this.__diag("DB abierta");

    console.log("✅ Día guardado", day);

    resolve(day);

};
            request.onerror = () => reject(request.error);
        });
    },

    async getSettings() {
        await this.open();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.stores.settings, "readonly");
            const store = tx.objectStore(this.stores.settings);
            const request = store.get("app");

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    },

    async saveSettings(settings) {
        await this.open();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.stores.settings, "readwrite");
            const store = tx.objectStore(this.stores.settings);
            const payload = {
                id: "app",
                ...settings
            };
            const request = store.put(payload);

            request.onsuccess = () => resolve(payload);
            request.onerror = () => reject(request.error);
        });
    }
};