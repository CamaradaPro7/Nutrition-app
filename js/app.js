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

        const objetivoBase = this.getBaseCalories();
        const actividad = this.getActivity();
        const movimiento = actividad.movimiento || 0;
        const gastoTotal = actividad.caloriasTotales || 0; 
        const objetivoTotal = objetivoBase + movimiento;

        app.innerHTML = `
        <section class="card dashboard">
            <div class="dashboard-top">
                <div class="dashboard-copy">
                    <h1 class="title">${this.getGreeting()}</h1>
                    <p class="date">${this.formatDate()}</p>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="dashboard-left">
                    <div class="progress-wrap">
                        <button class="progress" type="button" onclick="App.openReport()">
                            <svg viewBox="0 0 220 220">
                                <circle class="progress-track" cx="110" cy="110" r="96"></circle>
                                <circle class="progress-ring" cx="110" cy="110" r="96"></circle>
                            </svg>
                            <div class="progress-center">
                                <div class="progress-value" id="kcalValue">0</div>
                                <div class="progress-label" id="kcalLabel">de ${objetivoTotal} kcal</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div class="dashboard-right">
                    <div class="dashboard-macros">
                        ${this.renderMacro("Proteínas", "🥩", "proteinas", this.state.settings.macros.proteinas, "g")}
                        ${this.renderMacro("Hidratos", "🍚", "hidratos", this.state.settings.macros.hidratos, "g")}
                        ${this.renderMacro("Grasas", "🥑", "grasas", this.state.settings.macros.grasas, "g")}
                    </div>
                </div>
            </div>
            
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-title">Objetivo</div>
                    <div class="stat-value">${objetivoBase} kcal</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Actividad</div>
                    <div class="stat-value">${movimiento} kcal</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Gasto</div>
                    <div class="stat-value">${gastoTotal} kcal</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Restantes</div>
                    <div class="stat-value">${this.getRemainingCalories()} kcal</div>
                </div>
            </div>
        </section>

        <section class="meals">
            ${this.mealCard("🍳", "Desayuno", "desayuno")}
            ${this.mealCard("🍝", "Comida", "comida")}
            ${this.mealCard("🍓", "Merienda", "merienda")}
            ${this.mealCard("🥗", "Cena", "cena")}
        </section>
        `;
    },

    renderMacro(label, emoji, key, target, unit) {
        const current = this.getMacroValue(key);
        const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;

        return `
            <article class="macro">
                <div class="macro-top">
                    <div class="macro-emoji">${emoji}</div>
                    <div class="macro-info">
                        <div class="macro-label">${label}</div>
                        <div class="macro-value">${Math.round(current)} ${unit}</div>
                    </div>
                </div>
                <div class="macro-bar">
                    <div class="macro-fill" style="width:${percent}%"></div>
                </div>
                <div class="macro-target">de ${target} ${unit}</div>
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
        const target = this.getTargetCalories();
        const pct = target > 0 ? Math.min(total / target, 1) : 0;
        const ring = document.querySelector(".progress-ring");
        const circumference = 2 * Math.PI * 96;

        if (ring) {
            ring.style.strokeDasharray = `${circumference * pct} ${circumference}`;
        }

        const kcalValue = document.getElementById("kcalValue");
        const kcalLabel = document.getElementById("kcalLabel");

        if (kcalValue) {
            kcalValue.textContent = Math.round(total);
        }

        if (kcalLabel) {
            kcalLabel.textContent = `de ${Math.round(target)} kcal`;
        }
    },

    refresh() {
        this.render();
        this.updateUI();
    },

    getCalories() {
        return this.getMealCalories("desayuno") + this.getMealCalories("comida") + this.getMealCalories("merienda") + this.getMealCalories("cena");
    },
    
    getTargetCalories() {
        const base = this.state.settings.objetivoKcal;
        const movimiento = this.state.day?.actividad?.movimiento || 0;
        return base + movimiento;
    },

    getBaseCalories() {
        return this.state.settings.objetivoKcal;
    },

    getActivity() {
        return this.state.day?.actividad || {
            movimiento: 0,
            ejercicio: 0,
            dePie: 0,
            caloriasTotales: 0
        };
    },

    getRemainingCalories() {
        return Math.max(0, this.getTargetCalories() - this.getCalories());
    },

    getMacroValue(key) {
        let total = 0;
        ["desayuno", "comida", "merienda", "cena"].forEach(meal => {
            (this.state.day[meal] || []).forEach(food => {
                total += Number(food[key] || 0);
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
                    <button class="action-btn" onclick="App.pasteFood('${meal}')">📋 Pegar desde ChatGPT</button>
                    <button class="action-btn" onclick="App.showLibrary('${meal}')">📚 Biblioteca</button>
                    <button class="action-btn" onclick="App.showFoods('${meal}')">📄 Ver alimentos</button>
                    <button class="action-btn danger" onclick="App.clearMeal('${meal}')">🗑 Vaciar comida</button>
                </div>
                <div class="mt-20 center">
                    <button onclick="App.closeModal()">Cerrar</button>
                </div>
            </div>
        `;
    },

    pasteFood(meal) {
        const modal = document.getElementById("modal");
        const titulo = meal.charAt(0).toUpperCase() + meal.slice(1);

        modal.innerHTML = `
            <div class="sheet">
                <h2>${titulo}</h2>
                <textarea id="foodText" placeholder="Pega aquí uno o varios alimentos copiados desde ChatGPT..." style="width:100%;height:260px;padding:16px;border:1px solid #ddd;border-radius:18px;font-size:16px;resize:none;"></textarea>
                <div class="mt-20">
                    <button class="action-btn" onclick="App.savePastedFood('${meal}')">Guardar alimentos</button>
                    <button class="action-btn danger" onclick="App.openMeal('${meal}')">Cancelar</button>
                </div>
            </div>
        `;
    },

    savePastedFood(meal) {
        const texto = document.getElementById("foodText").value.trim();
        if (!texto) return;

        const bloques = texto.split(/\n\s*\n/);
        const ahora = new Date();
        let biblioteca = DB.getLibrary();
        const fecha = ahora.toISOString().slice(0, 10);
        const hora = ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

        bloques.forEach(bloque => {
            const lineas = bloque.trim().split("\n");
            const nombre = lineas[0].trim();

            const numero = (valor) => parseFloat((valor || "0").replace(/\./g, "").replace(",", "."));

            const kcal = numero((bloque.match(/Calor[ií]as:\s*([\d.,]+)/i) || [])[1]);
            const proteinas = numero((bloque.match(/Prote[ií]nas:\s*([\d.,]+)/i) || [])[1]);

            let hidratos = 0;
            const carbo = bloque.match(/Carbohidratos:\s*([\d.,]+)/i);
            const hidra = bloque.match(/Hidratos:\s*([\d.,]+)/i);

            if (carbo) hidratos = numero(carbo[1]);
            else if (hidra) hidratos = numero(hidra[1]);

            const grasas = numero((bloque.match(/Grasas:\s*([\d.,]+)/i) || [])[1]);

            const existe = biblioteca.some(food => food.nombre.toLowerCase() === nombre.toLowerCase());

            if (!existe) {
                biblioteca.push({ nombre, kcal, proteinas, hidratos, grasas });
            }

            this.state.day[meal].push({
                nombre, kcal, proteinas, hidratos, grasas, fecha, hora, comida: meal, origen: bloque.trim()
            });
        });

        DB.saveLibrary(biblioteca);
        DB.saveDay(this.state.day);
        this.closeModal();
        this.refresh();
    },

    showLibrary(meal) {
        const biblioteca = [...DB.getLibrary()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
        const modal = document.getElementById("modal");

        modal.classList.remove("hidden");
        modal.innerHTML = `
            <div class="sheet">
                <h2>📚 Biblioteca</h2>
                <input id="librarySearch" type="text" placeholder="🔍 Buscar alimento..." oninput="App.filterLibrary()" style="width:100%;padding:12px;margin:15px 0;border:1px solid #ddd;border-radius:12px;font-size:16px;">
                <div class="food-list">
                    ${biblioteca.length ? biblioteca.map((food) => `
                        <div class="food-item" onclick="App.addLibraryFood('${meal}','${food.nombre}', this)" style="cursor:pointer;">
                            <div>
                                <div class="food-name">${food.nombre}</div>
                                <div class="food-kcal">${food.kcal} kcal · P ${food.proteinas} g · C ${food.hidratos} g · G ${food.grasas} g</div>
                            </div>
                            <button class="delete-btn" onclick="event.stopPropagation(); App.deleteLibraryFood('${food.nombre}','${meal}')">✕</button>
                        </div>
                    `).join("") : "<p class='text-center'>Biblioteca vacía</p>"}
                </div>
                <div class="mt-20">
                    <button class="action-btn" onclick="App.closeModal()">✅ Listo</button>
                </div>
            </div>
        `;
    },

    filterLibrary() {
        const search = document.getElementById('librarySearch').value.toLowerCase();
        document.querySelectorAll('.food-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(search) ? '' : 'none';
        });
    },

    addLibraryFood(meal, nombre, element) {
        const biblioteca = DB.getLibrary();
        const food = biblioteca.find(f => f.nombre === nombre);

        element.style.background = "#e8f6ea";
        element.style.transition = "0.2s";

        setTimeout(() => { element.style.background = ""; }, 200);

        if (!food) return;

        const ahora = new Date();
        this.state.day[meal].push({
            ...food,
            fecha: ahora.toISOString().slice(0, 10),
            hora: ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
            comida: meal
        });

        DB.saveDay(this.state.day);
        this.refresh();
    },

    deleteLibraryFood(nombre, meal) {
        if (!confirm("¿Eliminar este alimento de la biblioteca?")) return;
        let biblioteca = DB.getLibrary().filter(food => food.nombre !== nombre);
        DB.saveLibrary(biblioteca);
        this.showLibrary(meal);
    },

    showFoods(meal) {
        const modal = document.getElementById("modal");
        const foods = this.state.day[meal] || [];
        const titulo = meal.charAt(0).toUpperCase() + meal.slice(1);

        modal.classList.remove("hidden");
        modal.innerHTML = `
            <div class="sheet">
                <h2>${titulo}</h2>
                <div class="food-list">
                    ${foods.length ? foods.map((food, index) => `
                        <div class="food-item">
                            <div>
                                <div class="food-name">${food.nombre}</div>
                                <div class="food-kcal">🕒 ${food.hora || "--:--"}<br>${food.kcal} kcal · P ${food.proteinas} g · C ${food.hidratos} g · G ${food.grasas} g</div>
                            </div>
                            <div style="display:flex;flex-direction:column;gap:6px;">
                                <button class="delete-btn" onclick="App.editFood('${meal}',${index})">✏️</button>
                                <button class="delete-btn" onclick="App.deleteFood('${meal}',${index})">✕</button>
                            </div>
                        </div>
                    `).join("") : "<p class='text-center'>Sin alimentos</p>"}
                </div>
                <div class="mt-20">
                    <button class="action-btn" onclick="App.pasteFood('${meal}')">📋 Añadir alimentos</button>
                    <button class="action-btn danger" onclick="App.closeModal()">Cerrar</button>
                </div>
            </div>
        `;
    },

    deleteFood(meal, index) {
        this.state.day[meal].splice(index, 1);
        DB.saveDay(this.state.day);
        this.showFoods(meal);
        this.refresh();
    },

    editFood(meal, index) {
        const food = this.state.day[meal][index];
        const nombre = food.nombre;

        let unidad = "";
        let cantidad = "";

        let match = nombre.match(/(\d+(?:[.,]\d+)?)\s*g\b/i);

        if (match) {
            unidad = "g";
            cantidad = match[1].replace(",", ".");
        } else {
            match = nombre.match(/(\d+(?:[.,]\d+)?)\s*ml\b/i);
            if (match) {
                unidad = "ml";
                cantidad = match[1].replace(",", ".");
            } else {
                match = nombre.match(/(\d+(?:[.,]\d+)?)\s*raci[oó]n(?:es)?/i);
                if (match) {
                    unidad = "raciones";
                    cantidad = match[1].replace(",", ".");
                }
            }
        }

        const modal = document.getElementById("modal");
        modal.classList.remove("hidden");
        modal.innerHTML = `
            <div class="sheet">
                <h2>Editar cantidad</h2>
                <p style="margin:20px 0;font-weight:600;">${nombre}</p>
                ${unidad ? `
                    <input id="editCantidad" type="number" step="0.1" value="${cantidad}" style="width:100%;padding:14px;font-size:18px;border-radius:12px;border:1px solid #ccc;">
                    <p style="margin-top:10px;text-align:center;">${unidad}</p>
                ` : `<p>Este alimento todavía no se puede editar automáticamente.</p>`}
                <div class="mt-20">
                    <button class="action-btn" onclick="App.showFoods('${meal}')">Cancelar</button>
                    <button class="action-btn" onclick="App.saveEditedFood('${meal}',${index},'${unidad}')">Guardar</button>
                </div>
            </div>
        `;
    },

    saveEditedFood(meal, index, unidad) {
        const food = this.state.day[meal][index];
        const nuevo = parseFloat(document.getElementById("editCantidad").value.replace(",", "."));

        if (isNaN(nuevo) || nuevo <= 0) {
            alert("Cantidad no válida");
            return;
        }

        let match;
        if (unidad === "g") match = food.nombre.match(/(\d+(?:[.,]\d+)?)\s*g/i);
        else if (unidad === "ml") match = food.nombre.match(/(\d+(?:[.,]\d+)?)\s*ml/i);
        else match = food.nombre.match(/(\d+(?:[.,]\d+)?)\s*raci[oó]n(?:es)?/i);

        if (!match) {
            alert("No se pudo calcular.");
            return;
        }

        const anterior = parseFloat(match[1].replace(",", "."));
        const factor = nuevo / anterior;

        food.kcal = +(food.kcal * factor).toFixed(1);
        food.proteinas = +(food.proteinas * factor).toFixed(1);
        food.hidratos = +(food.hidratos * factor).toFixed(1);
        food.grasas = +(food.grasas * factor).toFixed(1);

        if (unidad === "g") {
            food.nombre = food.nombre.replace(/(\d+(?:[.,]\d+)?)\s*g/i, `${nuevo} g`);
        } else if (unidad === "ml") {
            food.nombre = food.nombre.replace(/(\d+(?:[.,]\d+)?)\s*ml/i, `${nuevo} ml`);
        } else {
            const texto = nuevo === 1 ? "ración" : "raciones";
            food.nombre = food.nombre.replace(/(\d+(?:[.,]\d+)?)\s*raci[oó]n(?:es)?/i, `${nuevo} ${texto}`);
        }

        DB.saveDay(this.state.day);
        this.showFoods(meal);
        this.refresh();
    },

    clearMeal(meal) {
        if (!confirm("¿Vaciar esta comida?")) return;
        this.state.day[meal] = [];
        DB.saveDay(this.state.day);
        this.refresh();
        this.closeModal();
    },

    closeModal() {
        const modal = document.getElementById("modal");
        modal.classList.add("hidden");
        modal.innerHTML = "";
    },

    openReport() {
        const total = this.getCalories();
        const objetivo = this.getTargetCalories();
        const actividad = this.getActivity();
        const restante = this.getRemainingCalories();

        const proteinas = Number(this.getMacroValue("proteinas").toFixed(1));
        const hidratos = Number(this.getMacroValue("hidratos").toFixed(1));
        const grasas = Number(this.getMacroValue("grasas").toFixed(1));

        const comidas = [
            { icono: "🍳", titulo: "Desayuno", key: "desayuno" },
            { icono: "🍝", titulo: "Comida", key: "comida" },
            { icono: "🍓", titulo: "Merienda", key: "merienda" },
            { icono: "🥗", titulo: "Cena", key: "cena" }
        ];

        const rowStyle = "display:flex; justify-content:space-between; align-items:center; padding:6px 0;";
        const boxStyle = "background:#f8f9fa; border-radius:12px; padding:12px; margin-top:16px;";

        let html = `
        <div class="sheet">
            <h2 style="text-align:center; margin-bottom:4px;">Resumen diario</h2>
            <p style="text-align:center; color:#666; margin:0 0 16px 0;">📅 ${this.formatDate()}</p>

            <div style="text-align:center; margin-bottom:16px;">
                <span style="font-size:28px; font-weight:bold;">🔥 ${Math.round(total)}</span>
                <span style="font-size:18px; color:#666;"> / ${Math.round(objetivo)} kcal</span>
            </div>

            <div style="${boxStyle}">
                <div style="${rowStyle}"><span>🎯 Objetivo base</span><strong>${this.getBaseCalories()} kcal</strong></div>
                <div style="${rowStyle}"><span>🏃 Actividad</span><strong>+${actividad.movimiento} kcal</strong></div>
                <div style="${rowStyle}"><span>✅ Restantes</span><strong>${Math.round(restante)} kcal</strong></div>
            </div>

            <div style="${boxStyle}">
                <div style="${rowStyle}"><span>🚶 Movimiento</span><strong>${actividad.movimiento} kcal</strong></div>
                <div style="${rowStyle}"><span>🏋️ Ejercicio</span><strong>${actividad.ejercicio} min</strong></div>
                <div style="${rowStyle}"><span>🧍 De pie</span><strong>${actividad.dePie} h</strong></div>
                <div style="${rowStyle}"><span>🕒 Actualizado</span><strong>${actividad.actualizada || "--:--"}</strong></div>
            </div>

            <div style="${boxStyle}">
                <div style="${rowStyle}"><span>🥩 Proteínas</span><strong>${proteinas} / ${this.state.settings.macros.proteinas} g</strong></div>
                <div style="${rowStyle}"><span>🍚 Hidratos</span><strong>${hidratos} / ${this.state.settings.macros.hidratos} g</strong></div>
                <div style="${rowStyle}"><span>🥑 Grasas</span><strong>${grasas} / ${this.state.settings.macros.grasas} g</strong></div>
            </div>

            <hr style="margin:20px 0; border:0; border-top:1px solid #eee;">
        `;

        comidas.forEach(comida => {
            const foods = this.state.day[comida.key] || [];
            let totalMeal = 0;

            html += `
            <div style="margin-top:16px;">
                <h3 style="margin-bottom:8px; font-size:18px;">${comida.icono} ${comida.titulo}</h3>
            `;

            if (!foods.length) {
                html += `<div style="color:#888; font-size:14px; padding:4px 0;">Sin alimentos</div>`;
            } else {
                foods.forEach(food => {
                    const kcalItem = Number(food.kcal || 0);
                    totalMeal += kcalItem;

                    html += `
                    <div style="${rowStyle} border-bottom:1px solid #f0f0f0;">
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:500;">${food.nombre}</span>
                            <span style="color:#888; font-size:12px;">🕒 ${food.hora || "--:--"}</span>
                        </div>
                        <div style="font-weight:600;">${kcalItem} kcal</div>
                    </div>
                    `;
                });

                html += `
                <div style="${rowStyle} font-weight:bold; margin-top:4px;">
                    <span>Total ${comida.titulo.toLowerCase()}</span>
                    <span>${Number(totalMeal.toFixed(1))} kcal</span>
                </div>
                `;
            }

            html += `</div>`;
        });

        html += `
            <div class="mt-20" style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
                <button class="action-btn" onclick="App.showActivityPaste()">🏃 Actualizar actividad</button>
                <button class="action-btn" onclick="App.copyReport()">📋 Copiar para ChatGPT</button>
                <button class="action-btn danger" onclick="App.closeModal()">Cerrar</button>
            </div>
        </div>
        `;

        const modal = document.getElementById("modal");
        modal.classList.remove("hidden");
        modal.innerHTML = html;
    },

    showActivityPaste() {
        const modal = document.getElementById("modal");
        modal.classList.remove("hidden");
        modal.innerHTML = `
        <div class="sheet">
            <h2 class="text-center">🏃 Cargar actividad</h2>
            <p class="text-center" style="font-size:14px;color:#666;margin-bottom:16px;">Sube una captura de pantalla de Apple Salud / Fitness o pega el informe en texto.</p>
            
            <div style="display:flex;flex-direction:column;gap:12px;">
                <label class="action-btn" style="text-align:center;cursor:pointer;background:#4a90e2;color:#fff;">
                    📷 Seleccionar captura de pantalla
                    <input type="file" id="imageInput" accept="image/*" style="display:none;" onchange="App.processScreenshot(event)">
                </label>
                <div id="ocrStatus" style="text-align:center;font-size:14px;color:#007aff;font-weight:600;display:none;"></div>
            </div>

            <div style="margin:16px 0;text-align:center;color:#aaa;font-size:12px;">— O PEGA EL TEXTO —</div>

            <textarea id="activityInput" rows="6" style="width:100%;border-radius:12px;padding:10px;border:1px solid #ddd;" placeholder="Movimiento 357 kcal&#10;Ejercicio 60 min&#10;De pie 6 h&#10;Calorías totales 1119 kcal"></textarea>
            
            <div class="mt-20" style="margin-top:16px;">
                <button class="action-btn" onclick="App.importActivity()">Actualizar actividad</button>
                <button class="action-btn danger" onclick="App.closeModal()">Cancelar</button>
            </div>
        </div>`;
    },

    async processScreenshot(event) {
        const file = event.target.files[0];
        if (!file) return;

        const statusDiv = document.getElementById("ocrStatus");
        statusDiv.style.display = "block";
        statusDiv.textContent = "⌛ Leyendo captura de pantalla...";

        try {
            if (typeof Tesseract === "undefined") {
                throw new Error("Librería Tesseract.js no cargada.");
            }

            const worker = await Tesseract.createWorker("spa");
            const ret = await worker.recognize(file);
            await worker.terminate();

            const text = ret.data.text;
            this.parseOCRText(text);
            statusDiv.textContent = "✅ ¡Datos extraídos con éxito!";
        } catch (error) {
            console.error(error);
            statusDiv.style.color = "#d9534f";
            statusDiv.textContent = "❌ Error al leer la imagen. Inténtalo pegando texto.";
        }
    },

    parseOCRText(rawText) {
        let movimiento = 0;
        let ejercicio = 0;
        let dePie = 0;
        let caloriasTotales = 0;

        // 1. Movimiento (ej. 357/600 KCAL o Movimiento 357)
        const matchMov = rawText.match(/Movimiento[\s\S]*?(\d+)\s*\/\s*\d+/i) || rawText.match(/Movimiento[:\s]+(\d+)/i) || rawText.match(/(\d+)\s*\/\s*\d+\s*KCAL/i);
        if (matchMov) movimiento = parseFloat(matchMov[1]);

        // 2. Calorías totales / Gasto (ej. TOTAL: 1119 KCAL o Calorias totales 1119)
        const matchTot = rawText.match(/TOTAL:\s*(\d+)\s*KCAL/i) || rawText.match(/Calor[ií]as\s*totales[:\s]+(\d+)/i);
        if (matchTot) caloriasTotales = parseFloat(matchTot[1]);

        // 3. Ejercicio (ej. 60/30 MIN o Ejercicio 60)
        const matchEjer = rawText.match(/Ejercicio[\s\S]*?(\d+)\s*\/\s*\d+/i) || rawText.match(/Ejercicio[:\s]+(\d+)/i) || rawText.match(/(\d+)\s*\/\s*\d+\s*MIN/i);
        if (matchEjer) ejercicio = parseFloat(matchEjer[1]);

        // 4. De pie (ej. 6/12 H o De pie 6)
        const matchPie = rawText.match(/De\s*pie[\s\S]*?(\d+)\s*\/\s*\d+/i) || rawText.match(/De\s*pie[:\s]+(\d+)/i) || rawText.match(/(\d+)\s*\/\s*\d+\s*H/i);
        if (matchPie) dePie = parseFloat(matchPie[1]);

        // Autocompletar el campo de texto con los resultados estructurados
        let resultText = `Movimiento ${movimiento} kcal\n`;
        resultText += `Ejercicio ${ejercicio} min\n`;
        resultText += `De pie ${dePie} h\n`;
        if (caloriasTotales) resultText += `Calorías totales ${caloriasTotales} kcal`;

        document.getElementById("activityInput").value = resultText;
    },

    importActivity() {
        const texto = document.getElementById("activityInput").value.trim();

        if (!texto) {
            this.toast("No hay información de actividad para actualizar");
            return;
        }

        const numero = (regex) => {
            const m = texto.match(regex);
            return m ? parseFloat(m[1].replace(",", ".")) : 0;
        };

        const movimiento = numero(/Movimiento:\s*([\d.,]+)/i) || numero(/Movimiento\s+([\d.,]+)/i);
        const ejercicio = numero(/Ejercicio:\s*([\d.,]+)/i) || numero(/Ejercicio\s+([\d.,]+)/i);
        const dePie = numero(/De pie:\s*([\d.,]+)/i) || numero(/De pie\s+([\d.,]+)/i);
        const caloriasTotales = numero(/Calor[ií]as totales:\s*([\d.,]+)/i) || numero(/Calor[ií]as totales\s+([\d.,]+)/i);

        if (!this.state.day.actividad) {
            this.state.day.actividad = {};
        }

        this.state.day.actividad = {
            movimiento,
            ejercicio,
            dePie,
            caloriasTotales,
            actualizada: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
        };

        DB.saveDay(this.state.day);
        this.closeModal();
        this.refresh();
        this.toast("Actividad actualizada");
    },

    copyReport() {
        const actividad = this.getActivity();
        const objetivoBase = this.getBaseCalories();
        const objetivo = this.getTargetCalories();
        const consumido = this.getCalories();
        const restante = this.getRemainingCalories();
        const proteinas = this.getMacroValue("proteinas");
        const hidratos = this.getMacroValue("hidratos");
        const grasas = this.getMacroValue("grasas");

        let texto = "RESUMEN DIARIO\n\n";
        texto += this.formatDate() + "\n\n";
        texto += "🔥 NUTRICIÓN\n\n";
        texto += `Consumido: ${consumido.toFixed(1)} kcal\n\n`;
        texto += "🏃 ACTIVIDAD\n\n";
        texto += `Movimiento: ${actividad.movimiento} kcal\n`;
        texto += `Ejercicio: ${actividad.ejercicio} min\n`;
        texto += `De pie: ${actividad.dePie} h\n`;
        texto += `Actualizado: ${actividad.actualizada || "--:--"}\n\n`;
        texto += "🎯 BALANCE\n\n";
        texto += `Objetivo base: ${objetivoBase} kcal\n`;
        texto += `Actividad: +${actividad.movimiento} kcal\n`;
        texto += `Objetivo hoy: ${objetivo} kcal\n`;
        texto += `Restantes: ${restante.toFixed(1)} kcal\n\n`;
        texto += `Proteínas: ${proteinas.toFixed(1)} g\n`;
        texto += `Hidratos: ${hidratos.toFixed(1)} g\n`;
        texto += `Grasas: ${grasas.toFixed(1)} g\n\n`;

        const comidas = [
            { titulo: "DESAYUNO", key: "desayuno" },
            { titulo: "COMIDA", key: "comida" },
            { titulo: "MERIENDA", key: "merienda" },
            { titulo: "CENA", key: "cena" }
        ];

        comidas.forEach(comida => {
            texto += comida.titulo + "\n";
            const foods = this.state.day[comida.key] || [];

            if (!foods.length) {
                texto += "Sin alimentos\n\n";
                return;
            }

            let total = 0;
            foods.forEach(food => {
                total += Number(food.kcal || 0);
                texto += `• ${food.hora || "--:--"} - ${food.nombre} (${food.kcal} kcal)\n`;
            });

            texto += `Total ${comida.titulo.toLowerCase()}: ${Number(total.toFixed(1))} kcal\n\n`;
        });

        navigator.clipboard.writeText(texto);
        this.toast("Resumen copiado");
    },

    toast(message) {
        alert(message);
    }
};

document.addEventListener("DOMContentLoaded", () => App.init());
