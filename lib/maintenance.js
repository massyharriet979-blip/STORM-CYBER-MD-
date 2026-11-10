let on = false;
module.exports = { isOn:()=>on, on:()=>{on=true}, off:()=>{on=false}, toggle:()=>{on=!on; return on} };
