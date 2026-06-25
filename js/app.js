const comidas = [
  { id: "desayuno", nombre: "🍳 Desayuno" },
  { id: "comida", nombre: "🍝 Comida" },
  { id: "merienda", nombre: "🥪 Merienda" },
  { id: "cena", nombre: "🌙 Cena" }
];

const contenedor = document.getElementById("meals");

comidas.forEach(c => {
  contenedor.innerHTML += `
    <section class="card meal-card">
      <h2>${c.nombre}</h2>

      <div id="${c.id}-lista" class="meal-list"></div>

      <button class="addButton" onclick="abrirMenu('${c.id}')">
        ➕ Añadir alimento
      </button>
    </section>
  `;
});

document.body.insertAdjacentHTML("beforeend", `
<div id="menu" class="menu-fondo" onclick="cerrarMenu()">
  <div class="menu" onclick="event.stopPropagation()">

    <h3>Añadir alimento</h3>

    <button onclick="alert('📷 Próximamente: Escanear etiqueta')">
      📷 Escanear etiqueta
    </button>

    <button onclick="alert('🔍 Próximamente: Buscar alimento')">
      🔍 Buscar alimento
    </button>

    <button onclick="alert('✍️ Próximamente: Añadir manualmente')">
      ✍️ Añadir manualmente
    </button>

    <button class="cancelar" onclick="cerrarMenu()">
      Cancelar
    </button>

  </div>
</div>
`);

function abrirMenu(comida) {
  document.getElementById("menu").classList.add("visible");
}

function cerrarMenu() {
  document.getElementById("menu").classList.remove("visible");
}