"use strict";

const Biblioteca={

foods:[],

render(){

console.log("📚 Biblioteca iniciada");

},

add(food){

this.foods.push(food);

},

all(){

return this.foods;

},

find(id){

return this.foods.find(

food=>food.id===id

);

},

exists(name){

return this.foods.find(

food=>

normalize(food.name)===

normalize(name)

);

}

};

console.log("✅ biblioteca.js cargado");