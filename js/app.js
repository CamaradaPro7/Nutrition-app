"use strict";

const App={

state:{

date:DB.today(),

foods:[],

meals:DB.emptyDay(),

settings:{

kcalGoal:2200

}

},

async init(){

try{

await DB.open();

Dashboard.render();

console.log("✅ Mi Nutrición NEXT V7 iniciada");

}

catch(error){

console.error(error);

document.body.innerHTML=`

<h2 style="padding:40px;text-align:center">

Error al iniciar la aplicación

</h2>

`;

}

}

};

document.addEventListener(

"DOMContentLoaded",

()=>App.init()

);