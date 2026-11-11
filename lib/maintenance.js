let on = false;
export default { isOn:()=>on, on:()=>{on=true}, off:()=>{on=false}, toggle:()=>{on=!on; return on} };
