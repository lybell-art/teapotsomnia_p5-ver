let today = new Date();   
let hours = today.getHours();

const bodyTag=document.getElementsByTagName("body")[0];
if(between(hours,10,14)) bodyTag.classList.add('noon');
else if(between(hours,0,6) || between(hours,21,24)) bodyTag.classList.add('midnight');
