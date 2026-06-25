// ========= Mi Nutrición V3 =========

const meals = [
  { id: "desayuno", icon: "🍳", name: "Desayuno" },
  { id: "comida", icon: "🍝", name: "Comida" },
  { id: "merienda", icon: "🥪", name: "Merienda" },
  { id: "cena", icon: "🌙", name: "Cena" }
];

const foods = [
  { name: "Pechuga de pollo", kcal:110, protein:23, carbs:0, fat:1.5 },
  { name: "Arroz blanco", kcal:130, protein:2.7, carbs:28, fat:0.3 },
  { name: "Patata cocida", kcal:87, protein:2, carbs:20, fat:0.1 },
  { name: "Avena", kcal:370, protein:13, carbs:60, fat:7 },
  { name: "Plátano", kcal:89, protein:1.1, carbs:23, fat:0.3 },
  { name: "Huevo", kcal:155, protein:13, carbs:1.1, fat:11 },
  { name: "Salmón", kcal:208, protein:20, carbs:0, fat:13 },
  { name: "Atún", kcal:116, protein:26, carbs:0, fat:1 },
  { name: "Yogur griego", kcal:97, protein:9, carbs:4, fat:5 }
];

const fecha = document.getElementById("fecha");
const mealsContainer = document.getElementById("meals");
const modal = document.getElementById("foodModal");
const foodList = document.getElementById("foodList");
const searchInput = document.getElementById("searchInput");

fecha.textContent = new Date().toLocaleDateString("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

function renderMeals() {

  mealsContainer.innerHTML = "";

  meals.forEach(meal => {

    mealsContainer.innerHTML += `
      <section class="meal">

        <div class="meal-header">

          <div>

            <div class="meal-title">
              ${meal.icon} ${meal.name}
            </div>

            <div class="meal-sub">
              Sin alimentos
            </div>

          </div>

          <button
          class="add-btn"
          onclick="openMeal('${meal.id}')">
          +
          </button>

        </div>

      </section>
    `;

  });

}

function renderFoods(filter=""){

  foodList.innerHTML="";

  foods
  .filter(f=>f.name.toLowerCase().includes(filter.toLowerCase()))
  .forEach(food=>{

    foodList.innerHTML+=`

      <div class="food">

        <div class="food-name">
          ${food.name}
        </div>

        <div class="food-info">

          ${food.kcal} kcal ·
          ${food.protein}P ·
          ${food.carbs}C ·
          ${food.fat}G

        </div>

      </div>

    `;

  });

}

function openMeal(meal){

  modal.classList.remove("hidden");

  searchInput.value="";

  renderFoods();

}

document
.getElementById("closeModal")
.onclick=()=>{

modal.classList.add("hidden");

};

searchInput.oninput=()=>{

renderFoods(searchInput.value);

};

renderMeals();

renderFoods();