const comidas = [
    "🍳 Desayuno",
    "🍝 Comida",
    "🥪 Merienda",
    "🌙 Cena"
];

const contenedor = document.getElementById("meals");

comidas.forEach(nombre => {

    contenedor.innerHTML += `
        <section class="card">

            <h2>${nombre}</h2>

            <button class="addButton">
                ＋ Añadir alimento
            </button>

        </section>
    `;

});