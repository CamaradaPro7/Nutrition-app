const STORAGE_KEY="mi-nutricion-v2";

let data=JSON.parse(localStorage.getItem(STORAGE_KEY))||{

objetivo:2600,

totales:{
kcal:0,
proteinas:0,
hidratos:0,
grasas:0
},

meals:{
desayuno:[],
comida:[],
merienda:[],
cena:[]
}

};

function save(){

localStorage.setItem(STORAGE_KEY,JSON.stringify(data));

}

function addFood(meal,food,grams){

const factor=grams/100;

const item={

nombre:food.name,

gramos:grams,

kcal:Math.round(food.kcal*factor),

proteinas:Number((food.p*factor).toFixed(1)),

hidratos:Number((food.c*factor).toFixed(1)),

grasas:Number((food.g*factor).toFixed(1))

};

data.meals[meal].push(item);

recalculate();

save();

}

function recalculate(){

data.totales={

kcal:0,
proteinas:0,
hidratos:0,
grasas:0

};

Object.values(data.meals).forEach(meal=>{

meal.forEach(food=>{

data.totales.kcal+=food.kcal;
data.totales.proteinas+=food.proteinas;
data.totales.hidratos+=food.hidratos;
data.totales.grasas+=food.grasas;

});

});

}

recalculate();