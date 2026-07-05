"use strict";

const $=id=>document.getElementById(id);

const $$=selector=>[...document.querySelectorAll(selector)];

function uid(){

return Date.now()+Math.floor(Math.random()*100000);

}

function number(value){

return Number(

String(value)

.replace(",", ".")

.replace(/[^\d.-]/g,"")

)||0;

}

function normalize(text){

return String(text||"")

.normalize("NFD")

.replace(/[\u0300-\u036f]/g,"")

.toLowerCase()

.trim();

}

function formatDate(date){

const text=date.toLocaleDateString(

"es-ES",

{

weekday:"long",

day:"numeric",

month:"long",

year:"numeric"

}

);

return text.charAt(0).toUpperCase()+text.slice(1);

}

function toast(text){

let box=$("toast");

if(!box){

box=document.createElement("div");

box.id="toast";

document.body.appendChild(box);

}

box.textContent=text;

box.className="toast show";

clearTimeout(box.timer);

box.timer=setTimeout(()=>{

box.classList.remove("show");

},1800);

}

console.log("✅ utilidades.js cargado");