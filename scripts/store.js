// Impede alguns erros fáceis de cometer.
"use strict";

$(document).ready(displayPoints);

function displayPoints() {
    document.getElementsByClassName("ZPoints")[0].getElementsByTagName("span")[0].innerHTML = localStorage.getItem('zPoints');
}



function displayAllIcons(){
	document.getElementsByClassName("slideShowHolder")[0].style.display="flex"
}


function closeSlideShow(){
	document.getElementsByClassName("slideShowHolder")[0].style.display="none"
}